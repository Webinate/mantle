import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { Db, ObjectId, Collection } from 'mongodb';
import Controller from './controller';
import { IDocument } from '../types/models/i-document';
import { IDraft } from '../types/models/i-draft';
import { Error404, Error400, Error403 } from '../utils/errors';
import { ITemplate } from '../types/models/i-template';
import { IDraftElement } from '../types/models/i-draft-elements';
import { buildHtml, transformElmHtml } from './build-html';
import { ElementType } from '../core/enums';

export type GetOptions = {
  docId: string | ObjectId;
  checkPermissions?: { userId: ObjectId };
};

/**
 * Class responsible for managing documents
 */
export class DocumentsController extends Controller {
  private _docs: Collection<IDocument<'server'>>;
  private _drafts: Collection<IDraft<'server'>>;
  private _templates: Collection<ITemplate<'server'>>;
  private _elementsCollection: Collection<IDraftElement<'server'>>;

  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize(db: Db) {
    this._docs = await db.collection('documents');
    this._templates = await db.collection('templates');
    this._drafts = await db.collection('drafts');
    this._elementsCollection = await db.collection('elements');

    return this;
  }

  /**
   * Changes the document template, as well as the current draft's
   * @param options The options for finding the resource
   * @param templateId The id of the template to change to
   */
  async changeTemplate(findDocOptions: GetOptions, templateId: ObjectId) {
    const docsCollection = this._docs;
    const templatesCollection = this._templates;

    const doc = await docsCollection.findOne({ _id: new ObjectId(findDocOptions.docId) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findDocOptions.checkPermissions)
      if (doc.author && !doc.author.equals(findDocOptions.checkPermissions.userId)) throw new Error403();

    const template = await templatesCollection.findOne({ _id: templateId } as ITemplate<'server'>);
    if (!template) throw new Error404('Template not found');

    await docsCollection.updateOne({ _id: doc._id } as IDocument<'server'>, { $set: { template: templateId } });
    return true;
  }

  async publishDraft(documentId: ObjectId) {
    const document = await this._docs.findOne({ _id: documentId } as IDocument<'server'>);

    if (!document) throw new Error404();

    const draftJson = await this.getDocHtml(documentId);

    const draftsCollection = this._drafts;
    const draftInsertResult = await draftsCollection.insertOne({
      createdOn: Date.now(),
      html: draftJson,
      parent: document._id
    } as IDraft<'server'>);

    const insertedDraft = await draftsCollection.findOne({ _id: draftInsertResult.insertedId } as IDraft<'server'>);
    return insertedDraft!;
  }

  /**
   * Fetches all documents
   */
  async getMany() {
    const docsCollection = this._docs;
    const selector: Partial<IDocument<'server'>> = {};

    // Save the new entry into the database
    const [count, documents] = await Promise.all([
      docsCollection.count(selector),
      docsCollection.find(selector, { skip: 0 }).toArray()
    ]);

    const toRet: Page<IDocument<'server'>> = {
      limit: -1,
      count,
      index: 0,
      data: documents
    };

    return toRet;
  }

  async addElement(findOptions: GetOptions, token: Partial<IDraftElement<'server'>>, index?: number) {
    const docsCollection = this._docs;
    const templatesCollection = this._templates;
    const doc = await docsCollection.findOne({ _id: new ObjectId(findOptions.docId) } as IDocument<'server'>);

    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.author && !doc.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    if (!token.type) throw new Error400('You must specify an element type');

    token.parent = doc._id;

    // let draftModel: Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    // try {
    //   draftModel = ModelFactory.get(token.type) as Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    // } catch (err) {
    //   throw new Error400('Type not recognised');
    // }

    if (!token.zone) {
      const templateSchema = await templatesCollection.findOne({ _id: doc.template } as ITemplate<'server'>);
      if (templateSchema) token.zone = templateSchema.defaultZone;
    }

    token.html = transformElmHtml(token);

    const inertResult = await this._elementsCollection.insertOne(token as IDraftElement<'server'>);
    const insertedElm = await this._elementsCollection.findOne({ _id: inertResult.insertedId } as IDraftElement<
      'server'
    >);
    const elementsOrder = doc.elementsOrder;

    if (index === undefined) index = elementsOrder.length;
    else if (index < 0) index = elementsOrder.length;
    else if (index > elementsOrder.length) index = elementsOrder.length;

    doc.elementsOrder.splice(index, 0, insertedElm!._id);
    await docsCollection.updateOne({ _id: doc._id } as IDocument<'server'>, {
      $set: { elementsOrder: doc.elementsOrder } as IDocument<'server'>
    });

    return insertedElm!;
  }

  async getDraft(id: string | ObjectId) {
    const draftsCollection = this._drafts;

    const draft = await draftsCollection.findOne({ _id: new ObjectId(id) } as IDraft<'server'>);
    if (!draft) throw new Error404('Draft not found');

    return draft;
  }

  async removeElement(findOptions: GetOptions, elementId: ObjectId) {
    const docsCollection = this._docs;

    const doc = await docsCollection.findOne({ _id: new ObjectId(findOptions.docId) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.author && !doc.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    const elm = await this._elementsCollection.findOne({ _id: elementId } as IDraftElement<'server'>);
    if (!elm) throw new Error404();

    await this._elementsCollection.deleteOne({ _id: elementId } as IDraftElement<'server'>);
    await docsCollection.updateMany({ _id: doc._id } as IDocument<'server'>, {
      $pull: { elementsOrder: [elementId] }
    });
  }

  async updateElement(findOptions: GetOptions, token: Partial<IDraftElement<'server'>>) {
    // Remove any attempt to change the parent
    delete token.parent;

    const selector = { _id: token._id } as IDraftElement<'server'>;
    const json = await this._elementsCollection.findOne<IDraftElement<'server'>>(selector);

    if (!json) throw new Error404();

    if (token.type && json.type !== token.type) throw new Error400('You cannot change an element type');

    const docsCollection = this._docs;
    const doc = await docsCollection.findOne({ _id: new ObjectId(findOptions.docId) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.author && !doc.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    token.html = transformElmHtml(token);

    await this._elementsCollection.updateOne(selector, { $set: token });
    const updatedJson = await this._elementsCollection.findOne(selector);

    return updatedJson!;
  }

  async remove(id: string | ObjectId) {
    if (!ObjectId.isValid(id)) throw new Error400(`Please use a valid object id`);

    const doc = await this._docs.findOne({ _id: new ObjectId(id) } as IDocument<'server'>);
    if (!doc) throw new Error404(`Could not find document`);

    // // Remove all draft elements
    // const drafts = await this._drafts.find({ parent: doc._id } as IDraft<'server'>).toArray();
    // await Promise.all(
    //   drafts.map(draft => this._elementsCollection.remove({ parent: draft._id } as IDraftElement<'server'>))
    // );

    await this._elementsCollection.deleteOne({ parent: doc._id } as IDraftElement<'server'>);

    await this._drafts.deleteOne({ parent: doc._id } as IDraft<'server'>);
    await this._docs.deleteOne({ _id: doc._id } as IDocument<'server'>);
  }

  /**
   * Creates a new document
   */
  async create(author?: ObjectId | null) {
    // Get the templates
    const templates = await this._templates.find({}).toArray();
    const firstTemplate = templates[0]._id;

    // Create the doc token
    const token: Partial<IDocument<'server'>> = {
      createdOn: Date.now(),
      lastUpdated: Date.now(),
      template: firstTemplate,
      author: author ? author : null
    };

    // Create the doc
    const insertionResult = await this._docs.insertOne(token as IDocument<'server'>);
    let newDocument = await this._docs.findOne({ _id: insertionResult.insertedId } as IDocument<'server'>);

    // Create the first element
    const elmInsertionResult = await this._elementsCollection.insertOne({
      html: '<p></p>',
      parent: newDocument!._id,
      type: ElementType.paragraph,
      zone: templates[0].defaultZone
    } as IDraftElement<'server'>);
    const firstElm = await this._elementsCollection.findOne({ _id: elmInsertionResult.insertedId } as IDraftElement<
      'server'
    >);

    // Update the doc with the default element
    const firstElmId = firstElm!._id;

    // Update the doc with the element in the template map
    await this._docs.updateOne({ _id: newDocument!._id } as IDocument<'server'>, {
      $set: { elementsOrder: [firstElmId] }
    });

    const draftJson = await this.getDocHtml(newDocument!._id);

    // Now create the draft
    await this._drafts.insertOne({
      createdOn: Date.now(),
      parent: newDocument!._id,
      html: draftJson
    } as IDraft<'server'>);

    newDocument = await this._docs.findOne({ _id: insertionResult.insertedId } as IDocument<'server'>);
    return newDocument!;
  }

  /**
   * Gets a document by its name or ID
   */
  async get(options: GetOptions) {
    const docModel = this._docs;
    const searchQuery: Partial<IDocument<'server'>> = {
      _id: new ObjectId(options.docId)
    };

    const result = await docModel.findOne(searchQuery);

    if (!result) return null;
    else {
      if (options.checkPermissions) {
        if (result.author && !result.author.equals(options.checkPermissions.userId)) throw new Error403();
      }

      return result;
    }
  }

  async getElement(elmId: ObjectId) {
    const searchQuery: Partial<IDraftElement<'server'>> = {
      _id: elmId
    };
    const elementsCollection = this._elementsCollection;
    const element = await elementsCollection.findOne(searchQuery);
    return element;
  }

  async getElements(document: ObjectId | string) {
    const searchQuery: Partial<IDraftElement<'server'>> = {
      parent: new ObjectId(document)
    };
    const elementsCollection = this._elementsCollection;
    const elements = await elementsCollection.find(searchQuery).toArray();
    return elements;
  }

  /**
   * Populates a draft json with its elements
   */
  async getDocHtml(docId: ObjectId | string) {
    const doc = await this._docs.findOne({ _id: docId } as IDocument<'server'>);
    if (!doc) throw new Error404();

    const elementsFromDb = await this._elementsCollection
      .find({ parent: new ObjectId(docId) } as IDraftElement<'server'>)
      .toArray();

    const elements =
      doc.elementsOrder.map(elmId => {
        const objectId = new ObjectId(elmId);
        return elementsFromDb.find(elm => objectId.equals(elm._id))!;
      }) || [];
    const htmlMap: { [zone: string]: string } = {};

    const htmlElements = await Promise.all(elements.map(elm => buildHtml(elm)));

    for (let i = 0; i < elements.length; i++) {
      let elm = elements[i];
      elm.html = htmlElements[i];

      if (!htmlMap[elm.zone]) htmlMap[elm.zone] = elm.html;
      else htmlMap[elm.zone] += elm.html;
    }

    return htmlMap;
  }
}
