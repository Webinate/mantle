import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as mongodb from 'mongodb';
import ControllerFactory from '../core/controller-factory';
import { DocumentsController } from '../controllers/documents';
import { Serializer } from './serializer';
import * as compression from 'compression';
import { j200 } from '../decorators/responses';
import { validId } from '../decorators/path-sanity';
import { admin, identify, authorize } from '../decorators/permissions';
import { IBaseControler } from '../types/misc/i-base-controller';
import Factory from '../core/model-factory';
import { Error400 } from '../utils/errors';

/**
 * Main class to use for managing documents
 */
export class DocumentsSerializer extends Serializer {
  private _options: IBaseControler;
  private _docsController: DocumentsController;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'documents' ) ] );
    this._options = options;
  }

  /**
 * Called to initialize this controller and its related database objects
 */
  async initialize( e: express.Express, db: mongodb.Db ) {
    this._docsController = ControllerFactory.get( 'documents' );

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', this.getMany.bind( this ) );
    router.get( '/:id', this.getOne.bind( this ) );
    router.put( '/:id/set-template/:templateId', this.changeTemplate.bind( this ) );
    router.post( '/:id/elements', this.addElement.bind( this ) );
    router.put( '/:id/elements/:elementId', this.updateElement.bind( this ) );
    router.delete( '/:id/elements/:elementId', this.removeElement.bind( this ) );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + `/documents`, router );
    await super.initialize( e, db );
    return this;
  }

  @j200()
  @validId( 'id', 'ID' )
  @identify()
  private async getOne( req: IAuthReq, res: express.Response ) {
    const document = await this._docsController.get( {
      id: req.params.id,
      checkPermissions: req._isAdmin ? undefined : { userId: req._user!._id }
    } );

    if ( !document )
      throw new Error400( 'Document does not exist', 404 );

    return document;
  }

  @j200()
  @validId( 'id', 'ID' )
  @authorize()
  private async addElement( req: IAuthReq, res: express.Response ) {
    const element = await this._docsController.addElement( {
      id: req.params.id,
      checkPermissions: req._isAdmin ? undefined : { userId: req._user!._id }
    }, req.body );

    return element;
  }

  @j200( 204 )
  @validId( 'id', 'ID' )
  @validId( 'elementId', 'element ID' )
  @authorize()
  private async removeElement( req: IAuthReq, res: express.Response ) {
    const element = await this._docsController.removeElement( {
      id: req.params.id,
      checkPermissions: req._isAdmin ? undefined : { userId: req._user!._id }
    }, req.params.elementId );

    return element;
  }

  @j200()
  @validId( 'id', 'ID' )
  @validId( 'elementId', 'element ID' )
  @authorize()
  private async updateElement( req: IAuthReq, res: express.Response ) {
    const element = await this._docsController.updateElement( {
      id: req.params.id,
      checkPermissions: req._isAdmin ? undefined : { userId: req._user!._id }
    }, req.params.elementId, req.body );

    return element;
  }

  @j200()
  @validId( 'id', 'ID' )
  @validId( 'templateId', 'template ID' )
  @identify()
  private async changeTemplate( req: IAuthReq, res: express.Response ) {
    const updatedDoc = await this._docsController.changeTemplate( {
      id: req.params.id,
      checkPermissions: req._isAdmin ? undefined : { userId: req._user!._id }
    }, req.params.templateId );
    return updatedDoc;
  }

  @j200()
  @admin()
  private async getMany( req: IAuthReq, res: express.Response ) {
    const manager = this._docsController;
    const toRet = await manager.getMany();
    return toRet;
  }
}