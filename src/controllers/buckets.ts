import { IConfig, IBucketEntry, IFileEntry, IStorageStats, IRemote, ILocalBucket, IGoogleProperties } from 'modepress';
import { Collection, Db, ObjectID } from 'mongodb';
import { Part } from 'multiparty';
import { CommsController } from '../socket-api/comms-controller';
import { ClientInstructionType } from '../socket-api/socket-event-types';
import { ClientInstruction } from '../socket-api/client-instruction';
import { googleBucket } from '../core/remotes/google-bucket';
import { localBucket } from '../core/remotes/local-bucket';
import { generateRandString, isValidObjectID } from '../utils/utils';
import Controller from './controller';
import { FilesController } from './files';
import ControllerFactory from '../core/controller-factory';

/**
 * Class responsible for managing buckets and uploads
 */
export class BucketsController extends Controller {
  private static MEMORY_ALLOCATED: number = 5e+8; // 500mb
  private static API_CALLS_ALLOCATED: number = 20000; // 20,000
  private _buckets: Collection<IBucketEntry>;
  private _files: Collection<IFileEntry>;
  private _stats: Collection<IStorageStats>;
  private _activeManager: IRemote;
  private _filesController: FilesController;

  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {
    this._buckets = await db.collection( this._config.collections.bucketsCollection );
    this._files = await db.collection( this._config.collections.filesCollection );
    this._stats = await db.collection( this._config.collections.statsCollection );

    googleBucket.initialize( this._config.remotes.google as IGoogleProperties );
    localBucket.initialize( this._config.remotes.local as ILocalBucket );
    this._activeManager = localBucket;
    this._filesController = ControllerFactory.get( 'files' );
    this._filesController;
  }

  /**
   * Fetches all bucket entries from the database
   * @param user [Optional] Specify the user. If none provided, then all buckets are retrieved
   * @param searchTerm [Optional] Specify a search term
   */
  async getBucketEntries( user?: string, searchTerm?: RegExp ) {
    const bucketCollection = this._buckets;
    const search: IBucketEntry = {};
    if ( user )
      search.user = user;

    if ( searchTerm )
      ( <any>search ).name = searchTerm;

    // Save the new entry into the database
    const buckets = await bucketCollection.find( search ).toArray();
    return buckets;
  }





  /**
   * Updates all file entries for a given search criteria with custom meta data
   * @param searchQuery The search query to idenfify files
   * @param meta Optional meta data to associate with the files
   */
  async setMeta( searchQuery: any, meta: any ) {
    const filesCollection = this._files;

    // Save the new entry into the database
    await filesCollection.updateMany( searchQuery, { $set: { meta: meta } as IFileEntry } );
    return true;
  }

  /**
   * Fetches the storage/api data for a given user
   * @param user The user whos data we are fetching
   */
  async getUserStats( user?: string ) {
    const stats = this._stats;

    // Save the new entry into the database
    const result = await stats.find( { user: user } as IStorageStats ).limit( 1 ).next();

    if ( !result )
      throw new Error( `Could not find storage data for the user '${user}'` );

    return result;
  }

  /**
   * Attempts to create a user usage statistics
   * @param user The user associated with this bucket
   */
  async createUserStats( user: string ) {
    const stats = this._stats;

    const storage: IStorageStats = {
      user: user,
      apiCallsAllocated: BucketsController.API_CALLS_ALLOCATED,
      memoryAllocated: BucketsController.MEMORY_ALLOCATED,
      apiCallsUsed: 0,
      memoryUsed: 0
    }

    const insertResult = await stats.insertOne( storage );
    return insertResult.ops[ 0 ] as IStorageStats;
  }

  /**
   * Attempts to remove the usage stats of a given user
   * @param user The user associated with this bucket
   * @returns A promise of the number of stats removed
   */
  async removeUserStats( user: string ) {
    const stats = this._stats;

    const deleteResult = await stats.deleteOne( { user: user } as IStorageStats );
    return deleteResult.deletedCount!;
  }

  /**
   * Attempts to remove all data associated with a user
   * @param user The user we are removing
   */
  async removeUser( user: string ) {
    this._stats;
    await this.removeBucketsByUser( user );
    await this.removeUserStats( user );
    await this.removeFiles( { user: user } as IFileEntry );
    return;
  }

