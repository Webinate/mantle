'use strict';

import { IConfig, IFileEntry, IUploadToken, IAuthReq, IRemoveFiles, IGetBuckets, IResponse, IUploadResponse } from 'modepress';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as mongodb from 'mongodb';
import { UserManager } from '../core/users';
import { ownerRights, requireUser } from '../utils/permission-controllers';
import { Controller } from './controller'
import { BucketManager } from '../core/bucket-manager';
import * as multiparty from 'multiparty';
import * as compression from 'compression';
import { CommsController } from '../socket-api/comms-controller';
import { ClientInstruction } from '../socket-api/client-instruction';
import { ClientInstructionType } from '../socket-api/socket-event-types';
import { okJson, errJson } from '../utils/serializers';
import { Model } from '../models/model';
import { BucketModel } from '../models/bucket-model';

/**
 * Main class to use for managing users
 */
export class BucketController extends Controller {
    private _config: IConfig;
    private _allowedFileTypes: Array<string>;

	/**
	 * Creates an instance of the user manager
	 * @param e The express app
	 * @param The config options of this manager
	 */
    constructor( e: express.Express, config: IConfig ) {
        super( [ Model.registerModel( BucketModel ) ] );

        this._config = config;

        this._allowedFileTypes = [ 'image/bmp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff', 'text/plain', 'text/json', 'application/octet-stream' ];

        // Setup the rest calls
        const router = express.Router();
        router.use( compression() );
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        router.get( '/user/:user', <any>[ ownerRights, this.getBuckets.bind( this ) ] );
        router.delete( '/:buckets', <any>[ requireUser, this.removeBuckets.bind( this ) ] );
        router.post( '/:bucket/upload/:parentFile?', <any>[ requireUser, this.uploadUserFiles.bind( this ) ] );
        router.post( '/user/:user/:name', <any>[ ownerRights, this.createBucket.bind( this ) ] );

        // Register the path
        e.use( `/buckets`, router );
    }

    /**
     * Removes buckets specified in the URL
     */
    private async removeBuckets( req: IAuthReq, res: express.Response ) {
        try {
            const manager = BucketManager.get;
            let buckets: Array<string>;

            if ( !req.params.buckets || req.params.buckets.trim() === '' )
                throw new Error( 'Please specify the buckets to remove' );

            buckets = req.params.buckets.split( ',' );

            const filesRemoved = await manager.removeBucketsByName( buckets, req._user!.username! );

            return okJson<IRemoveFiles>( {
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
	 * Fetches all bucket entries from the database
	 */
    private async getBuckets( req: IAuthReq, res: express.Response ) {
        const user = req.params.user;
        const manager = BucketManager.get;
        let searchTerm: RegExp | undefined;

        try {
            // Check for keywords
            if ( req.query.search )
                searchTerm = new RegExp( req.query.search, 'i' );

            const buckets = await manager.getBucketEntries( user, searchTerm );

            return okJson<IGetBuckets>( {
                message: `Found [${buckets.length}] buckets`,
                error: false,
                data: buckets,
                count: buckets.length
            }, res );

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
    private async createBucket( req: IAuthReq, res: express.Response ) {
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
            okJson<IResponse>( { message: `Bucket '${bucketName}' created`, error: false }, res );

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
    private uploadUserFiles( req: IAuthReq, res: express.Response ) {
        const form = new multiparty.Form( { maxFields: 8, maxFieldsSize: 5 * 1024 * 1024, maxFilesSize: 10 * 1024 * 1024 } );
        let numParts = 0;
        let completedParts = 0;
        let closed = false;
        const uploadedTokens: Array<IUploadToken> = [];
        const manager = BucketManager.get;
        const username = req._user!.username!;
        const parentFile = req.params.parentFile;
        const filesUploaded: Array<IFileEntry> = [];
        const bucketName = req.params.bucket;
        if ( !bucketName || bucketName.trim() === '' )
            return okJson<IUploadResponse>( { message: `Please specify a bucket`, error: true, tokens: [] }, res );

        manager.getIBucket( bucketName, username ).then(( bucketEntry ) => {
            if ( !bucketEntry )
                return okJson<IUploadResponse>( { message: `No bucket exists with the name '${bucketName}'`, error: true, tokens: [] }, res );

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
                    } as IUploadToken;
                }

                // Deal with error logic
                const errFunc = function( errMsg: string, uploadToken: IUploadToken | null ) {
                    if ( uploadToken ) {
                        uploadToken.error = true;
                        uploadToken.errorMsg = errMsg;
                    }
                    completedParts++;
                    part.resume();
                    checkIfComplete();
                }

                // Deal with file upload logic
                const fileUploaded = function( uploadedFile: IFileEntry, uploadToken: IUploadToken ) {
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
                        return okJson<IUploadResponse>( token, res );
                    } );
                }
            }

            // Parse req
            form.parse( <express.Request><Express.Request>req );

        } ).catch( function( err ) {
            return okJson<IUploadResponse>( { message: 'Could not get bucket: ' + err.toString(), error: true, tokens: [] }, res );
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
    private async finalizeUploads( meta: any | Error, files: Array<IFileEntry>, user: string, tokens: Array<IUploadToken> ): Promise<IUploadResponse> {
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
                const query = { $or: [] as IFileEntry[] };
                for ( let i = 0, l = files.length; i < l; i++ ) {
                    query.$or.push( <IFileEntry>{ _id: new mongodb.ObjectID( files[ i ]._id ) } );

                    // Manually add the meta to the files
                    files[ i ].meta = meta;
                }

                await manager.setMeta( query, meta );
            }

            // Notify the sockets of each file that was uploaded
            for ( let i = 0, l = files.length; i < l; i++ ) {
                // Send file added events to sockets
                const token = { username: user, type: ClientInstructionType[ ClientInstructionType.FileUploaded ], file: files[ i ] };
                await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, user ) )
            }


            // Override the default message if the tokens had an issue
            for ( let i = 0, l = tokens.length; i < l; i++ )
                if ( tokens[ i ].error ) {
                    error = true;
                    msg = 'There was a problem with your upload. Please check the tokens for more information.';
                    break;
                }

            return <IUploadResponse>{ message: msg, error: error, tokens: tokens };

        } catch ( err ) {
            return <IUploadResponse>{ message: err.toString(), error: true, tokens: [] };
        };
    }
}