'use strict';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { UserManager } from '../users';
import { ownerRights } from '../permission-controllers';
import { Controller } from './controller'
import { BucketManager } from '../bucket-manager';
import * as compression from 'compression';
import { okJson, errJson } from '../serializers';
import { Model } from '../models/model';
import { BucketModel } from '../models/bucket-model';

/**
 * Main class to use for managing users
 */
export class StatsController extends Controller {
    private _config: Modepress.IConfig;
    private _allowedFileTypes: Array<string>;

	/**
	 * Creates an instance of the user manager
	 * @param e The express app
	 * @param The config options of this manager
	 */
    constructor( e: express.Express, config: Modepress.IConfig ) {
        super( [ Model.registerModel( BucketModel ) ] );

        this._config = config;

        this._allowedFileTypes = [ 'image/bmp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff', 'text/plain', 'text/json', 'application/octet-stream' ];

        // Setup the rest calls
        const router = express.Router();
        router.use( compression() );
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        router.get( '/users/:user/get-stats', <any>[ ownerRights, this.getStats.bind( this ) ] );
        router.post( '/create-stats/:target', <any>[ ownerRights, this.createStats.bind( this ) ] );
        router.put( '/storage-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateCalls.bind( this ) ] );
        router.put( '/storage-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateMemory.bind( this ) ] );
        router.put( '/storage-allocated-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateAllocatedCalls.bind( this ) ] );
        router.put( '/storage-allocated-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateAllocatedMemory.bind( this ) ] );

        // Register the path
        e.use( `/stats`, router );
    }

    /**
     * Makes sure the target user exists and the numeric value specified is valid
     */
    private async verifyTargetValue( req: Modepress.IAuthReq, res: express.Response, next: Function ) {
        try {
            // Set the content type
            const value = parseInt( req.params.value );

            if ( !req.params.target || req.params.target.trim() === '' )
                throw new Error( 'Please specify a valid user to target' );

            if ( !req.params.value || req.params.value.trim() === '' || isNaN( value ) )
                throw new Error( 'Please specify a valid value' );

            // Make sure the user exists
            const user = await UserManager.get.getUser( req.params.target );

            if ( !user )
                throw new Error( `Could not find the user '${req.params.target}'` );

            req._target = user.dbEntry;
            next();

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's api calls
     */
    private async updateCalls( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target!.username!, <Modepress.IStorageStats>{ apiCallsUsed: value } );
            okJson<Modepress.IResponse>( { message: `Updated the user API calls to [${value}]`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's memory usage
     */
    private async updateMemory( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target!.username!, <Modepress.IStorageStats>{ memoryUsed: value } );

            okJson<Modepress.IResponse>( { message: `Updated the user memory to [${value}] bytes`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's allocated api calls
     */
    private async updateAllocatedCalls( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target!.username!, <Modepress.IStorageStats>{ apiCallsAllocated: value } );
            okJson<Modepress.IResponse>( { message: `Updated the user API calls to [${value}]`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's allocated memory
     */
    private async updateAllocatedMemory( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target!.username!, <Modepress.IStorageStats>{ memoryAllocated: value } );
            okJson<Modepress.IResponse>( { message: `Updated the user memory to [${value}] bytes`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }


    /**
     * Fetches the statistic information for the specified user
     */
    private async getStats( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            const stats = await manager.getUserStats( req._user!.username );

            return okJson<Modepress.IGetUserStorageData>( {
                message: `Successfully retrieved ${req._user!.username}'s stats`,
                error: false,
                data: stats
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }



    /**
     * Creates a new user stat entry. This is usually done for you when creating a new user
     */
    private async createStats( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            await manager.createUserStats( req.params.target );
            okJson<Modepress.IResponse>( { message: `Stats for the user '${req.params.target}' have been created`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }
}