import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { Db, ObjectID, ObjectId, Collection } from 'mongodb';
import Controller from './controller';
import ModelFactory from '../core/model-factory';
import { DocumentsModel } from '../models/documents-model';
import { TemplatesModel } from '../models/templates-model';
import { IDocument } from '../types/models/i-document';
import { DraftsModel } from '../models/drafts-model';
import { IDraft } from '../types/models/i-draft';
import { ISchemaOptions } from '../types/misc/i-schema-options';
import { Error404, Error400, Error403 } from '../utils/errors';
import { isValidObjectID } from '../utils/utils';
import { ITemplate } from '../types/models/i-template';
import { IDraftElement } from '../types/models/i-draft-elements';
import { Model } from '../models/model';
import { buildHtml } from './build-html';

export type GetOptions = {
  id: string;
  checkPermissions?: { userId: ObjectID };
} & Partial<ISchemaOptions>;

/**
 * Class responsible for managing documents
 */
export class DocumentsController extends Controller {
  private _docs: DocumentsModel;
  private _drafts: DraftsModel;
  private _templates: TemplatesModel;
  private _elementsCollection: Collection<IDraftElement<'server'>>;

  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize(db: Db) {
    this._docs = ModelFactory.get('documents');
    this._templates = ModelFactory.get('templates');
    this._drafts = ModelFactory.get('drafts');
    this._elementsCollection = db.collection('elements');
    return this;
  }

