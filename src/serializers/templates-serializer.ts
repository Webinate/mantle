import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as mongodb from 'mongodb';
import ControllerFactory from '../core/controller-factory';
import { TemplatesController } from '../controllers/templates';
import { hasId } from '../utils/permission-controllers';
import { Serializer } from './serializer';
import * as compression from 'compression';
import { j200 } from '../decorators/responses';
import { IBaseControler } from '../types/misc/i-base-controller';
import Factory from '../core/model-factory';
import { Error400 } from '../utils/errors';

/**
 * Main class to use for managing templates
 */
export class TemplatesSerializer extends Serializer {
  private _options: IBaseControler;
  private _templatesController: TemplatesController;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'templates' ) ] );
    this._options = options;
  }

  /**
 * Called to initialize this controller and its related database objects
 */
  async initialize( e: express.Express, db: mongodb.Db ) {
    this._templatesController = ControllerFactory.get( 'templates' );

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', this.getMany.bind( this ) );
    router.get( '/:id', <any>[ hasId( 'id', 'ID' ), this.getOne.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + `/templates`, router );
    await super.initialize( e, db );
    return this;
  }

  @j200()
  private async getOne( req: IAuthReq, res: express.Response ) {
    const template = await this._templatesController.get( req.params.id );

    if ( !template )
      throw new Error400( 'Template does not exist', 404 );

    return template;
  }

  @j200()
  private async getMany( req: IAuthReq, res: express.Response ) {
    const manager = this._templatesController;
    const toRet = await manager.getMany();
    return toRet;
  }
}