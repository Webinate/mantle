'use strict';
import { IConfig } from '../definitions/custom/config/i-config';
import { IGetSessions, IResponse } from '../definitions/custom/tokens/standard-tokens';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { UserManager } from '../users';
import { ownerRights } from '../permission-controllers';
import { Controller } from './controller'
import { okJson, errJson } from '../serializers';
import * as compression from 'compression';
import { Model } from '../models/model';
import { UsersModel } from '../models/users-model';

/**
 * Main class to use for managing users
 */
export class SessionController extends Controller {
    private _config: IConfig;

	/**
	 * Creates an instance of the user manager
	 * @param userCollection The mongo collection that stores the users
	 * @param sessionCollection The mongo collection that stores the session data
	 * @param The config options of this manager
	 */
    constructor( e: express.Express, config: IConfig ) {
        super( [ Model.registerModel( UsersModel ) ] );

        this._config = config;

        // Setup the rest calls
        const router = express.Router();
        router.use( compression() );
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        router.get( '/', <any>[ ownerRights, this.getSessions.bind( this ) ] );
        router.delete( '/:id', <any>[ ownerRights, this.deleteSession.bind( this ) ] );

        // Register the path
        e.use( '/sessions', router );
    }

	/**
	 * Gets a list of active sessions. You can limit the haul by specifying the 'index' and 'limit' query parameters.
	 */
    private async getSessions( req: express.Request, res: express.Response ) {
        try {
            const numSessions = await UserManager.get.sessionManager.numActiveSessions();
            const sessions = await UserManager.get.sessionManager.getActiveSessions( parseInt( req.query.index ), parseInt( req.query.limit ) )

            okJson<IGetSessions>( {
                error: false,
                message: `Found ${sessions.length} active sessions`,
                data: sessions,
                count: numSessions
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

	/**
 	 * Resends the activation link to the user
	 */
    private async deleteSession( req: express.Request, res: express.Response ) {
        try {
            await UserManager.get.sessionManager.clearSession( req.params.id, req, res );
            okJson<IResponse>( { error: false, message: `Session ${req.params.id} has been removed` }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }
}