import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { Db, ObjectID, ObjectId } from 'mongodb';
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

export type GetOptions = {
  id: string;
  checkPermissions?: { userId: ObjectID };
}

/**
 * Class responsible for managing documents
 */
export class DocumentsController extends Controller {
  private _docs: DocumentsModel;
  private _drafts: DraftsModel;
  private _templates: TemplatesModel;

  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {
    this._docs = ModelFactory.get( 'documents' );
    this._templates = ModelFactory.get( 'templates' );
    this._drafts = ModelFactory.get( 'drafts' );
    return this;
  }

  /**
   * Changes the document template, as well as the current draft's
   * @param options The options for finding the resource
   * @param templateId The id of the template to change to
   */
  async changeTemplate( findOptions: GetOptions, templateId: string ) {
    const docsModel = this._docs;
    const templates = this._templates;
    const drafts = this._drafts;

    const doc = await docsModel.findOne<IDocument<'server'>>( { _id: new ObjectId( findOptions.id ) } as IDocument<'server'> );
    if ( !doc )
      throw new Error404( 'Document not found' );

    if ( findOptions.checkPermissions )
      if ( doc.dbEntry.author && !doc.dbEntry.author.equals( findOptions.checkPermissions.userId ) )
        throw new Error403();

    const template = await templates.findOne<IDocument<'server'>>( { _id: new ObjectId( templateId ) } as ITemplate<'server'> );
    if ( !template )
      throw new Error404( 'Template not found' );

    const options: ISchemaOptions = {
      expandForeignKeys: true,
      verbose: true,
      expandMaxDepth: 1
    }

    await drafts.update<IDraft<'client'>>( { _id: doc.dbEntry.currentDraft! } as IDraft<'server'>, { template: templateId } );
    const toRet = await docsModel.update<IDocument<'client'>>( { _id: doc.dbEntry._id } as IDocument<'server'>, { template: templateId }, options );
    return toRet;
  }

  /**
   * Fetches all documents
   */
  async getMany() {
    const docsModel = this._docs;
    const selector: Partial<IDocument<'server'>> = {};

    // Save the new entry into the database
    const responses = await Promise.all( [
      docsModel.count( selector ),
      docsModel.findMany<IDocument<'server'>>( { selector, index: 0, limit: - 1 } )
    ] );
    const schemas = responses[ 1 ];
    const docs = await Promise.all( schemas.map( s => s.downloadToken<IDocument<'client'>>( {
      verbose: true,
      expandForeignKeys: true,
      expandMaxDepth: 1,
      expandSchemaBlacklist: [ /parent/ ]
    } ) ) );

    const toRet: Page<IDocument<'client'>> = {
      limit: -1,
      count: responses[ 0 ],
      index: 0,
      data: docs
    };

    return toRet;
  }

  async remove( id: string ) {
    if ( !isValidObjectID( id ) )
      throw new Error400( `Please use a valid object id` );

    const doc = await this._docs.findOne<IDocument<'server'>>( { _id: new ObjectID( id ) } as IDocument<'server'> );
    if ( !doc )
      throw new Error404( `Could not find document` );

    await this._drafts.deleteInstances( { parent: doc.dbEntry._id } as IDraft<'server'> );
    await this._docs.deleteInstances( { _id: doc.dbEntry._id } as IDocument<'server'> );
  }

  /**
   * Creates a new document
   */
  async create( author: string ): Promise<ObjectID>
  async create( author: string, options: ISchemaOptions ): Promise<IDocument<'client'>>
  async create( author: string, options?: ISchemaOptions ) {

    // Get the templates
    const templates = await this._templates.findMany( {} );
    const firstTemplate = templates[ 0 ].dbEntry._id.toString();

    // Create the doc token
    const token: Partial<IDocument<'client'>> = {
      createdOn: Date.now(),
      lastUpdated: Date.now(),
      template: firstTemplate,
      author: author ? author : null
    };

    // Create the doc
    const schema = await this._docs.createInstance( token );

    // Now create the draft
    const draft = await this._drafts.createInstance<IDraft<'client'>>( {
      createdOn: Date.now(),
      lastUpdated: Date.now(),
      published: false,
      parent: schema.dbEntry._id.toString(),
      template: firstTemplate,
      elements: []
    } );

    // Update the doc to point to the draft
    await this._docs.update<IDocument<'client'>>(
      { _id: schema.dbEntry._id } as IDocument<'server'>, {
        currentDraft: draft.dbEntry._id.toString()
      } )

    if ( options ) {
      const json = await schema.downloadToken<IDocument<'client'>>( options );
      return json;
    }
    else
      return schema.dbEntry._id;
  }

  /**
   * Gets a document by its name or ID
   */
  async get( options: GetOptions ) {
    const docModel = this._docs;
    const searchQuery: Partial<IDocument<'server'>> = {
      _id: new ObjectID( options.id )
    };

    const result = await docModel.findOne<IDocument<'server'>>( searchQuery );

    if ( !result )
      return null;
    else {
      if ( options.checkPermissions ) {
        if ( result.dbEntry.author && !result.dbEntry.author.equals( options.checkPermissions.userId ) )
          throw new Error403();
      }

      const volume = await result.downloadToken<IDocument<'client'>>( {
        verbose: true,
        expandForeignKeys: true,
        expandMaxDepth: 1,
        expandSchemaBlacklist: [ /parent/ ]
      } );
      return volume;
    }
  }
}