import { ISimpleResponse } from '../types/tokens/standard-tokens';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import ControllerFactory from '../core/controller-factory';
import { UsersController } from '../controllers/users';
import { Router } from './router'
import { j200 } from '../decorators/responses';
import * as compression from 'compression';
import { IBaseControler } from '../types/misc/i-base-controller';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';

/**
 * Main class to use for managing users
 */
export class AdminRouter extends Router {
  private _options: IBaseControler;
  private _userController: UsersController;

  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'users' ) ] );
    this._options = options;
  }

  /**
 * Called to initialize this controller and its related database objects
 */
  async initialize( e: express.Express, db: mongodb.Db ) {

    this._userController = ControllerFactory.get( 'users' );

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.post( '/message-webmaster', this.messageWebmaster.bind( this ) );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/admin', router );

    await super.initialize( e, db );
    return this;
  }

  /**
 * Attempts to send the webmaster an email message
 */
  @j200()
  private async messageWebmaster( req: express.Request, res: express.Response ) {
    const token: any = req.body;

    if ( !token.message )
      throw new Error( 'Please specify a message to send' );

    await this._userController.sendAdminEmail( token.message, token.name, token.from );
    const response: ISimpleResponse = { message: 'Your message has been sent to the support team' };
    return response;
  }
}