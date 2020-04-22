import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { Db, ObjectID, ObjectId, Collection } from 'mongodb';
import Controller from './controller';
import { IDocument } from '../types/models/i-document';
import { IDraft } from '../types/models/i-draft';
import { ISchemaOptions } from '../types/misc/i-schema-options';
import { Error404, Error400, Error403 } from '../utils/errors';
import { ITemplate } from '../types/models/i-template';
import { IDraftElement } from '../types/models/i-draft-elements';
import { buildHtml } from './build-html';
import { ElementType } from '../core/enums';

export type GetOptions = {
  id: string | ObjectID;
  checkPermissions?: { userId: ObjectID };
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
  async changeTemplate(findDocOptions: GetOptions, templateId: string, schemaOptions?: Partial<ISchemaOptions>) {
    const docsCollection = this._docs;
    const templatesCollection = this._templates;

    const doc = await docsCollection.findOne({ _id: new ObjectId(findDocOptions.id) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findDocOptions.checkPermissions)
      if (doc.author && !doc.author.equals(findDocOptions.checkPermissions.userId)) throw new Error403();

    const template = await templatesCollection.findOne({ _id: new ObjectId(templateId) } as ITemplate<'server'>);
    if (!template) throw new Error404('Template not found');

    await docsCollection.updateOne({ _id: doc._id } as IDocument<'server'>, { $set: { template: templateId } });
    const toRet = await docsCollection.findOne({ _id: doc._id } as IDocument<'server'>);

    return toRet;
  }

  async publishDraft(documentId: ObjectID) {
    const document = await this._docs.findOne({ _id: documentId } as IDocument<'server'>);

    if (!document) throw new Error404();

    const draftsCollection = this._drafts;
    const draftInsertResult = await draftsCollection.insert({
      createdOn: Date.now(),
      html: document.html,
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
      docsCollection.find(selector, {}, 0).toArray()
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
    const doc = await docsCollection.findOne({ _id: new ObjectId(findOptions.id) } as IDocument<'server'>);

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

    const inertResult = await this._elementsCollection.insertOne(token);
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

    insertedElm!.html = await buildHtml(insertedElm!);
    return insertedElm!;
  }

  async getDraft(id: string | ObjectID) {
    const draftsCollection = this._drafts;

    const draft = await draftsCollection.findOne({ _id: new ObjectId(id) } as IDraft<'server'>);
    if (!draft) throw new Error404('Draft not found');

    return draft;
  }

  async removeElement(findOptions: GetOptions, elementId: string) {
    const docsCollection = this._docs;

    const doc = await docsCollection.findOne({ _id: new ObjectId(findOptions.id) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.author && !doc.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    const elm = await this._elementsCollection.findOne({ _id: new ObjectID(elementId) } as IDraftElement<'server'>);
    if (!elm) throw new Error404();

    await this._elementsCollection.remove({ _id: new ObjectID(elementId) } as IDraftElement<'server'>);
    await docsCollection.update(
      { _id: doc._id } as IDocument<'server'>,
      { $pull: { elementsOrder: { $in: [elementId] } } },
      { multi: true }
    );
  }

  async updateElement(findOptions: GetOptions, elmId: string, token: Partial<IDraftElement<'client'>>) {
    // Remove any attempt to change the parent
    delete token.parent;

    const selector = { _id: new ObjectID(elmId) } as IDraftElement<'server'>;
    const json = await this._elementsCollection.findOne<IDraftElement<'server'>>(selector);

    if (!json) throw new Error404();

    if (token.type && json.type !== token.type) throw new Error400('You cannot change an element type');

    const docsCollection = this._docs;
    const doc = await docsCollection.findOne({ _id: new ObjectId(findOptions.id) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.author && !doc.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    await this._elementsCollection.updateOne(selector, { $set: token });
    const updatedJson = await this._elementsCollection.findOne(selector);

    updatedJson!.html = await buildHtml(updatedJson!);
    return updatedJson!;
  }

  async remove(id: string | ObjectID) {
    if (!ObjectID.isValid(id)) throw new Error400(`Please use a valid object id`);

    const doc = await this._docs.findOne({ _id: new ObjectID(id) } as IDocument<'server'>);
    if (!doc) throw new Error404(`Could not find document`);

    // Remove all draft elements
    const drafts = await this._drafts.find({ parent: doc._id } as IDraft<'server'>).toArray();
    await Promise.all(
      drafts.map(draft => this._elementsCollection.remove({ parent: draft._id } as IDraftElement<'server'>))
    );

    await this._drafts.remove({ parent: doc._id } as IDraft<'server'>);
    await this._docs.remove({ _id: doc._id } as IDocument<'server'>);
  }

  /**
   * Creates a new document
   */
  async create(author?: ObjectID | null) {
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
    const insertionResult = await this._docs.insertOne(token);
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

    // Now create the draft
    await this._drafts.insertOne({
      createdOn: Date.now(),
      parent: newDocument!._id
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
      _id: new ObjectID(options.id)
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
}
