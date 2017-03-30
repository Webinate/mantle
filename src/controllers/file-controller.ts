'use strict';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as users from 'modepress-api';
import { ownerRights, requireUser } from '../permission-controllers';
import { Controller } from './controller'
import { BucketManager } from '../bucket-manager';
import * as compression from 'compression';
import { error as logError } from '../logger';
import { okJson, errJson } from '../serializers';
import { Model } from '../models/model';
import { BucketModel } from '../models/bucket-model';

/**
 * Main class to use for managing users
 */
export class FileController extends Controller {
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

        router.get( '/:id/download', <any>[ this.getFile.bind( this ) ] );
        router.get( '/users/:user/buckets/:bucket', <any>[ ownerRights, this.getFiles.bind( this ) ] );
        router.delete( '/:files', <any>[ requireUser, this.removeFiles.bind( this ) ] );
        router.put( '/:file/rename-file', <any>[ requireUser, this.renameFile.bind( this ) ] );
        router.put( '/:id/make-public', <any>[ requireUser, this.makePublic.bind( this ) ] );
        router.put( '/:id/make-private', <any>[ requireUser, this.makePrivate.bind( this ) ] );

        // Register the path
        e.use( `/files`, router );
    }


    /**
     * Removes files specified in the URL
     */
    private async removeFiles( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            let files: Array<string>;

            if ( !req.params.files || req.params.files.trim() === '' )
                throw new Error( 'Please specify the files to remove' );

            files = req.params.files.split( ',' );
            const filesRemoved = await manager.removeFilesByIdentifiers( files, req._user!.username );

            okJson<users.IRemoveFiles>( {
                message: `Removed [${filesRemoved.length}] files`,
                error: false,
                data: filesRemoved,
                count: filesRemoved.length
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Renames a file
     */
    private async renameFile( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;

            if ( !req.params.file || req.params.file.trim() === '' )
                throw new Error( 'Please specify the file to rename' );
            if ( !req.body || !req.body.name || req.body.name.trim() === '' )
                throw new Error( 'Please specify the new name of the file' );

            const fileEntry = await manager.getFile( req.params.file, req._user!.username );

            if ( !fileEntry )
                throw new Error( `Could not find the file '${req.params.file}'` );

            await manager.renameFile( fileEntry, req.body.name );
            okJson<users.IResponse>( { message: `Renamed file to '${req.body.name}'`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Attempts to download a file from the server
     */
    private async getFile( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            const fileID = req.params.id;
            let file: users.IFileEntry;
            const cache = this._config.google.bucket.cacheLifetime;

            if ( !fileID || fileID.trim() === '' )
                throw new Error( `Please specify a file ID` );

            file = await manager.getFile( fileID );
            res.setHeader( 'Content-Type', file.mimeType! );
            res.setHeader( 'Content-Length', file.size!.toString() );
            if ( cache )
                res.setHeader( 'Cache-Control', 'public, max-age=' + cache );

            manager.downloadFile( <express.Request><Express.Request>req, res, file );
            manager.incrementAPI( file.user! );

        } catch ( err ) {
            logError( err.toString() );
            return res.status( 404 ).send( 'File not found' );
        }
    }

    /**
     * Attempts to make a file public
     */
    private async makePublic( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            const fileID = req.params.id;

            if ( !fileID || fileID.trim() === '' )
                throw new Error( `Please specify a file ID` );

            let fileEntry = await manager.getFile( fileID, req._user!.username );
            fileEntry = await manager.makeFilePublic( fileEntry );

            okJson<users.IGetFile>( { message: `File is now public`, error: false, data: fileEntry }, res );

        } catch ( err ) {
            return errJson( err, res );
        }
    }

    /**
     * Attempts to make a file private
     */
    private async makePrivate( req: Modepress.IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            const fileID = req.params.id;
            let fileEntry: users.IFileEntry;

            if ( !fileID || fileID.trim() === '' )
                throw new Error( `Please specify a file ID` );

            fileEntry = await manager.getFile( fileID, req._user!.username );
            fileEntry = await manager.makeFilePrivate( fileEntry )

            okJson<users.IGetFile>( { message: `File is now private`, error: false, data: fileEntry }, res );

        } catch ( err ) {
            return errJson( err, res );
        }
    }

    /**
     * Fetches all file entries from the database. Optionally specifying the bucket to fetch from.
     */
    private async getFiles( req: Modepress.IAuthReq, res: express.Response ) {
        const manager = BucketManager.get;
        const index = parseInt( req.query.index );
        const limit = parseInt( req.query.limit );
        let bucketEntry: users.IBucketEntry | null;
        let searchTerm: RegExp | undefined;

        try {

            ownerRights( req, res )

            if ( !req.params.bucket || req.params.bucket.trim() === '' )
                throw new Error( 'Please specify a valid bucket name' );

            // Check for keywords
            if ( req.query.search )
                searchTerm = new RegExp( req.query.search, 'i' );

            bucketEntry = await manager.getIBucket( req.params.bucket, req._user!.username );

            if ( !bucketEntry )
                throw new Error( `Could not find the bucket '${req.params.bucket}'` );

            const count = await manager.numFiles( { bucketId: bucketEntry.identifier } );
            const files = await manager.getFilesByBucket( bucketEntry, index, limit, searchTerm );

            return okJson<users.IGetFiles>( {
                message: `Found [${count}] files`,
                error: false,
                data: files,
                count: count
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }
}