'use strict';

import * as users from 'webinate-users';
import * as fs from 'fs';
import * as gcloud from 'gcloud';
import * as mongodb from 'mongodb';
import * as multiparty from 'multiparty';
import * as zlib from 'zlib';
import * as compressible from 'compressible';
import express = require( 'express' );
import { CommsController } from './socket-api/comms-controller';
import { ClientInstructionType } from './socket-api/socket-event-types';
import { ClientInstruction } from './socket-api/client-instruction';
import * as def from 'webinate-users';
import * as yargs from 'yargs';

const args = yargs.argv;

/**
 * Class responsible for managing buckets and uploads to Google storage
 */
export class BucketManager {
    private static MEMORY_ALLOCATED: number = 5e+8; // 500mb
    private static API_CALLS_ALLOCATED: number = 20000; // 20,000

    private static _singleton: BucketManager;
    private _gcs: gcloud.IGCS;
    private _buckets: mongodb.Collection;
    private _files: mongodb.Collection;
    private _stats: mongodb.Collection;
    private _zipper: zlib.Gzip;
    private _unzipper: zlib.Gunzip;
    private _deflater: zlib.Deflate;

    constructor( buckets: mongodb.Collection, files: mongodb.Collection, stats: mongodb.Collection, config: Modepress.IConfig ) {
        BucketManager._singleton = this;
        this._gcs = gcloud.storage( { projectId: config.google.bucket.projectId, keyFilename: args.keyFile || config.google.keyFile } );
        this._buckets = buckets;
        this._files = files;
        this._stats = stats;
        this._zipper = zlib.createGzip();
        this._unzipper = zlib.createGunzip();
        this._deflater = zlib.createDeflate();
    }

    /**
     * Fetches all bucket entries from the database
     * @param user [Optional] Specify the user. If none provided, then all buckets are retrieved
     * @param searchTerm [Optional] Specify a search term
     */
    async getBucketEntries( user?: string, searchTerm?: RegExp ): Promise<Array<users.IBucketEntry>> {
        const bucketCollection = this._buckets;
        const search: users.IBucketEntry = {};
        if ( user )
            search.user = user;

        if ( searchTerm )
            ( <any>search ).name = searchTerm;

        // Save the new entry into the database
        const buckets: Array<users.IBucketEntry> = await bucketCollection.find( search ).toArray();
        return buckets;
    }

    /**
     * Fetches the file count based on the given query
     * @param searchQuery The search query to idenfify files
     */
    async numFiles( searchQuery: users.IFileEntry ): Promise<number> {
        const filesCollection = this._files;
        const count = await filesCollection.count( searchQuery );
        return count;
    }

    /**
     * Fetches all file entries by a given query
     * @param searchQuery The search query to idenfify files
     */
    async getFiles( searchQuery: any, startIndex?: number, limit: number = -1 ): Promise<Array<users.IFileEntry>> {
        const filesCollection = this._files;

        // Save the new entry into the database
        const files: Array<users.IFileEntry> = await filesCollection.find( searchQuery ).skip( startIndex! ).limit( limit ).toArray();
        return files;
    }

    /**
     * Updates all file entries for a given search criteria with custom meta data
     * @param searchQuery The search query to idenfify files
     * @param meta Optional meta data to associate with the files
     */
    async setMeta( searchQuery: any, meta: any ): Promise<boolean> {
        const filesCollection = this._files;

        // Save the new entry into the database
        await filesCollection.updateMany( searchQuery, { $set: <users.IFileEntry>{ meta: meta } } );
        return true;
    }

    /**
     * Fetches all file entries from the database for a given bucket
     * @param bucket Specify the bucket from which he files belong to
     * @param startIndex Specify the start index
     * @param limit Specify the number of files to retrieve
     * @param searchTerm Specify a search term
     */
    getFilesByBucket( bucket: users.IBucketEntry, startIndex?: number, limit?: number, searchTerm?: RegExp ): Promise<Array<users.IFileEntry>> {
        const searchQuery: users.IFileEntry = { bucketId: bucket.identifier };

        if ( searchTerm )
            ( <any>searchQuery ).name = searchTerm;

        return this.getFiles( searchQuery, startIndex, limit );
    }

