﻿import { IConfig } from '../types/config/i-config';
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
}

/**
 * Class responsible for managing documents
 */
export class DocumentsController extends Controller {
  private _docs: DocumentsModel;
  private _drafts: DraftsModel;
  private _templates: TemplatesModel;
  private _elementsCollection: Collection<IDraftElement<'server'>>;

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
    this._elementsCollection = db.collection( 'elements' );
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

    const doc = await docsModel.findOne( { _id: new ObjectId( findOptions.id ) } as IDocument<'server'> );
    if ( !doc )
      throw new Error404( 'Document not found' );

    if ( findOptions.checkPermissions )
      if ( doc.dbEntry.author && !doc.dbEntry.author.equals( findOptions.checkPermissions.userId ) )
        throw new Error403();

    const template = await templates.findOne( { _id: new ObjectId( templateId ) } as ITemplate<'server'> );
    if ( !template )
      throw new Error404( 'Template not found' );

    const options: ISchemaOptions = {
      expandForeignKeys: true,
      verbose: true,
      expandMaxDepth: 1
    }

    await drafts.update( { _id: doc.dbEntry.currentDraft! } as IDraft<'server'>, { template: templateId } );
    const toRet = await docsModel.update( { _id: doc.dbEntry._id } as IDocument<'server'>, { template: templateId }, options );
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
      docsModel.findMany( { selector, index: 0, limit: - 1 } )
    ] );
    const schemas = responses[ 1 ];
    const docs = await Promise.all( schemas.map( s => s.downloadToken( {
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

  async addElement( findOptions: GetOptions, token: IDraftElement<'client'>, index?: number ) {
    const docsModel = this._docs;
    const draftsModel = this._drafts;
    const doc = await docsModel.findOne( { _id: new ObjectId( findOptions.id ) } as IDocument<'server'> );

    if ( !doc )
      throw new Error404( 'Document not found' );

    const curDraft = await draftsModel.findOne( { _id: doc.dbEntry.currentDraft! } as IDocument<'server'> );

    if ( !curDraft )
      throw new Error404( 'Could not find active draft' );

    if ( findOptions.checkPermissions )
      if ( doc.dbEntry.author && !doc.dbEntry.author.equals( findOptions.checkPermissions.userId ) )
        throw new Error403();

    if ( !token.type )
      throw new Error400( 'You must specify an element type' );

    token.parent = doc.dbEntry.currentDraft!.toString();

    let model: Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    try {
      model = ModelFactory.get( token.type ) as Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    }
    catch ( err ) {
      throw new Error400( 'Type not recognised' );
    }

    const schema = await model.createInstance( token );
    const elementsOrder = curDraft.dbEntry.elementsOrder;

    if ( index === undefined )
      index = elementsOrder.length;
    else if ( index < 0 )
      index = elementsOrder.length;
    else if ( index > elementsOrder.length )
      index = elementsOrder.length;

    curDraft.dbEntry.elementsOrder.splice( index, 0, schema.dbEntry._id.toString() );
    await draftsModel.update( { _id: curDraft.dbEntry._id } as IDraftElement<'server'>, {
      elementsOrder: curDraft.dbEntry.elementsOrder
    } );

    const toRet = await schema.downloadToken( {
      expandForeignKeys: true,
      verbose: true,
      expandMaxDepth: 1,
      expandSchemaBlacklist: [ /parent/ ]
    } );
    toRet.html = buildHtml( toRet );
    return toRet;
  }

  async removeElement( findOptions: GetOptions, elementId: string ) {
    const docsModel = this._docs;
    const draftsModel = this._drafts;

    const doc = await docsModel.findOne( { _id: new ObjectId( findOptions.id ) } as IDocument<'server'> );
    if ( !doc )
      throw new Error404( 'Document not found' );

    const curDraft = await draftsModel.findOne( { _id: doc.dbEntry.currentDraft! } as IDocument<'server'> );
    if ( !curDraft )
      throw new Error404( 'Could not find active draft' );

    if ( findOptions.checkPermissions )
      if ( doc.dbEntry.author && !doc.dbEntry.author.equals( findOptions.checkPermissions.userId ) )
        throw new Error403();

    const elm = await this._elementsCollection.findOne( { _id: new ObjectID( elementId ) } as IDraftElement<'server'> );

    if ( !elm )
      throw new Error404();

    await this._elementsCollection.remove( { _id: new ObjectID( elementId ) } as IDraftElement<'server'> );
    await draftsModel.collection.update(
      { _id: curDraft.dbEntry._id } as IDraftElement<'server'>,
      { $pull: { elementsOrder: { $in: [ elementId ] } } },
      { multi: true }
    )
  }

  async updateElement( findOptions: GetOptions, elmId: string, token: IDraftElement<'client'> ) {

    // Remove any attempt to change the parent
    delete token.parent;

    const selector = { _id: new ObjectID( elmId ) } as IDraftElement<'server'>;
    const json = await this._elementsCollection.findOne<IDraftElement<'server'>>( selector );

    if ( !json )
      throw new Error404();

    if ( token.type && json.type !== token.type )
      throw new Error400( 'You cannot change an element type' );

    const docsModel = this._docs;
    const doc = await docsModel.findOne( { _id: new ObjectId( findOptions.id ) } as IDocument<'server'> );
    if ( !doc )
      throw new Error404( 'Document not found' );

    if ( findOptions.checkPermissions )
      if ( doc.dbEntry.author && !doc.dbEntry.author.equals( findOptions.checkPermissions.userId ) )
        throw new Error403();

    const model = ModelFactory.get( json.type ) as Model<IDraftElement<'server'>, IDraftElement<'client'>>;
    const updatedJson = await model.update( selector, token, {
      verbose: true,
      expandForeignKeys: true,
      expandMaxDepth: 1,
      expandSchemaBlacklist: [ /parent/ ]
    } );

    updatedJson.html = buildHtml( updatedJson );
    return updatedJson;
  }

  async remove( id: string ) {
    if ( !isValidObjectID( id ) )
      throw new Error400( `Please use a valid object id` );

    const doc = await this._docs.findOne( { _id: new ObjectID( id ) } as IDocument<'server'> );
    if ( !doc )
      throw new Error404( `Could not find document` );

    // Remove all draft elements
    const drafts = await this._drafts.findMany( { selector: { parent: doc.dbEntry._id } as IDraft<'server'> } );
    await Promise.all( drafts.map( draft => this._elementsCollection.remove( { parent: draft.dbEntry._id } as IDraftElement<'server'> ) ) );

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
    const draft = await this._drafts.createInstance( {
      createdOn: Date.now(),
      lastUpdated: Date.now(),
      published: false,
      parent: schema.dbEntry._id.toString(),
      template: firstTemplate
    } );

    const pModel = ModelFactory.get( 'elm-paragraph' );
    const firstElm = await pModel.createInstance( {
      html: '<p></p>',
      parent: draft.dbEntry._id.toString(),
      type: 'elm-paragraph',
      zone: templates[ 0 ].dbEntry.defaultZone
    } );

    // Update the draft with the default element
    const firstElmId = firstElm.dbEntry._id.toString();

    // Update the draft with the element in the template map
    await this._drafts.update(
      { _id: draft.dbEntry._id } as IDraft<'server'>, {
        elementsOrder: [ firstElmId ]
      } );

    // Update the doc to point to the draft
    await this._docs.update(
      { _id: schema.dbEntry._id } as IDocument<'server'>, {
        currentDraft: draft.dbEntry._id.toString()
      } )

    if ( options ) {
      const document = await schema.downloadToken( options );

      // if ( document.currentDraft && typeof document.currentDraft !== 'string' )
      //   await this.populateDraft( document.currentDraft );

      return document;
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

    const result = await docModel.findOne( searchQuery );

    if ( !result )
      return null;
    else {
      if ( options.checkPermissions ) {
        if ( result.dbEntry.author && !result.dbEntry.author.equals( options.checkPermissions.userId ) )
          throw new Error403();
      }

      const document = await result.downloadToken( {
        verbose: true,
        expandForeignKeys: true,
        expandMaxDepth: 1,
        expandSchemaBlacklist: [ /parent/ ]
      } );

      return document;
    }
  }
}