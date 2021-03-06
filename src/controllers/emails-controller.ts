﻿import { IMessage } from 'modepress';
import * as express from 'express';
import { Controller } from './controller';
import * as bodyParser from 'body-parser';
import { UserManager } from '../core/users'
import { errJson } from '../utils/serializers';
import { IBaseControler } from 'modepress';
import * as mongodb from 'mongodb';

export class EmailsController extends Controller {
    private _options: IBaseControler;

	/**
	 * Creates a new instance of the email controller
	 */
    constructor( options: IBaseControler ) {
        super( null );
        this._options = options;
    }

    /**
	 * Called to initialize this controller and its related database objects
	 */
    async initialize( e: express.Express, db: mongodb.Db ): Promise<Controller> {


        const router = express.Router();
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        // Filter the post requests
        router.post( '/', this.onPost.bind( this ) );

        // Register the path
        e.use(( this._options.rootPath || '' ) + '/message-admin', router );

        await super.initialize( e, db );
        return this;
    }

	/**
	 * Called whenever a post request is caught by this controller
	 */
    protected onPost( req: express.Request, res: express.Response ): any {
        // Set the content type
        res.setHeader( 'Content-Type', 'application/json' );

        const message: string = [ `Hello admin,`,
            `We have received a message from ${( <IMessage>req.body ).name}:`,
            `${( <IMessage>req.body ).message}`,
            ``,
            `Email: ${( <IMessage>req.body ).email}`,
            `Phone: ${( <IMessage>req.body ).phone}`,
            `Website: ${( <IMessage>req.body ).website}` ].join( '\r\n' );

        UserManager.get.sendAdminEmail( message ).then( function( body ) {
            res.end( body );

        } ).catch( function( err ) {
            errJson( err, res );
        } );
    }
}