    /**
     * Fetches the storage/api data for a given user
     * @param user The user whos data we are fetching
     */
    async getUserStats( user?: string ): Promise<users.IStorageStats> {
        const stats = this._stats;

        // Save the new entry into the database
        const result: users.IStorageStats = await stats.find( <users.IStorageStats>{ user: user } ).limit( 1 ).next();

        if ( !result )
            throw new Error( `Could not find storage data for the user '${user}'` );

        return result;
    }

    /**
     * Attempts to create a user usage statistics
     * @param user The user associated with this bucket
     */
    async createUserStats( user: string ): Promise<users.IStorageStats> {
        const stats = this._stats;

        const storage: users.IStorageStats = {
            user: user,
            apiCallsAllocated: BucketManager.API_CALLS_ALLOCATED,
            memoryAllocated: BucketManager.MEMORY_ALLOCATED,
            apiCallsUsed: 0,
            memoryUsed: 0
        }

        const insertResult = await stats.insertOne( storage );
        return <users.IStorageStats>insertResult.ops[ 0 ];
    }

    /**
     * Attempts to remove the usage stats of a given user
     * @param user The user associated with this bucket
     * @returns A promise of the number of stats removed
     */
    async removeUserStats( user: string ): Promise<number> {
        const stats = this._stats;

        const deleteResult = await stats.deleteOne( <users.IStorageStats>{ user: user } );
        return deleteResult.deletedCount!;
    }

    /**
     * Attempts to remove all data associated with a user
     * @param user The user we are removing
     */
    async removeUser( user: string ): Promise<void> {
        this._stats;
        await this.removeBucketsByUser( user );
        await this.removeUserStats( user );
        return;
    }

    /**
     * Attempts to create a new google storage bucket
     * @param bucketID The id of the bucket entry
     */
    private createGBucket( bucketID: string ): Promise<gcloud.IBucket> {
        const gcs = this._gcs;
        const cors = {
            location: 'EU',
            cors: [
                {
                    'origin': [
                        '*'
                    ],
                    'method': [
                        'GET', 'OPTIONS'
                    ],
                    'responseHeader': [
                        'content-type', 'authorization', 'content-length', 'x-requested-with', 'x-mime-type', 'x-file-name', 'cache-control'
                    ],
                    'maxAgeSeconds': 1
                }
            ]
        };

        return new Promise<gcloud.IBucket>( function( resolve, reject ) {
            // Attempt to create a new Google bucket
            gcs.createBucket( bucketID, cors, function( err: Error, bucket: gcloud.IBucket ) {
                if ( err )
                    return reject( new Error( `Could not create a new bucket: '${err.message}'` ) );

                resolve( bucket );
            } );
        } );
    }

