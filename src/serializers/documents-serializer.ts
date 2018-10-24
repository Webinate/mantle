import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as mongodb from 'mongodb';
import ControllerFactory from '../core/controller-factory';
import { DocumentsController } from '../controllers/documents';
import { hasId } from '../utils/permission-controllers';
import { Serializer } from './serializer';
import * as compression from 'compression';
import { j200, admin } from '../utils/response-decorators';
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

    router.get( '/', <any>[ this.getMany.bind( this ) ] );
    router.get( '/:id', <any>[ hasId( 'id', 'ID' ), this.getOne.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + `/documents`, router );
    await super.initialize( e, db );
    return this;
  }

  @j200()
  @admin()
  private async getOne( req: IAuthReq, res: express.Response ) {
    const document = await this._docsController.get( req.params.id );

    if ( !document )
      throw new Error400( 'Document does not exist', 404 );

    return document;
  }

  @j200()
  private async getMany( req: IAuthReq, res: express.Response ) {
    const manager = this._docsController;
    const toRet = await manager.getMany();
    return toRet;
  }
}