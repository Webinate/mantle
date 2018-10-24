'use strict';

import { Page } from '../types/tokens/standard-tokens';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import ControllerFactory from '../core/controller-factory';
import { SessionsController } from '../controllers/sessions';
import { Serializer } from './serializer'
import { j200 } from '../decorators/responses';
import { hasPermission } from '../decorators/permissions';
import * as compression from 'compression';
import { IBaseControler } from '../types/misc/i-base-controller';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import { ISessionEntry } from '..';

/**
 * Main class to use for managing users
 */
export class SessionSerializer extends Serializer {
  private _options: IBaseControler;
  private _sessionController: SessionsController;
  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'sessions' ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ) {

    this._sessionController = ControllerFactory.get( 'sessions' );

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', this.getSessions.bind( this ) );
    router.delete( '/:id', this.deleteSession.bind( this ) );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/sessions', router );

    await super.initialize( e, db );
    return this;
  }

  /**
	 * Gets a list of active sessions. You can limit the haul by specifying the 'index' and 'limit' query parameters.
	 */
  @j200()
  @hasPermission()
  private async getSessions( req: express.Request, res: express.Response ) {
    const numSessions = await this._sessionController.numActiveSessions();
    const index = parseInt( req.query.index );
    const limit = parseInt( req.query.limit );
    const sessions = await this._sessionController.getActiveSessions( index, limit )

    const response: Page<ISessionEntry<'client'>> = {
      data: sessions as ISessionEntry<'client'>[],
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
  @hasPermission()
  private async deleteSession( req: express.Request, res: express.Response ) {
    await this._sessionController.clearSession( req.params.id, req, res );
    return;
  }
}