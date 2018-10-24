import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { Db, ObjectID } from 'mongodb';
import Controller from './controller';
import ModelFactory from '../core/model-factory';
import { DocumentsModel } from '../models/documents-model';
import { TemplatesModel } from '../models/templates-model';
import { IDocument } from '../types/models/i-document';
import { DraftsModel } from '../models/drafts-model';
import { IDraft } from '../types/models/i-draft';
import { ISchemaOptions } from '../types/misc/i-schema-options';
import { Error404, Error400 } from '../utils/errors';
import { isValidObjectID } from '../utils/utils';

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
  async create(): Promise<ObjectID>
  async create( options: ISchemaOptions ): Promise<IDocument<'client'>>
  async create( options?: ISchemaOptions ) {

    // Get the templates
    const templates = await this._templates.findMany( {} );
    const firstTemplate = templates[ 0 ].dbEntry._id.toString();

    // Create the doc token
    const token: Partial<IDocument<'client'>> = {
      createdOn: Date.now(),
      lastUpdated: Date.now(),
      template: firstTemplate
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
  async get( id: string ) {
    const docModel = this._docs;
    const searchQuery: Partial<IDocument<'server'>> = {
      _id: new ObjectID( id )
    };
    const result = await docModel.findOne<IDocument<'server'>>( searchQuery );

    if ( !result )
      return null;
    else {
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