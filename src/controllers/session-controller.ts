'use strict';

import { SessionTokens } from 'modepress';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { SessionManager } from '../core/session-manager';
import { ownerRights } from '../utils/permission-controllers';
import { Controller } from './controller'
import { j200 } from '../utils/response-decorators';
import * as compression from 'compression';
import { IBaseControler } from 'modepress';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';

/**
 * Main class to use for managing users
 */
export class SessionController extends Controller {
  private _options: IBaseControler;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'session' ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ) {

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', <any>[ ownerRights, this.getSessions.bind( this ) ] );
    router.delete( '/:id', <any>[ ownerRights, this.deleteSession.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/sessions', router );

    await super.initialize( e, db );
    return this;
  }

  /**
	 * Gets a list of active sessions. You can limit the haul by specifying the 'index' and 'limit' query parameters.
	 */
  @j200()
  private async getSessions( req: express.Request, res: express.Response ) {
    const numSessions = await SessionManager.get.numActiveSessions();
    const index = parseInt( req.query.index );
    const limit = parseInt( req.query.limit );
    const sessions = await SessionManager.get.getActiveSessions( index, limit )

    const response: SessionTokens.GetAll.Response = {
      data: sessions,
      count: numSessions,
      index: index,
      limit: limit
    };
    return response;
  }

  /**
 	 * Resends the activation link to the user
	 */
  @j200( 204 )
  private async deleteSession( req: express.Request, res: express.Response ) {
    await SessionManager.get.clearSession( req.params.id, req, res );
    return;
  }
}