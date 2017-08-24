'use strict';

import { IGetSessions, IResponse } from 'modepress';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { SessionManager } from '../core/session-manager';
import { ownerRights } from '../utils/permission-controllers';
import { Controller } from './controller'
import { j200 } from '../utils/serializers';
import * as compression from 'compression';
import { Model } from '../models/model';
import { UsersModel } from '../models/users-model';
import { IBaseControler } from 'modepress';
import * as mongodb from 'mongodb';

/**
 * Main class to use for managing users
 */
export class SessionController extends Controller {
  private _options: IBaseControler;

	/**
	 * Creates an instance of the user manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Model.registerModel( UsersModel ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ): Promise<Controller> {

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', <any>[ ownerRights, this.getSessions.bind( this ) ] );
    router.delete( '/:id', <any>[ ownerRights, this.deleteSession.bind( this ) ] );

    // Register the path
    e.use(( this._options.rootPath || '' ) + '/sessions', router );

    await super.initialize( e, db );
    return this;
  }

	/**
	 * Gets a list of active sessions. You can limit the haul by specifying the 'index' and 'limit' query parameters.
	 */
  @j200()
  private async getSessions( req: express.Request, res: express.Response ) {
    const numSessions = await SessionManager.get.numActiveSessions();
    const sessions = await SessionManager.get.getActiveSessions( parseInt( req.query.index ), parseInt( req.query.limit ) )

    return {
      message: `Found ${sessions.length} active sessions`,
      data: sessions,
      count: numSessions
    } as IGetSessions;
  }

	/**
 	 * Resends the activation link to the user
	 */
  @j200()
  private async deleteSession( req: express.Request, res: express.Response ) {
    await SessionManager.get.clearSession( req.params.id, req, res );
    return { message: `Session ${req.params.id} has been removed` } as IResponse;
  }
}