  /**
   * Changes the document template, as well as the current draft's
   * @param options The options for finding the resource
   * @param templateId The id of the template to change to
   */
  async changeTemplate(findDocOptions: GetOptions, templateId: string, schemaOptions?: Partial<ISchemaOptions>) {
    const docsModel = this._docs;
    const templates = this._templates;

    const doc = await docsModel.findOne({ _id: new ObjectId(findDocOptions.id) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findDocOptions.checkPermissions)
      if (doc.dbEntry.author && !doc.dbEntry.author.equals(findDocOptions.checkPermissions.userId))
        throw new Error403();

    const template = await templates.findOne({ _id: new ObjectId(templateId) } as ITemplate<'server'>);
    if (!template) throw new Error404('Template not found');

    const options: Partial<ISchemaOptions> = schemaOptions || {
      expandForeignKeys: true,
      verbose: true,
      expandMaxDepth: 1
    };

    const toRet = await docsModel.update(
      { _id: doc.dbEntry._id } as IDocument<'server'>,
      { template: templateId },
      options
    );
    return toRet;
  }

  async publishDraft(document: IDocument<'expanded'>) {
    const draftsModel = this._drafts;
    const draftSchema = await draftsModel.createInstance({
      createdOn: Date.now(),
      html: document.html,
      parent: document._id
    });

    const draft = await draftSchema.downloadToken({ expandForeignKeys: false, verbose: true });
    return draft;
  }

  /**
   * Fetches all documents
   */
  async getMany() {
    const docsModel = this._docs;
    const selector: Partial<IDocument<'server'>> = {};

    // Save the new entry into the database
    const responses = await Promise.all([
      docsModel.count(selector),
      docsModel.findMany({ selector, index: 0, limit: -1 })
    ]);
    const schemas = responses[1];
    const docs = await Promise.all(
      schemas.map(s =>
        s.downloadToken({
          verbose: true,
          expandForeignKeys: true,
          expandMaxDepth: 1,
          expandSchemaBlacklist: [/parent/]
        })
      )
    );

    const toRet: Page<IDocument<'client' | 'expanded'>> = {
      limit: -1,
      count: responses[0],
      index: 0,
      data: docs
    };

    return toRet;
  }

  async addElement(findOptions: GetOptions, token: Partial<IDraftElement<'client'>>, index?: number) {
    const docsModel = this._docs;
    const templatesModel = this._templates;
    const doc = await docsModel.findOne({ _id: new ObjectId(findOptions.id) } as IDocument<'server'>);

    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.dbEntry.author && !doc.dbEntry.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    if (!token.type) throw new Error400('You must specify an element type');

    token.parent = doc.dbEntry._id!.toString();

    let draftModel: Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    try {
      draftModel = ModelFactory.get(token.type) as Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    } catch (err) {
      throw new Error400('Type not recognised');
    }

    if (!token.zone) {
      const templateSchema = await templatesModel.findOne({ _id: doc.dbEntry.template } as ITemplate<'server'>);
      if (templateSchema) token.zone = templateSchema.dbEntry.defaultZone;
    }

    const schema = await draftModel.createInstance(token);
    const elementsOrder = doc.dbEntry.elementsOrder;

    if (index === undefined) index = elementsOrder.length;
    else if (index < 0) index = elementsOrder.length;
    else if (index > elementsOrder.length) index = elementsOrder.length;

    doc.dbEntry.elementsOrder.splice(index, 0, schema.dbEntry._id.toString());
    await docsModel.update({ _id: doc.dbEntry._id } as IDocument<'server'>, {
      elementsOrder: doc.dbEntry.elementsOrder
    });

    const toRet = await schema.downloadToken({
      expandForeignKeys: true,
      verbose: true,
      expandMaxDepth: 1,
      expandSchemaBlacklist: [/parent/]
    });
    toRet.html = buildHtml(toRet);
    return toRet;
  }

  async getDraft(id: string, options?: Partial<ISchemaOptions>) {
    const draftsModel = this._drafts;

    const draft = await draftsModel.findOne({ _id: new ObjectId(id) } as IDraft<'server'>);
    if (!draft) throw new Error404('Draft not found');

    return draft.downloadToken(options);
  }

  async removeElement(findOptions: GetOptions, elementId: string) {
    const docsModel = this._docs;

    const doc = await docsModel.findOne({ _id: new ObjectId(findOptions.id) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.dbEntry.author && !doc.dbEntry.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    const elm = await this._elementsCollection.findOne({ _id: new ObjectID(elementId) } as IDraftElement<'server'>);

    if (!elm) throw new Error404();

    await this._elementsCollection.remove({ _id: new ObjectID(elementId) } as IDraftElement<'server'>);
    await docsModel.collection.update(
      { _id: doc.dbEntry._id } as IDocument<'server'>,
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

    const docsModel = this._docs;
    const doc = await docsModel.findOne({ _id: new ObjectId(findOptions.id) } as IDocument<'server'>);
    if (!doc) throw new Error404('Document not found');

    if (findOptions.checkPermissions)
      if (doc.dbEntry.author && !doc.dbEntry.author.equals(findOptions.checkPermissions.userId)) throw new Error403();

    const model = ModelFactory.get(json.type) as Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    const updatedJson = await model.update(selector, token, {
      verbose: true,
      expandForeignKeys: true,
      expandMaxDepth: 1,
      expandSchemaBlacklist: [/parent/]
    });

    updatedJson.html = buildHtml(updatedJson);
    return updatedJson;
  }

  async remove(id: string) {
    if (!isValidObjectID(id)) throw new Error400(`Please use a valid object id`);

    const doc = await this._docs.findOne({ _id: new ObjectID(id) } as IDocument<'server'>);
    if (!doc) throw new Error404(`Could not find document`);

    // Remove all draft elements
    const drafts = await this._drafts.findMany({ selector: { parent: doc.dbEntry._id } as IDraft<'server'> });
    await Promise.all(
      drafts.map(draft => this._elementsCollection.remove({ parent: draft.dbEntry._id } as IDraftElement<'server'>))
    );

    await this._drafts.deleteInstances({ parent: doc.dbEntry._id } as IDraft<'server'>);
    await this._docs.deleteInstances({ _id: doc.dbEntry._id } as IDocument<'server'>);
  }

  /**
   * Creates a new document
   */
  async create(author: string): Promise<ObjectID>;
  async create(author: string, options: ISchemaOptions): Promise<IDocument<'client'>>;
  async create(author: string, options?: ISchemaOptions) {
    // Get the templates
    const templates = await this._templates.findMany({});
    const firstTemplate = templates[0].dbEntry._id.toString();
    const pModel = ModelFactory.get('elm-paragraph');

    // Create the doc token
    const token: Partial<IDocument<'client'>> = {
      createdOn: Date.now(),
      lastUpdated: Date.now(),
      template: firstTemplate,
      author: author ? author : null
    };

    // Create the doc
    const schema = await this._docs.createInstance(token);

    // Create the first element
    const firstElm = await pModel.createInstance({
      html: '<p></p>',
      parent: schema.dbEntry._id.toString(),
      type: 'elm-paragraph',
      zone: templates[0].dbEntry.defaultZone
    });

    // Update the doc with the default element
    const firstElmId = firstElm.dbEntry._id.toString();

    // Update the doc with the element in the template map
    await this._docs.update({ _id: schema.dbEntry._id } as IDocument<'server'>, {
      elementsOrder: [firstElmId]
    });

    // Now create the draft
    await this._drafts.createInstance({
      createdOn: Date.now(),
      parent: schema.dbEntry._id.toString()
    });

    if (options) {
      const document = await schema.downloadToken(options);
      return document;
    } else return schema.dbEntry._id;
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
        if (result.dbEntry.author && !result.dbEntry.author.equals(options.checkPermissions.userId))
          throw new Error403();
      }

      const document = await result.downloadToken({
        verbose: options.verbose !== undefined ? options.verbose : true,
        expandForeignKeys: options.expandForeignKeys !== undefined ? options.expandForeignKeys : true,
        expandMaxDepth: options.expandMaxDepth !== undefined ? options.expandMaxDepth : 1,
        expandSchemaBlacklist: options.expandSchemaBlacklist !== undefined ? options.expandSchemaBlacklist : [/parent/]
      });

      return document;
    }
  }
}