    /**
     * Attempts to create a new user bucket by first creating the storage on the cloud and then updating the internal DB
     * @param name The name of the bucket
     * @param user The user associated with this bucket
     */
    async createBucket( name: string, user: string ): Promise<gcloud.IBucket> {
        const bucketID = `webinate-bucket-${this.generateRandString( 8 ).toLowerCase()}`;
        const bucketCollection = this._buckets;
        const stats = this._stats;

        // Get the entry
        let bucketEntry = await this.getIBucket( name, user );

        // Make sure no bucket already exists with that name
        if ( bucketEntry )
            throw new Error( `A Bucket with the name '${name}' has already been registered` );

        // Attempt to create a new Google bucket
        const gBucket = await this.createGBucket( bucketID );

        // Create the new bucket
        bucketEntry = {
            name: name,
            identifier: bucketID,
            created: Date.now(),
            user: user,
            memoryUsed: 0
        }

        // Save the new entry into the database
        const insertResult = await bucketCollection.insertOne( bucketEntry );
        bucketEntry = insertResult.ops[ 0 ];

        // Increments the API calls
        await stats.updateOne( <users.IStorageStats>{ user: user }, { $inc: <users.IStorageStats>{ apiCallsUsed: 1 } } );

        // Send bucket added events to sockets
        const token: def.SocketTokens.IBucketToken = { type: ClientInstructionType[ ClientInstructionType.BucketUploaded ], bucket: bucketEntry!, username: user };
        await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, user ) );
        return gBucket;
    }

    /**
     * Attempts to remove buckets of the given search result. This will also update the file and stats collection.
     * @param searchQuery A valid mongodb search query
     * @returns An array of ID's of the buckets removed
     */
    private async removeBuckets( searchQuery ): Promise<Array<string>> {
        const bucketCollection = this._buckets;
        this._files;
        this._stats;
        const toRemove: Array<string> = [];

        // Get all the buckets
        const buckets: Array<users.IBucketEntry> = await bucketCollection.find( searchQuery ).toArray();

        // Now delete each one
        try {
            for ( let i = 0, l = buckets.length; i < l; i++ ) {
                const bucket = await this.deleteBucket( buckets[ i ] );
                toRemove.push( bucket.identifier! );
            }

            // Return an array of all the bucket ids that were removed
            return toRemove;

        } catch ( err ) {
            // If there is an error throw with a bit more info
            throw new Error( `Could not delete bucket: ${err.message}` );
        };
    }

    /**
     * Attempts to remove buckets by id
     * @param buckets An array of bucket IDs to remove
     * @param user The user to whome these buckets belong
     * @returns An array of ID's of the buckets removed
     */
    removeBucketsByName( buckets: Array<string>, user: string ): Promise<Array<string>> {
        if ( buckets.length === 0 )
            return Promise.resolve( [] );

        // Create the search query for each of the files
        const searchQuery = { $or: [] as users.IBucketEntry[], user: user };
        for ( let i = 0, l = buckets.length; i < l; i++ )
            searchQuery.$or.push( <users.IBucketEntry>{ name: buckets[ i ] } );

        return this.removeBuckets( searchQuery );
    }

    /**
     * Attempts to remove a user bucket
     * @param user The user associated with this bucket
     * @returns An array of ID's of the buckets removed
     */
    removeBucketsByUser( user: string ): Promise<Array<string>> {
        return this.removeBuckets( <users.IBucketEntry>{ user: user } );
    }

    private deleteGBucket( bucketId: string ): Promise<void> {
        const gcs = this._gcs;

        // Now remove the bucket itself
        const bucket: gcloud.IBucket = gcs.bucket( bucketId );

        return new Promise<void>( function( resolve, reject ) {
            bucket.delete( function( err: Error ) {
                // If there is an error then return - but not if the file is not found. More than likely
                // it was removed by an admin
                if ( err && ( <any>err ).code !== 404 )
                    return reject( new Error( `Could not remove bucket from storage system: '${err.message}'` ) );
                else
                    return resolve();
            } );
        } );
    }

    /**
     * Deletes the bucket from storage and updates the databases
     */
    private async deleteBucket( bucketEntry: users.IBucketEntry ): Promise<users.IBucketEntry> {
        const bucketCollection = this._buckets;
        const stats = this._stats;

        try {
            // First remove all bucket files
            await this.removeFilesByBucket( bucketEntry.identifier! );
        } catch ( err ) {
            throw new Error( `Could not remove the bucket: '${err.toString()}'` );
        }

        await this.deleteGBucket( bucketEntry.identifier! );

        // Remove the bucket entry
        await bucketCollection.deleteOne( <users.IBucketEntry>{ _id: bucketEntry._id } );
        await stats.updateOne( <users.IStorageStats>{ user: bucketEntry.user }, { $inc: <users.IStorageStats>{ apiCallsUsed: 1 } } );

        // Send events to sockets
        const token: def.SocketTokens.IBucketToken = { type: ClientInstructionType[ ClientInstructionType.BucketRemoved ], bucket: bucketEntry, username: bucketEntry.user! };
        await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, bucketEntry.user ) );

        return bucketEntry;
    }

    /**
     * Deletes a file from google storage
     * @param bucketId
     * @param fileId
     */
    private deleteGFile( bucketId: string, fileId: string ): Promise<void> {
        const gcs = this._gcs;
        const bucket: gcloud.IBucket = gcs.bucket( bucketId );

        return new Promise<void>( function( resolve, reject ) {

            // Get the bucket and delete the file
            bucket.file( fileId ).delete( function( err ) {
                // If there is an error then return - but not if the file is not found. More than likely
                // it was removed by an admin
                if ( err && ( <any>err ).code !== 404 )
                    return reject( new Error( `Could not remove file '${fileId}' from storage system: '${err.toString()}'` ) );

                resolve();
            } );
        } );
    }

    /**
     * Deletes the file from storage and updates the databases
     * @param fileEntry
     */
    private async deleteFile( fileEntry: users.IFileEntry ): Promise<users.IFileEntry> {
        const bucketCollection = this._buckets;
        const files = this._files;
        const stats = this._stats;

        const bucketEntry = await this.getIBucket( fileEntry.bucketId! );
        if ( !bucketEntry )
            throw new Error( `Could not find the bucket '${fileEntry.bucketName}'` );

        // Get the bucket and delete the file
        await this.deleteGFile( bucketEntry.identifier!, fileEntry.identifier! );

        // Update the bucket data usage
        await bucketCollection.updateOne( <users.IBucketEntry>{ identifier: bucketEntry.identifier }, { $inc: <users.IBucketEntry>{ memoryUsed: -fileEntry.size! } } );
        await files.deleteOne( <users.IFileEntry>{ _id: fileEntry._id } );
        await stats.updateOne( <users.IStorageStats>{ user: bucketEntry.user }, { $inc: <users.IStorageStats>{ memoryUsed: -fileEntry.size!, apiCallsUsed: 1 } } );

        // Update any listeners on the sockets
        const token: def.SocketTokens.IFileToken = { type: ClientInstructionType[ ClientInstructionType.FileRemoved ], file: fileEntry, username: fileEntry.user! };
        await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, fileEntry.user ) );

        return fileEntry;
    }

    /**
     * Attempts to remove files from the cloud and database by a query
     * @param searchQuery The query we use to select the files
     * @returns Returns the file IDs of the files removed
     */
    async removeFiles( searchQuery: any ): Promise<Array<string>> {
        const files = this._files;
        const filesRemoved: Array<string> = [];

        // Get the files
        const fileEntries: Array<users.IFileEntry> = await files.find( searchQuery ).toArray();

        for ( let i = 0, l = fileEntries.length; i < l; i++ ) {
            const fileEntry = await this.deleteFile( fileEntries[ i ] );
            filesRemoved.push( fileEntry._id );
        }

        return filesRemoved;
    }

    /**
     * Attempts to remove files from the cloud and database
    * @param fileIDs The file IDs to remove
    * @param user Optionally pass in the user to refine the search
    * @returns Returns the file IDs of the files removed
    */
    removeFilesByIdentifiers( fileIDs: Array<string>, user?: string ): Promise<Array<string>> {
        if ( fileIDs.length === 0 )
            return Promise.resolve( [] );

        // Create the search query for each of the files
        const searchQuery = { $or: [] as users.IFileEntry[] };
        for ( let i = 0, l = fileIDs.length; i < l; i++ )
            searchQuery.$or.push( <users.IFileEntry>{ identifier: fileIDs[ i ] }, <users.IFileEntry>{ parentFile: fileIDs[ i ] } );

        if ( user )
            ( <users.IFileEntry>searchQuery ).user = user;

        return this.removeFiles( searchQuery );
    }

    /**
     * Attempts to remove files from the cloud and database that are in a given bucket
     * @param bucket The id or name of the bucket to remove
     * @returns Returns the file IDs of the files removed
     */
    removeFilesByBucket( bucket: string ): Promise<Array<string> | Error> {
        if ( !bucket || bucket.trim() === '' )
            return Promise.reject<Error>( new Error( 'Please specify a valid bucket' ) );

        // Create the search query for each of the files
        const searchQuery = { $or: <Array<users.IFileEntry>>[ { bucketId: bucket }, { bucketName: bucket }] };
        return this.removeFiles( searchQuery );
    }

    /**
     * Gets a bucket entry by its name or ID
     * @param bucket The id of the bucket. You can also use the name if you provide the user
     * @param user The username associated with the bucket (Only applicable if bucket is a name and not an ID)
     */
    async getIBucket( bucket: string, user?: string ): Promise<users.IBucketEntry | null> {
        const bucketCollection = this._buckets;
        const searchQuery: users.IBucketEntry = {};

        if ( user ) {
            searchQuery.user = user;
            searchQuery.name = bucket;
        }
        else
            searchQuery.identifier = bucket;

        const result: users.IBucketEntry = await bucketCollection.find( searchQuery ).limit( 1 ).next();

        if ( !result )
            return null;
        else
            return result;
    }

    /**
     * Checks to see the user's storage limits to see if they are allowed to upload data
     * @param user The username
     * @param part
     */
    private async canUpload( user: string, part: multiparty.Part ): Promise<users.IStorageStats> {
        const stats = this._stats;

        const result: users.IStorageStats = await stats.find( <users.IStorageStats>{ user: user } ).limit( 1 ).next();

        if ( result.memoryUsed! + part.byteCount < result.memoryAllocated! ) {
            if ( result.apiCallsUsed! + 1 < result.apiCallsAllocated! )
                return result;
            else
                throw new Error( 'You have reached your API call limit. Please upgrade your plan for more API calls' );
        }
        else
            throw new Error( 'You do not have enough memory allocated. Please upgrade your account for more memory' );
    }

    /**
     * Checks to see the user's api limit and make sure they can make calls
     * @param user The username
     */
    async withinAPILimit( user: string ): Promise<boolean> {
        const stats = this._stats;
        const result: users.IStorageStats = await stats.find( <users.IStorageStats>{ user: user } ).limit( 1 ).next();

        if ( !result )
            throw new Error( `Could not find the user ${user}` );

        else if ( result.apiCallsUsed! + 1 < result.apiCallsAllocated! )
            return true;
        else
            return false;
    }

    /**
     * Adds an API call to a user
     * @param user The username
     */
    async incrementAPI( user: string ): Promise<boolean> {
        const stats = this._stats;
        await stats.updateOne( <users.IStorageStats>{ user: user }, { $inc: <users.IStorageStats>{ apiCallsUsed: 1 } } );
        return true;
    }

    /**
     * Makes a google file publicly or private
     * @param bucketId
     * @param fileId
     * @param val
     */
    private makeGFilePublic( bucketId: string, fileId: string, val: boolean ): Promise<void> {
        const bucket = this._gcs.bucket( bucketId );
        const rawFile = bucket.file( fileId );

        return new Promise<void>( function( resolve, reject ) {
            if ( val ) {
                rawFile.makePublic( function( err ) {
                    if ( err )
                        return reject( err );

                    resolve();
                } );
            }
            else {
                rawFile.makePrivate( function( err ) {
                    if ( err )
                        return reject( err );

                    resolve();
                } );
            }
        } );
    }

    /**
     * Makes a file publicly available
     * @param file
     */
    async makeFilePublic( file: users.IFileEntry ): Promise<users.IFileEntry> {
        const val = await this.withinAPILimit( file.user! );

        if ( !val )
            throw new Error( 'You do not have enough API calls left to make this request' );

        await this.incrementAPI( file.user! );
        await this.makeGFilePublic( file.bucketId!, file.identifier!, true );
        await this._files.updateOne( <users.IFileEntry>{ bucketId: file.bucketId, identifier: file.identifier }, { $set: <users.IFileEntry>{ isPublic: true } } );
        return file;

    }

    /**
     * Makes a file private
     * @param file
     */
    async makeFilePrivate( file: users.IFileEntry ): Promise<users.IFileEntry> {
        const val = await this.withinAPILimit( file.user! );

        if ( !val )
            throw new Error( 'You do not have enough API calls left to make this request' );

        await this.incrementAPI( file.user! );
        await this.makeGFilePublic( file.bucketId!, file.identifier!, false );
        await this._files.updateOne( <users.IFileEntry>{ bucketId: file.bucketId, identifier: file.identifier }, { $set: <users.IFileEntry>{ isPublic: true } } );
        return file;
    }

    /**
     * Registers an uploaded part as a new user file in the local dbs
     * @param fileID The id of the file on the bucket
     * @param bucketID The id of the bucket this file belongs to
     * @param part
     * @param user The username
     * @param isPublic IF true, the file will be set as public
     * @param parentFile Sets an optional parent file - if the parent is removed, then so is this one
     */
    private registerFile( fileID: string, bucket: users.IBucketEntry, part: multiparty.Part, user: string, isPublic: boolean, parentFile: string | null ): Promise<users.IFileEntry> {
        const files = this._files;

        return new Promise<users.IFileEntry>( function( resolve, reject ) {
            const entry: users.IFileEntry = {
                name: ( part.filename || part.name ),
                user: user,
                identifier: fileID,
                bucketId: bucket.identifier,
                bucketName: bucket.name!,
                parentFile: ( parentFile ? parentFile : null ),
                created: Date.now(),
                numDownloads: 0,
                size: part.byteCount,
                isPublic: isPublic,
                publicURL: `https://storage.googleapis.com/${bucket.identifier}/${fileID}`,
                mimeType: part.headers[ 'content-type' ]
            };

            files.insertOne( entry ).then( function( insertResult ) {
                return resolve( insertResult.ops[ 0 ] );
            } ).catch( function( err ) {
                return reject( new Error( `Could not save user file entry: ${err.toString()}` ) );
            } );
        } );
    }

    private generateRandString( len: number ): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for ( let i = 0; i < len; i++ )
            text += possible.charAt( Math.floor( Math.random() * possible.length ) );

        return text;
    }

    /**
     * Uploads a part stream as a new user file. This checks permissions, updates the local db and uploads the stream to the bucket
     * @param part
     * @param bucket The bucket to which we are uploading to
     * @param user The username
     * @param makePublic Makes this uploaded file public to the world
     * @param parentFile [Optional] Set a parent file which when deleted will detelete this upload as well
     */
    uploadStream( part: multiparty.Part, bucketEntry: users.IBucketEntry, user: string, makePublic: boolean = true, parentFile: string | null = null ): Promise<users.IFileEntry> {

        const bucketCollection = this._buckets;
        const statCollection = this._stats;
        let storageStats: users.IStorageStats;

        return new Promise<users.IFileEntry>(( resolve, reject ) => {
            this.canUpload( user, part ).then(( stats ) => {
                storageStats = stats;
                const bucket = this._gcs.bucket( bucketEntry.identifier! );
                const fileID = this.generateRandString( 16 );
                const rawFile = bucket.file( fileID );

                // We look for part errors so that we can cleanup any faults with the upload if it cuts out
                // on the user's side.
                part.on( 'error', function( err: Error ) {
                    // Delete the file on the bucket
                    rawFile.delete( function( bucketErr ) {
                        if ( bucketErr )
                            return reject( new Error( `While uploading a user part an error occurred while cleaning the bucket: ${bucketErr.toString()}` ) )
                        else
                            return reject( new Error( `Could not upload a user part: ${err.toString()}` ) )
                    } );
                } );

                let stream: fs.WriteStream;

                // Check if the stream content type is something that can be compressed - if so, then compress it before sending it to
                // Google and set the content encoding
                if ( compressible( part.headers[ 'content-type' ] ) )
                    stream = part.pipe( this._zipper ).pipe( rawFile.createWriteStream( <any>{ metadata: { contentEncoding: 'gzip', contentType: part.headers[ 'content-type' ], metadata: { encoded: true } } } ) );
                else
                    stream = part.pipe( rawFile.createWriteStream( <any>{ metadata: { contentType: part.headers[ 'content-type' ] } } ) );

                // Pipe the file to the bucket
                stream.on( 'error', function( err: Error ) {
                    return reject( new Error( `Could not upload the file '${part.filename}' to bucket: ${err.toString()}` ) )

                } ).on( 'finish', () => {
                    bucketCollection.updateOne( <users.IBucketEntry>{ identifier: bucketEntry.identifier }, { $inc: <users.IBucketEntry>{ memoryUsed: part.byteCount } } ).then( function() {
                        return statCollection.updateOne( <users.IStorageStats>{ user: user }, { $inc: <users.IStorageStats>{ memoryUsed: part.byteCount, apiCallsUsed: 1 } } );
                    } ).then(() => {
                        return this.registerFile( fileID, bucketEntry, part, user, makePublic, parentFile )
                    } ).then(( file ) => {

                        if ( makePublic ) {
                            rawFile.makePublic( function( err ) {
                                if ( err )
                                    return reject( err );
                                else
                                    return resolve( file );
                            } );
                        }
                        else
                            return resolve( file );

                    } ).catch( function( err: Error ) {
                        return reject( err );
                    } );
                } );

            } ).catch( function( err: Error ) {
                return reject( err );
            } );
        } );
    }

    /**
     * Fetches a file by its ID
     * @param fileID The file ID of the file on the bucket
     * @param user Optionally specify the user of the file
     * @param searchTerm Specify a search term
     */
    async getFile( fileID: string, user?: string, searchTerm?: RegExp ): Promise<users.IFileEntry> {
        const files = this._files;
        const searchQuery: users.IFileEntry = { identifier: fileID };
        if ( user )
            searchQuery.user = user;

        if ( searchTerm )
            ( <any>searchQuery ).name = searchTerm;

        const result: users.IFileEntry = await files.find( searchQuery ).limit( 1 ).next();

        if ( !result )
            throw new Error( `File '${fileID}' does not exist` );
        else
            return result;
    }

    /**
     * Renames a file
     * @param file The file to rename
     * @param name The new name of the file
     */
    async renameFile( file: users.IFileEntry, name: string ): Promise<users.IFileEntry> {
        const files = this._files;
        await this.incrementAPI( file.user! );

        await files.updateOne( <users.IFileEntry>{ _id: file._id! }, { $set: <users.IFileEntry>{ name: name } } );
        return file;
    }

    /**
     * Downloads the data from the cloud and sends it to the requester. This checks the request for encoding and
     * sets the appropriate headers if and when supported
     * @param request The request being made
     * @param response The response stream to return the data
     * @param file The file to download
     */
    downloadFile( request: express.Request, response: express.Response, file: users.IFileEntry ) {

        const iBucket = this._gcs.bucket( file.bucketId! );
        const iFile = iBucket.file( file.identifier! );

        iFile.getMetadata(( err, meta ) => {
            if ( err )
                return response.status( 500 ).send( err.toString() );

            // Get the client encoding support - if any
            let acceptEncoding = request.headers[ 'accept-encoding' ];
            if ( !acceptEncoding )
                acceptEncoding = '';

            const stream: fs.ReadStream = iFile.createReadStream();
            let encoded = false;
            if ( meta.metadata )
                encoded = meta.metadata.encoded;

            // Request is expecting a deflate
            if ( acceptEncoding.match( /\bgzip\b/ ) ) {
                // If already gzipped and expeting gzip
                if ( encoded ) {
                    // Simply return the raw pipe
                    response.setHeader( 'content-encoding', 'gzip' );
                    stream.pipe( response );
                }
                else
                    stream.pipe( response );
            }
            else if ( acceptEncoding.match( /\bdeflate\b/ ) ) {
                response.setHeader( 'content-encoding', 'deflate' );

                // If its encoded - then its encoded in gzip and needs to be
                if ( encoded )
                    stream.pipe( this._unzipper ).pipe( this._deflater ).pipe( response );
                else
                    stream.pipe( this._deflater ).pipe( response );
            }
            else {
                // No encoding supported
                // Unzip GZIP and send raw if already compressed
                if ( encoded )
                    stream.pipe( this._unzipper ).pipe( response );
                else
                    stream.pipe( response );
            }
        } );
    }

    /**
     * Finds and downloads a file
     * @param fileID The file ID of the file on the bucket
     * @returns Returns the number of results affected
     */
    async updateStorage( user: string, value: users.IStorageStats ): Promise<number> {
        const stats = this._stats;
        const updateResult = await stats.updateOne( <users.IStorageStats>{ user: user }, { $set: value } );
        if ( updateResult.matchedCount === 0 )
            throw new Error( `Could not find user '${user}'` );
        else
            return updateResult.modifiedCount;
    }

    /**
     * Creates the bucket manager singleton
     */
    static create( buckets: mongodb.Collection, files: mongodb.Collection, stats: mongodb.Collection, config: Modepress.IConfig ): BucketManager {
        return new BucketManager( buckets, files, stats, config );
    }

    /**
     * Gets the bucket singleton
     */
    static get get(): BucketManager {
        return BucketManager._singleton;
    }
}