  /**
   * Attempts to create a new user bucket by first creating the storage on the cloud and then updating the internal DB
   * @param name The name of the bucket
   * @param user The user associated with this bucket
   */
  async createBucket( name: string, user: string ) {
    const bucketID = `webinate-bucket-${generateRandString( 8 ).toLowerCase()}`;
    const bucketCollection = this._buckets;
    const stats = this._stats;

    // Get the entry
    let bucketEntry = await this.getIBucket( name, user );

    // Make sure no bucket already exists with that name
    if ( bucketEntry )
      throw new Error( `A Bucket with the name '${name}' has already been registered` );

    // Attempt to create a new Google bucket
    await this._activeManager.createBucket( bucketID );

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
    await stats.updateOne( { user: user } as IStorageStats, { $inc: { apiCallsUsed: 1 } as IStorageStats } );

    // Send bucket added events to sockets
    const token = { type: ClientInstructionType[ ClientInstructionType.BucketUploaded ], bucket: bucketEntry!, username: user };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, user ) );
    return bucketEntry!;
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
    const toRemove: string[] = [];

    // Get all the buckets
    const buckets = await bucketCollection.find( searchQuery ).toArray();

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
   * Attempts to remove a bucket by id
   * @param id The id of the bucket we are removing
   * @returns An array of ID's of the buckets removed
   */
  async removeBucketById( id: string ) {

    if ( !isValidObjectID( id ) )
      throw new Error( 'Please use a valid object id' );

    const query: IBucketEntry = { _id: new ObjectID( id ) };
    const bucket = await this._buckets.findOne( query );

    if ( !bucket )
      throw new Error( 'A bucket with that ID does not exist' );

    return this.removeBuckets( query );
  }

  /**
   * Attempts to remove a user bucket
   * @param user The user associated with this bucket
   * @returns An array of ID's of the buckets removed
   */
  removeBucketsByUser( user: string ): Promise<Array<string>> {
    return this.removeBuckets( { user: user } as IBucketEntry );
  }

  /**
   * Deletes the bucket from storage and updates the databases
   */
  private async deleteBucket( bucketEntry: IBucketEntry ) {
    const bucketCollection = this._buckets;
    const stats = this._stats;

    try {
      // First remove all bucket files
      await this.removeFilesByBucket( bucketEntry.identifier! );
    } catch ( err ) {
      throw new Error( `Could not remove the bucket: '${err.toString()}'` );
    }

    await this._activeManager.removeBucket( bucketEntry.identifier! );

    // Remove the bucket entry
    await bucketCollection.deleteOne( { _id: bucketEntry._id } as IBucketEntry );
    await stats.updateOne( { user: bucketEntry.user } as IStorageStats, { $inc: { apiCallsUsed: 1 } as IStorageStats } );

    // Send events to sockets
    const token = { type: ClientInstructionType[ ClientInstructionType.BucketRemoved ], bucket: bucketEntry, username: bucketEntry.user! };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, bucketEntry.user ) );

    return bucketEntry;
  }

  /**
   * Deletes the file from storage and updates the databases
   * @param fileEntry
   */
  private async deleteFile( fileEntry: IFileEntry ) {
    const bucketCollection = this._buckets;
    const files = this._files;
    const stats = this._stats;

    const bucketEntry = await this.getIBucket( fileEntry.bucketId! );
    const bucketId = bucketEntry ? bucketEntry.identifier! : fileEntry.bucketId!;

    // Get the bucket and delete the file
    await this._activeManager.removeFile( bucketId, fileEntry.identifier! );

    // Update the bucket data usage
    await bucketCollection.updateOne( { identifier: bucketId } as IBucketEntry, { $inc: { memoryUsed: -fileEntry.size! } as IBucketEntry } );
    await files.deleteOne( { _id: fileEntry._id } as IFileEntry );
    await stats.updateOne( { user: fileEntry.user }, { $inc: { memoryUsed: -fileEntry.size!, apiCallsUsed: 1 } as IStorageStats } as IStorageStats );

    // Update any listeners on the sockets
    const token = { type: ClientInstructionType[ ClientInstructionType.FileRemoved ], file: fileEntry, username: fileEntry.user! };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, fileEntry.user ) );

    return fileEntry;
  }

  /**
   * Attempts to remove files from the cloud and database by a query
   * @param searchQuery The query we use to select the files
   * @returns Returns the file IDs of the files removed
   */
  async removeFiles( searchQuery: any ) {
    const files = this._files;
    const filesRemoved: Array<string> = [];

    // Get the files
    const fileEntries: Array<IFileEntry> = await files.find( searchQuery ).toArray();

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
  removeFilesByIdentifiers( fileIDs: string[], user?: string ) {
    if ( fileIDs.length === 0 )
      return Promise.resolve( [] );

    // Create the search query for each of the files
    const searchQuery = { $or: [] as IFileEntry[] };
    for ( let i = 0, l = fileIDs.length; i < l; i++ )
      searchQuery.$or.push( { identifier: fileIDs[ i ] } as IFileEntry, { parentFile: fileIDs[ i ] } as IFileEntry );

    if ( user )
      ( searchQuery as IFileEntry ).user = user;

    return this.removeFiles( searchQuery );
  }

  /**
   * Attempts to remove files from the cloud and database that are in a given bucket
   * @param bucket The id or name of the bucket to remove
   * @returns Returns the file IDs of the files removed
   */
  removeFilesByBucket( bucket: string ) {
    if ( !bucket || bucket.trim() === '' )
      throw new Error( 'Please specify a valid bucket' );

    // Create the search query for each of the files
    const searchQuery = { $or: [ { bucketId: bucket }, { bucketName: bucket }] as IFileEntry[] };
    return this.removeFiles( searchQuery );
  }

  /**
   * Gets a bucket entry by its name or ID
   * @param bucket The id of the bucket. You can also use the name if you provide the user
   * @param user The username associated with the bucket (Only applicable if bucket is a name and not an ID)
   */
  async getIBucket( bucket: string, user?: string ) {
    const bucketCollection = this._buckets;
    const searchQuery: IBucketEntry = {};

    if ( user ) {
      searchQuery.user = user;
      searchQuery.name = bucket;
    }
    else
      searchQuery.identifier = bucket;

    const result = await bucketCollection.find( searchQuery ).limit( 1 ).next();

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
  private async canUpload( user: string, part: Part ) {
    const stats = this._stats;

    const result: IStorageStats = await stats.find( <IStorageStats>{ user: user } ).limit( 1 ).next();

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
  async withinAPILimit( user: string ) {
    const stats = this._stats;
    const result: IStorageStats = await stats.find( { user: user } as IStorageStats ).limit( 1 ).next();

    if ( !result )
      throw new Error( `Could not find the user ${user}` );

    else if ( result.apiCallsUsed! + 1 < result.apiCallsAllocated! )
      return true;
    else
      return false;
  }

  /**
   * Registers an uploaded part as a new user file in the local dbs
   * @param identifier The id of the file on the bucket
   * @param bucketID The id of the bucket this file belongs to
   * @param part
   * @param user The username
   * @param isPublic IF true, the file will be set as public
   * @param parentFile Sets an optional parent file - if the parent is removed, then so is this one
   */
  private registerFile( identifier: string, bucket: IBucketEntry, part: Part, user: string, isPublic: boolean, parentFile: string | null ) {
    const files = this._files;

    return new Promise<IFileEntry>( ( resolve, reject ) => {
      const entry: IFileEntry = {
        name: ( part.filename || part.name ),
        user: user,
        identifier: identifier,
        bucketId: bucket._id,
        bucketName: bucket.name!,
        parentFile: ( parentFile ? parentFile : null ),
        created: Date.now(),
        numDownloads: 0,
        size: part.byteCount,
        isPublic: isPublic,
        publicURL: this._activeManager.generateUrl( bucket.identifier!, identifier ),
        mimeType: part.headers[ 'content-type' ]
      };

      files.insertOne( entry ).then( function( insertResult ) {
        return resolve( insertResult.ops[ 0 ] );
      } ).catch( function( err ) {
        return reject( new Error( `Could not save user file entry: ${err.toString()}` ) );
      } );
    } );
  }



  /**
   * Uploads a part stream as a new user file. This checks permissions, updates the local db and uploads the stream to the bucket
   * @param part
   * @param bucket The bucket to which we are uploading to
   * @param user The username
   * @param makePublic Makes this uploaded file public to the world
   * @param parentFile [Optional] Set a parent file which when deleted will detelete this upload as well
   */
  async uploadStream( part: Part, bucketEntry: IBucketEntry, user: string, makePublic: boolean = true, parentFile: string | null = null ) {

    await this.canUpload( user, part );

    const bucketCollection = this._buckets;
    const statCollection = this._stats;
    const name = part.filename || part.name;
    if ( !name )
      throw new Error( `Uploaded item does not have a name or filename specified` );

    const fileIdentifier = await this._activeManager.uploadFile( bucketEntry.identifier!, part, { headers: part.headers, filename: name } );

    await bucketCollection.updateOne( { identifier: bucketEntry.identifier } as IBucketEntry,
      { $inc: { memoryUsed: part.byteCount } as IBucketEntry } );

    await statCollection.updateOne( { user: user } as IStorageStats,
      { $inc: { memoryUsed: part.byteCount, apiCallsUsed: 1 } as IStorageStats } );

    const file = await this.registerFile( fileIdentifier, bucketEntry, part, user, makePublic, parentFile );
    return file;
  }


  /**
   * Finds and downloads a file
   * @param fileID The file ID of the file on the bucket
   * @returns Returns the number of results affected
   */
  async updateStorage( user: string, value: IStorageStats ) {
    const stats = this._stats;
    const updateResult = await stats.updateOne( { user: user } as IStorageStats, { $set: value } );
    if ( updateResult.matchedCount === 0 )
      throw new Error( `Could not find user '${user}'` );
    else
      return updateResult.modifiedCount;
  }
}