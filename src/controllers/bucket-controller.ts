'use strict';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as users from 'webinate-users';
import * as mongodb from 'mongodb';
import { UserManager } from '../users';
import { ownerRights, requireUser } from '../permission-controllers';
import { Controller } from './controller'
import { BucketManager } from '../bucket-manager';
import * as multiparty from 'multiparty';
import * as compression from 'compression';
import * as winston from 'winston';
import { CommsController } from '../socket-api/comms-controller';
import { ClientInstruction } from '../socket-api/client-instruction';
import { ClientInstructionType } from '../socket-api/socket-event-types';
import * as def from 'webinate-users';
import { okJson, errJson } from '../serializers';
import { Model } from '../models/model';
import { BucketModel } from '../models/bucket-model';

/**
 * Main class to use for managing users
 */
export class BucketController extends Controller {
    private _config: users.IConfig;
    private _allowedFileTypes: Array<string>;

	/**
	 * Creates an instance of the user manager
	 * @param e The express app
	 * @param The config options of this manager
	 */
    constructor( e: express.Express, config: users.IConfig ) {
        super( [ Model.registerModel( BucketModel ) ]);

        this._config = config;

        this._allowedFileTypes = [ 'image/bmp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff', 'text/plain', 'text/json', 'application/octet-stream' ];

        // Setup the rest calls
        const router = express.Router();
        router.use( compression() );
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        router.get( '/files/:id/download', <any>[ this.getFile.bind( this ) ] );
        router.get( '/users/:user/buckets/:bucket/files', <any>[ ownerRights, this.getFiles.bind( this ) ] );
        router.get( '/users/:user/get-stats', <any>[ ownerRights, this.getStats.bind( this ) ] );
        router.get( '/users/:user/buckets', <any>[ ownerRights, this.getBuckets.bind( this ) ] );
        router.delete( '/buckets/:buckets', <any>[ requireUser, this.removeBuckets.bind( this ) ] );
        router.delete( '/files/:files', <any>[ requireUser, this.removeFiles.bind( this ) ] );
        router.post( '/buckets/:bucket/upload/:parentFile?', <any>[ requireUser, this.uploadUserFiles.bind( this ) ] );
        router.post( '/users/:user/buckets/:name', <any>[ ownerRights, this.createBucket.bind( this ) ] );
        router.post( '/create-stats/:target', <any>[ ownerRights, this.createStats.bind( this ) ] );
        router.put( '/stats/storage-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateCalls.bind( this ) ] );
        router.put( '/stats/storage-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateMemory.bind( this ) ] );
        router.put( '/stats/storage-allocated-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateAllocatedCalls.bind( this ) ] );
        router.put( '/stats/storage-allocated-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateAllocatedMemory.bind( this ) ] );
        router.put( '/files/:file/rename-file', <any>[ requireUser, this.renameFile.bind( this ) ] );
        router.put( '/files/:id/make-public', <any>[ requireUser, this.makePublic.bind( this ) ] );
        router.put( '/files/:id/make-private', <any>[ requireUser, this.makePrivate.bind( this ) ] );

        // Register the path
        e.use( `${config.apiPrefix}`, router );
    }

    /**
     * Makes sure the target user exists and the numeric value specified is valid
     */
    private async verifyTargetValue( req: users.AuthRequest, res: express.Response, next: Function ) {
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

            req._target = user;
            next();

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's api calls
     */
    private async updateCalls( req: users.AuthRequest, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target.dbEntry.username!, <users.IStorageStats>{ apiCallsUsed: value } );
            okJson<def.IResponse>( { message: `Updated the user API calls to [${value}]`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's memory usage
     */
    private async updateMemory( req: users.AuthRequest, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target.dbEntry.username!, <users.IStorageStats>{ memoryUsed: value } );

            okJson<def.IResponse>( { message: `Updated the user memory to [${value}] bytes`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's allocated api calls
     */
    private async updateAllocatedCalls( req: users.AuthRequest, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target.dbEntry.username!, <users.IStorageStats>{ apiCallsAllocated: value } );
            okJson<def.IResponse>( { message: `Updated the user API calls to [${value}]`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Updates the target user's allocated memory
     */
    private async updateAllocatedMemory( req: users.AuthRequest, res: express.Response ) {
        try {
            const value = parseInt( req.params.value );
            const manager = BucketManager.get;
            await manager.updateStorage( req._target.dbEntry.username!, <users.IStorageStats>{ memoryAllocated: value } );
            okJson<def.IResponse>( { message: `Updated the user memory to [${value}] bytes`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Removes files specified in the URL
     */
    private async removeFiles( req: users.AuthRequest, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            let files: Array<string>;

            if ( !req.params.files || req.params.files.trim() === '' )
                throw new Error( 'Please specify the files to remove' );

            files = req.params.files.split( ',' );
            const filesRemoved = await manager.removeFilesByIdentifiers( files, req._user!.dbEntry.username );

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
    private async renameFile( req: users.AuthRequest, res: express.Response ) {
        try {
            const manager = BucketManager.get;

            if ( !req.params.file || req.params.file.trim() === '' )
                throw new Error( 'Please specify the file to rename' );
            if ( !req.body || !req.body.name || req.body.name.trim() === '' )
                throw new Error( 'Please specify the new name of the file' );

            const fileEntry = await manager.getFile( req.params.file, req._user!.dbEntry.username );

            if ( !fileEntry )
                throw new Error( `Could not find the file '${req.params.file}'` );

            await manager.renameFile( fileEntry, req.body.name );
            okJson<def.IResponse>( { message: `Renamed file to '${req.body.name}'`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Removes buckets specified in the URL
     */
    private async removeBuckets( req: users.AuthRequest, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            let buckets: Array<string>;

            if ( !req.params.buckets || req.params.buckets.trim() === '' )
                throw new Error( 'Please specify the buckets to remove' );

            buckets = req.params.buckets.split( ',' );

            const filesRemoved = await manager.removeBucketsByName( buckets, req._user!.dbEntry.username! );

            return okJson<users.IRemoveFiles>( {
                message: `Removed [${filesRemoved.length}] buckets`,
                error: false,
                data: filesRemoved,
                count: filesRemoved.length
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Fetches the statistic information for the specified user
     */
    private async getStats( req: users.AuthRequest, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            const stats = await manager.getUserStats( req._user!.dbEntry.username );

            return okJson<users.IGetUserStorageData>( {
                message: `Successfully retrieved ${req._user!.dbEntry.username}'s stats`,
                error: false,
                data: stats
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Attempts to download a file from the server
     */
    private async getFile( req: users.AuthRequest, res: express.Response ) {
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
            winston.error( err.toString(), { process: process.pid } );
            return res.status( 404 ).send( 'File not found' );
        }
    }

    /**
     * Attempts to make a file public
     */
    private async makePublic( req: users.AuthRequest, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            const fileID = req.params.id;

            if ( !fileID || fileID.trim() === '' )
                throw new Error( `Please specify a file ID` );

            let fileEntry = await manager.getFile( fileID, req._user!.dbEntry.username );
            fileEntry = await manager.makeFilePublic( fileEntry );

            okJson<users.IGetFile>( { message: `File is now public`, error: false, data: fileEntry }, res );

        } catch ( err ) {
            return errJson( err, res );
        }
    }

    /**
     * Attempts to make a file private
     */
    private async makePrivate( req: users.AuthRequest, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            const fileID = req.params.id;
            let fileEntry: users.IFileEntry;

            if ( !fileID || fileID.trim() === '' )
                throw new Error( `Please specify a file ID` );

            fileEntry = await manager.getFile( fileID, req._user!.dbEntry.username );
            fileEntry = await manager.makeFilePrivate( fileEntry )

            okJson<users.IGetFile>( { message: `File is now private`, error: false, data: fileEntry }, res );

        } catch ( err ) {
            return errJson( err, res );
        }
    }

    /**
     * Fetches all file entries from the database. Optionally specifying the bucket to fetch from.
     */
    private async getFiles( req: users.AuthRequest, res: express.Response ) {
        const manager = BucketManager.get;
        const index = parseInt( req.query.index );
        const limit = parseInt( req.query.limit );
        let bucketEntry: users.IBucketEntry | null;
        let searchTerm: RegExp | undefined;

        try {
            if ( !req.params.bucket || req.params.bucket.trim() === '' )
                throw new Error( 'Please specify a valid bucket name' );

            // Check for keywords
            if ( req.query.search )
                searchTerm = new RegExp( req.query.search, 'i' );

            bucketEntry = await manager.getIBucket( req.params.bucket, req._user!.dbEntry.username );

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

    /**
	 * Fetches all bucket entries from the database
	 */
    private async getBuckets( req: users.AuthRequest, res: express.Response ) {
        const user = req.params.user;
        const manager = BucketManager.get;
        let searchTerm: RegExp | undefined;

        try {
            // Check for keywords
            if ( req.query.search )
                searchTerm = new RegExp( req.query.search, 'i' );

            const buckets = await manager.getBucketEntries( user, searchTerm );

            return okJson<users.IGetBuckets>( {
                message: `Found [${buckets.length}] buckets`,
                error: false,
                data: buckets,
                count: buckets.length
            }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
     * Creates a new user stat entry. This is usually done for you when creating a new user
     */
    private async createStats( req: users.AuthRequest, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            await manager.createUserStats( req.params.target );
            okJson<users.IResponse>( { message: `Stats for the user '${req.params.target}' have been created`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    private alphaNumericDashSpace( str: string ): boolean {
        if ( !str.match( /^[0-9A-Z _\-]+$/i ) )
            return false;
        else
            return true;
    }

    /**
	 * Creates a new user bucket based on the target provided
	 */
    private async createBucket( req: users.AuthRequest, res: express.Response ) {
        const manager = BucketManager.get;
        const username: string = req.params.user;
        const bucketName: string = req.params.name;

        try {
            if ( !username || username.trim() === '' )
                throw new Error( 'Please specify a valid username' );
            if ( !bucketName || bucketName.trim() === '' )
                throw new Error( 'Please specify a valid name' );
            if ( !this.alphaNumericDashSpace( bucketName ) )
                throw new Error( 'Please only use safe characters' );

            const user = await UserManager.get.getUser( username );
            if ( !user )
                throw new Error( `Could not find a user with the name '${username}'` );

            const inLimits = await manager.withinAPILimit( username );
            if ( !inLimits )
                throw new Error( `You have run out of API calls, please contact one of our sales team or upgrade your account.` );

            await manager.createBucket( bucketName, username );
            okJson<users.IResponse>( { message: `Bucket '${bucketName}' created`, error: false }, res );

        } catch ( err ) {
            return errJson( err, res );
        };
    }

    /**
	 * Checks if a part is allowed to be uploaded
     * @returns {boolean}
	 */
    private isPartAllowed( part: multiparty.Part ): boolean {
        if ( !part.headers )
            return false;

        if ( !part.headers[ 'content-type' ] )
            return false;

        const type = part.headers[ 'content-type' ].toLowerCase();

        if ( type === 'text/plain' || type === 'application/octet-stream' )
            return true;
        else
            return false;
    }

    /**
	 * Checks if a file part is allowed to be uploaded
     * @returns {boolean}
	 */
    private isFileTypeAllowed( part: multiparty.Part ): boolean {
        if ( !part.headers )
            return false;

        if ( !part.headers[ 'content-type' ] )
            return false;

        const allowedTypes = this._allowedFileTypes;
        const type = part.headers[ 'content-type' ].toLowerCase();
        let found = false;
        for ( let i = 0, l = allowedTypes.length; i < l; i++ )
            if ( allowedTypes[ i ] === type ) {
                found = true;
                break;
            }

        if ( !found )
            return false;

        return true;
    }



    private uploadMetaPart( part: multiparty.Part ): Promise<any> {
        let data = '';
        part.setEncoding( 'utf8' );

        return new Promise<any>( function( resolve, reject ) {

            part.on( 'data', function( chunk ) {
                data += chunk;
            } );

            part.on( 'error', function( err: Error ) {
                return reject( new Error( 'Could not download meta: ' + err.toString() ) );
            } );

            part.on( 'end', function() {
                try {
                    return resolve( JSON.parse( data ) );
                } catch ( err ) {
                    return reject( new Error( 'Meta data is not a valid JSON: ' + err.toString() ) );
                }
            } );
        } );
    }

    /**
	 * Attempts to upload a file to the user's bucket
	 */
    private uploadUserFiles( req: users.AuthRequest, res: express.Response ) {
        const form = new multiparty.Form( { maxFields: 8, maxFieldsSize: 5 * 1024 * 1024, maxFilesSize: 10 * 1024 * 1024 } );
        let numParts = 0;
        let completedParts = 0;
        let closed = false;
        const uploadedTokens: Array<users.IUploadToken> = [];
        const manager = BucketManager.get;
        const username = req._user!.dbEntry.username!;
        const parentFile = req.params.parentFile;
        const filesUploaded: Array<UsersInterface.IFileEntry> = [];
        const bucketName = req.params.bucket;
        if ( !bucketName || bucketName.trim() === '' )
            return okJson<users.IUploadResponse>( { message: `Please specify a bucket`, error: true, tokens: [] }, res );

        manager.getIBucket( bucketName, username ).then(( bucketEntry ) => {
            if ( !bucketEntry )
                return okJson<users.IUploadResponse>( { message: `No bucket exists with the name '${bucketName}'`, error: true, tokens: [] }, res );

            let metaJson: any | Error;

            // Parts are emitted when parsing the form
            form.on( 'part', ( part: multiparty.Part ) => {
                // Create a new upload token
                const createToken = function() {
                    return {
                        file: '',
                        field: ( !part.name ? '' : part.name ),
                        filename: part.filename,
                        error: false,
                        errorMsg: '',
                        url: '',
                        extension: ''
                    } as users.IUploadToken;
                }

                // Deal with error logic
                const errFunc = function( errMsg: string, uploadToken: users.IUploadToken | null ) {
                    if ( uploadToken ) {
                        uploadToken.error = true;
                        uploadToken.errorMsg = errMsg;
                    }
                    completedParts++;
                    part.resume();
                    checkIfComplete();
                }

                // Deal with file upload logic
                const fileUploaded = function( uploadedFile: users.IFileEntry, uploadToken: users.IUploadToken ) {
                    filesUploaded.push( uploadedFile );
                    completedParts++;
                    uploadToken.file = uploadedFile.identifier!;
                    uploadToken.url = uploadedFile.publicURL!;
                    part.resume();
                    checkIfComplete();
                }

                // This part is a file - so we act on it
                if ( !!part.filename ) {
                    // Add the token to the upload array we are sending back to the user
                    const uploadToken = createToken();
                    uploadedTokens.push( uploadToken );
                    numParts++;

                    if ( this.isFileTypeAllowed( part ) ) {

                        uploadToken.extension = part.headers[ 'content-type' ].toLowerCase();

                        // Upload the file part to the cloud
                        manager.uploadStream( part, bucketEntry, username, true, parentFile ).then( function( file ) {
                            fileUploaded( file, uploadToken );

                        } ).catch( function( err: Error ) {
                            errFunc( err.toString(), uploadToken );
                        } );
                    }
                    else {
                        errFunc( `File '${part.filename}' cannot be uploaded as its file type is not currently supported`, uploadToken );
                    }
                }
                // Check if this part is a meta tag
                else if ( part.name === 'meta' ) {
                    numParts++;

                    this.uploadMetaPart( part ).then( function( meta ) {

                        metaJson = meta;
                        part.resume();
                        completedParts++;
                        checkIfComplete();

                    } ).catch( function( err: Error ) {

                        metaJson = err;
                        errFunc( err.toString(), null );
                    } )
                }
                // Check if this (non-file) stream is allowed
                else if ( this.isPartAllowed( part ) ) {
                    // Add the token to the upload array we are sending back to the user
                    const uploadToken = createToken();
                    uploadedTokens.push( uploadToken );
                    numParts++;

                    // Upload the file part to the cloud
                    manager.uploadStream( part, bucketEntry, username, true, parentFile ).then( function( file ) {
                        fileUploaded( file, uploadToken );

                    } ).catch( function( err: Error ) {
                        errFunc( err.toString(), uploadToken );
                    } );
                }
                else
                    part.resume();
            } );

            // Close emitted after form parsed
            form.on( 'close', function() {
                closed = true;
                checkIfComplete();
            } );

            // Checks if the connection is closed and all the parts have been uploaded
            const checkIfComplete = () => {
                if ( closed && completedParts === numParts ) {
                    this.finalizeUploads( metaJson, filesUploaded, username, uploadedTokens ).then( function( token ) {
                        return okJson<users.IUploadResponse>( token, res );
                    } );
                }
            }

            // Parse req
            form.parse( <express.Request><Express.Request>req );

        } ).catch( function( err ) {
            return okJson<users.IUploadResponse>( { message: 'Could not get bucket: ' + err.toString(), error: true, tokens: [] }, res );
        } );
    }

    /**
     * After the uploads have been uploaded, we set any meta on the files and send file uploaded events
     * @param meta The optional meta to associate with the uploaded files. The meta can be either a valid JSON or an error. If its
     * an error, then that means the meta could not be parsed
     * @param files The uploaded files
     * @param user The user who uploaded the files
     * @param tokens The upload tokens to be sent back to the client
     */
    private async finalizeUploads( meta: any | Error, files: Array<users.IFileEntry>, user: string, tokens: Array<users.IUploadToken> ): Promise<users.IUploadResponse> {
        try {
            const manager = BucketManager.get;
            let error = false;
            let msg = `Upload complete. [${files.length}] Files have been saved.`;

            // If we have any an error with the meta, then remove all the uploaded files
            if ( meta && meta instanceof Error ) {
                error = true;
                const fileIds: Array<string> = files.map( file => file.identifier!.toString() );
                await manager.removeFilesByIdentifiers( fileIds );

                files = [];
                tokens = [];
                msg = meta.toString();
            }
            // If we have any meta, then update the file entries with it
            else if ( meta && meta && files.length > 0 ) {
                const query = { $or: [] as users.IFileEntry[] };
                for ( let i = 0, l = files.length; i < l; i++ ) {
                    query.$or.push( <users.IFileEntry>{ _id: new mongodb.ObjectID( files[ i ]._id ) } );

                    // Manually add the meta to the files
                    files[ i ].meta = meta;
                }

                await manager.setMeta( query, meta );
            }

            // Notify the sockets of each file that was uploaded
            for ( let i = 0, l = files.length; i < l; i++ ) {
                // Send file added events to sockets
                const token: def.SocketTokens.IFileToken = { username: user, type: ClientInstructionType[ ClientInstructionType.FileUploaded ], file: files[ i ] };
                await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, user ) )
            }


            // Override the default message if the tokens had an issue
            for ( let i = 0, l = tokens.length; i < l; i++ )
                if ( tokens[ i ].error ) {
                    error = true;
                    msg = 'There was a problem with your upload. Please check the tokens for more information.';
                    break;
                }

            return <users.IUploadResponse>{ message: msg, error: error, tokens: tokens };

        } catch ( err ) {
            return <users.IUploadResponse>{ message: err.toString(), error: true, tokens: [] };
        };
    }
}