'use strict';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as def from 'webinate-users';
import { UserManager, UserPrivileges } from '../users';
import { ownerRights, adminRights, identifyUser } from '../permission-controllers';
import { Controller } from './controller'
import { okJson, errJson } from '../serializers';
import * as compression from 'compression';
import { Model } from '../models/model';
import { UsersModel } from '../models/users-model';

/**
 * Main class to use for managing users
 */
export class UserController extends Controller {
    private _config: def.IConfig;

	/**
	 * Creates an instance of the user manager
	 * @param userCollection The mongo collection that stores the users
	 * @param sessionCollection The mongo collection that stores the session data
	 * @param The config options of this manager
	 */
    constructor( e: express.Express, config: def.IConfig ) {
        super([ Model.registerModel( UsersModel ) ]);

        this._config = config;

        // Setup the rest calls
        const router = express.Router();
        router.use( compression() );
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        router.get( '/users', <any>[ identifyUser, this.getUsers.bind( this ) ] );
        router.post( '/users', <any>[ ownerRights, this.createUser.bind( this ) ] );
        router.get( '/users/:user/meta', <any>[ ownerRights, this.getData.bind( this ) ] );
        router.get( '/users/:user/meta/:name', <any>[ ownerRights, this.getVal.bind( this ) ] );
        router.get( '/users/:username', <any>[ ownerRights, this.getUser.bind( this ) ] );
        router.delete( '/users/:user', <any>[ ownerRights, this.removeUser.bind( this ) ] );
        router.post( '/users/:user/meta/:name', <any>[ adminRights, this.setVal.bind( this ) ] );
        router.post( '/users/:user/meta', <any>[ adminRights, this.setData.bind( this ) ] );

        router.get( '/who-am-i', this.authenticated.bind( this ) );
        router.get( '/sessions', <any>[ ownerRights, this.getSessions.bind( this ) ] );
        router.delete( '/sessions/:id', <any>[ ownerRights, this.deleteSession.bind( this ) ] );
        router.post( '/message-webmaster', this.messageWebmaster.bind( this ) );

        // Register the path
        e.use( config.apiPrefix, router );
    }

    /**
	 * Gets a specific user by username or email - the 'username' parameter must be set. Some of the user data will be obscured unless the verbose parameter
     * is specified. Specify the verbose=true parameter in order to get all user data.
	 */
    private async getUser( req: def.AuthRequest, res: express.Response ) {
        try {
            const user = await UserManager.get.getUser( req.params.username );

            if ( !user )
                throw new Error( 'No user found' );

            okJson<def.IGetUser>( {
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
    private async getUsers( req: def.AuthRequest, res: express.Response ) {
        let verbose = Boolean( req.query.verbose );

        // Only admins are allowed to see sensitive data
        if ( req._user && req._user.dbEntry.privileges === UserPrivileges.SuperAdmin && verbose )
            verbose = true;
        else
            verbose = false;

        try {
            const totalNumUsers = await UserManager.get.numUsers( new RegExp( req.query.search ) );
            const users = await UserManager.get.getUsers( parseInt( req.query.index ), parseInt( req.query.limit ), new RegExp( req.query.search ) );
            const sanitizedData: def.IUserEntry[] = [];

            for ( let i = 0, l = users.length; i < l; i++ )
                sanitizedData.push( users[ i ].generateCleanedData( verbose ) );

            okJson<def.IGetUsers>( {
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
	 * Gets a list of active sessions. You can limit the haul by specifying the 'index' and 'limit' query parameters.
	 */
    private async getSessions( req: express.Request, res: express.Response ) {
        try {
            const numSessions = await UserManager.get.sessionManager.numActiveSessions();
            const sessions = await UserManager.get.sessionManager.getActiveSessions( parseInt( req.query.index ), parseInt( req.query.limit ) )

            okJson<def.IGetSessions>( {
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
            okJson<def.IResponse>( { error: false, message: `Session ${req.params.id} has been removed` }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Attempts to send the webmaster an email message
	 */
    async messageWebmaster( req: express.Request, res: express.Response ) {
        try {
            const token: any = req.body;

            if ( !token.message )
                throw new Error( 'Please specify a message to send' );

            await UserManager.get.sendAdminEmail( token.message, token.name, token.from );
            okJson<def.IResponse>( { error: false, message: 'Your message has been sent to the support team' }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
 	 * Sets a user's meta data
	 */
    private async setData( req: def.AuthRequest, res: express.Response ) {
        const user = req._user!.dbEntry;
        let val = req.body && req.body.value;
        if ( !val )
            val = {};

        try {
            await UserManager.get.setMeta( user, val );
            okJson<def.IResponse>( { message: `User's data has been updated`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Sets a user's meta value
	 */
    private async setVal( req: def.AuthRequest, res: express.Response ) {
        const user = req._user!.dbEntry;
        const name = req.params.name;

        try {
            await UserManager.get.setMetaVal( user, name, req.body.value );
            okJson<def.IResponse>( { message: `Value '${name}' has been updated`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Gets a user's meta value
	 */
    private async getVal( req: def.AuthRequest, res: express.Response ) {
        const user = req._user!.dbEntry;
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
    private async getData( req: def.AuthRequest, res: express.Response ) {
        const user = req._user!.dbEntry;

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
    private async removeUser( req: def.AuthRequest, res: express.Response ) {
        try {
            const toRemove = req.params.user;
            if ( !toRemove )
                throw new Error( 'No user found' );

            await UserManager.get.removeUser( toRemove );

            return okJson<def.IResponse>( { message: `User ${toRemove} has been removed`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

	/**
	 * Allows an admin to create a new user without registration
	 */
    private async createUser( req: express.Request, res: express.Response ) {
        try {
            const token: def.IRegisterToken = req.body;

            // Set default privileges
            token.privileges = token.privileges ? token.privileges : UserPrivileges.Regular;

            // Not allowed to create super users
            if ( token.privileges === UserPrivileges.SuperAdmin )
                throw new Error( 'You cannot create a user with super admin permissions' );

            const user = await UserManager.get.createUser( token.username!, token.email, token.password, ( this._config.ssl ? 'https://' : 'http://' ) + this._config.host, token.privileges, token.meta );
            okJson<def.IGetUser>( {
                error: false,
                message: `User ${user.dbEntry.username} has been created`,
                data: user.dbEntry
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

	/**
	 * Checks to see if the current session is logged in. If the user is, it will be returned redacted. You can specify the 'verbose' query parameter
	 */
    private async authenticated( req: express.Request, res: express.Response ) {
        try {
            const user = await UserManager.get.loggedIn( req, res );
            return okJson<def.IAuthenticationResponse>( {
                message: ( user ? 'User is authenticated' : 'User is not authenticated' ),
                authenticated: ( user ? true : false ),
                error: false,
                user: ( user ? user.generateCleanedData( Boolean( req.query.verbose ) ) : {} )
            }, res );

        } catch ( error ) {
            return okJson<def.IAuthenticationResponse>( {
                message: error.message,
                authenticated: false,
                error: true
            }, res );
        };
    }
}