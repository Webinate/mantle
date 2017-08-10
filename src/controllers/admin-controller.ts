'use strict';
import { IResponse } from 'modepress';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { UserManager } from '../core/users';
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
export class AdminController extends Controller {
    private _options: IBaseControler;

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

        router.post( '/message-webmaster', this.messageWebmaster.bind( this ) );

        // Register the path
        e.use(( this._options.rootPath || '' ) + '/admin', router );

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

        await UserManager.get.sendAdminEmail( token.message, token.name, token.from );
        return { message: 'Your message has been sent to the support team' } as IResponse;
    }
}