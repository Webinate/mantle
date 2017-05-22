'use strict';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { UserManager, UserPrivileges } from '../users';
import { ownerRights, adminRights, identifyUser } from '../permission-controllers';
import { Controller } from './controller'
import { okJson, errJson } from '../serializers';
import { IConfig } from '../definitions/custom/config/i-config';
import { IServer } from '../definitions/custom/config/i-server';
import { IAuthReq } from '../definitions/custom/tokens/i-auth-request';
import { IUserEntry } from '../definitions/custom/models/i-user-entry';
import { IGetUser, IResponse, IGetUsers } from '../definitions/custom/tokens/standard-tokens';

import * as compression from 'compression';
import { Model } from '../models/model';
import { UsersModel } from '../models/users-model';

/**
 * Main class to use for managing users
 */
export class UserController extends Controller {
    private _config: IConfig;
    private _server: IServer;

	/**
	 * Creates an instance of the user manager
	 * @param userCollection The mongo collection that stores the users
	 * @param sessionCollection The mongo collection that stores the session data
	 * @param The config options of this manager
	 */
    constructor( e: express.Express, config: IConfig, server: IServer ) {
        super( [ Model.registerModel( UsersModel ) ] );

        this._config = config;
        this._server = server;

        // Setup the rest calls
        const router = express.Router();
        router.use( compression() );
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        router.get( '/', <any>[ identifyUser, this.getUsers.bind( this ) ] );
        router.post( '/', <any>[ adminRights, this.createUser.bind( this ) ] );
        router.get( '/:user/meta', <any>[ ownerRights, this.getData.bind( this ) ] );
        router.get( '/:user/meta/:name', <any>[ ownerRights, this.getVal.bind( this ) ] );
        router.get( '/:username', <any>[ ownerRights, this.getUser.bind( this ) ] );
        router.delete( '/:user', <any>[ ownerRights, this.removeUser.bind( this ) ] );
        router.post( '/:user/meta/:name', <any>[ adminRights, this.setVal.bind( this ) ] );
        router.post( '/:user/meta', <any>[ adminRights, this.setData.bind( this ) ] );

        // Register the path
        e.use( '/users', router );
    }

    /**
	 * Gets a specific user by username or email - the 'username' parameter must be set. Some of the user data will be obscured unless the verbose parameter
     * is specified. Specify the verbose=true parameter in order to get all user data.
	 */
    private async getUser( req: IAuthReq, res: express.Response ) {
        try {
            const user = await UserManager.get.getUser( req.params.username );

            if ( !user )
                throw new Error( 'No user found' );

            okJson<IGetUser>( {
                error: false,
                message: `Found ${user.dbEntry.username}`,
                data: user.generateCleanedData( Boolean( req.query.verbose ) )
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Gets a list of users. You can limit the haul by specifying the 'index' and 'limit' query parameters.
     * Also specify the verbose=true parameter in order to get all user data. You can also filter usernames with the
     * search query
	 */
    private async getUsers( req: IAuthReq, res: express.Response ) {
        let verbose = Boolean( req.query.verbose );

        // Only admins are allowed to see sensitive data
        if ( req._user && req._user.privileges === UserPrivileges.SuperAdmin && verbose )
            verbose = true;
        else
            verbose = false;

        try {
            const totalNumUsers = await UserManager.get.numUsers( new RegExp( req.query.search ) );
            const users = await UserManager.get.getUsers( parseInt( req.query.index ), parseInt( req.query.limit ), new RegExp( req.query.search ) );
            const sanitizedData: IUserEntry[] = [];

            for ( let i = 0, l = users.length; i < l; i++ )
                sanitizedData.push( users[ i ].generateCleanedData( verbose ) );

            okJson<IGetUsers>( {
                error: false,
                message: `Found ${users.length} users`,
                data: sanitizedData,
                count: totalNumUsers
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
 	 * Sets a user's meta data
	 */
    private async setData( req: IAuthReq, res: express.Response ) {
        const user = req._user!;
        let val = req.body && req.body.value;
        if ( !val )
            val = {};

        try {
            await UserManager.get.setMeta( user, val );
            okJson<IResponse>( { message: `User's data has been updated`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Sets a user's meta value
	 */
    private async setVal( req: IAuthReq, res: express.Response ) {
        const user = req._user!;
        const name = req.params.name;

        try {
            await UserManager.get.setMetaVal( user, name, req.body.value );
            okJson<IResponse>( { message: `Value '${name}' has been updated`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Gets a user's meta value
	 */
    private async getVal( req: IAuthReq, res: express.Response ) {
        const user = req._user!;
        const name = req.params.name;

        try {
            const val = await UserManager.get.getMetaVal( user, name );
            okJson<any>( val, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Gets a user's meta data
	 */
    private async getData( req: IAuthReq, res: express.Response ) {
        const user = req._user!;

        try {
            const val = await UserManager.get.getMetaData( user );
            okJson<any>( val, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

	/**
	 * Removes a user from the database
	 */
    private async removeUser( req: IAuthReq, res: express.Response ) {
        try {
            const toRemove = req.params.user;
            if ( !toRemove )
                throw new Error( 'No user found' );

            await UserManager.get.removeUser( toRemove );

            return okJson<IResponse>( { message: `User ${toRemove} has been removed`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

	/**
	 * Allows an admin to create a new user without registration
	 */
    private async createUser( req: express.Request, res: express.Response ) {
        try {
            const token: IUserEntry = req.body;

            // Set default privileges
            token.privileges = token.privileges ? token.privileges : UserPrivileges.Regular;

            // Not allowed to create super users
            if ( token.privileges === UserPrivileges.SuperAdmin )
                throw new Error( 'You cannot create a user with super admin permissions' );

            const user = await UserManager.get.createUser( token.username!, token.email!, token.password!, true, token.privileges, token.meta );
            okJson<IGetUser>( {
                error: false,
                message: `User ${user.dbEntry.username} has been created`,
                data: user.dbEntry
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }
}