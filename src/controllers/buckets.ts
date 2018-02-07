import { IConfig } from '../types/config/i-config';
import { IGoogleProperties } from '../types/config/properties/i-google';
import { IRemote } from '../types/interfaces/i-remote';
import { Page } from '../types/tokens/standard-tokens';
import { ILocalBucket } from '../types/config/properties/i-remote-options';
import { IBucketEntry } from '../types/models/i-bucket-entry';
import { IFileEntry } from '../types/models/i-file-entry';
import { IStorageStats } from '../types/models/i-storage-stats';
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
import { StatsController } from './stats';

export type GetManyOptions = {
  user?: string;
  searchTerm?: RegExp;
  index?: number;
  limit?: number;
};

export type GetOptions = {
  user?: string;
  identifier?: string;
  name?: string;
};

export type DeleteOptions = {
  user?: string;
  _id?: string | ObjectID;
};

/**
 * Class responsible for managing buckets and uploads
 */
export class BucketsController extends Controller {
  private _buckets: Collection<IBucketEntry>;
  private _files: Collection<IFileEntry>;
  private _stats: Collection<IStorageStats>;
  private _activeManager: IRemote;
  private _filesController: FilesController;
  private _statsController: StatsController;

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
    this._statsController = ControllerFactory.get( 'stats' );
  }

  /**
   * Fetches all bucket entries from the database
   * @param options Options for defining which buckets to return
   */
  async getMany( options: GetManyOptions = { index: 0, limit: 10 } ) {
    const bucketCollection = this._buckets;
    const search: Partial<IBucketEntry> = {};

    if ( options.user )
      search.user = options.user;

    if ( options.searchTerm )
      search.name = options.searchTerm as any;

    // Save the new entry into the database
    const count = await bucketCollection.count( search );
    let cursor = await bucketCollection.find( search );

    let limit = options.limit;
    let index = options.index;

    if ( index !== undefined )
      cursor = cursor.skip( index );

    if ( limit !== undefined )
      cursor = cursor.limit( limit );

    const result = await cursor.toArray();
    const toRet: Page<IBucketEntry> = {
      limit: limit !== undefined ? limit : -1,
      count: count,
      index: index !== undefined ? index : -1,
      data: result
    };
    return toRet;
  }

  /**
   * Gets a bucket entry by its name or ID
   */
  async get( options: GetOptions = {} ) {
    const bucketCollection = this._buckets;
    const searchQuery: Partial<IBucketEntry> = {};

    if ( options.user )
      searchQuery.user = options.user;

    if ( options.name )
      searchQuery.name = options.name;

    if ( options.identifier )
      searchQuery.identifier = options.identifier;

    const result = await bucketCollection.findOne( searchQuery );

    if ( !result )
      return null;
    else
      return result;
  }

  /**
   * Attempts to remove all data associated with a user
   * @param user The user we are removing
   */
  async removeUser( user: string ) {
    await this.remove( { user: user } );
    await this._statsController.remove( user );
    await this._filesController.removeFiles( { user: user } );
    return;
  }

  /**
   * Attempts to create a new user bucket by first creating the storage on the cloud and then updating the internal DB
   * @param name The name of the bucket
   * @param user The user associated with this bucket
   */
  async create( name: string, user: string ) {
    const identifier = `webinate-bucket-${generateRandString( 8 ).toLowerCase()}`;
    const bucketCollection = this._buckets;
    const stats = this._stats;

    // Get the entry
    let bucketEntry: Partial<IBucketEntry> | null = await this.get( { name: name, user: user } );

    // Make sure no bucket already exists with that name
    if ( bucketEntry )
      throw new Error( `A Bucket with the name '${name}' has already been registered` );

    // Create the new bucket
    bucketEntry = {
      name: name,
      identifier: identifier,
      created: Date.now(),
      user: user,
      memoryUsed: 0
    }

    // Save the new entry into the database
    const insertResult = await bucketCollection.insertOne( bucketEntry );
    bucketEntry = insertResult.ops[ 0 ];

    // Attempt to create a new Google bucket
    await this._activeManager.createBucket( bucketEntry as IBucketEntry );

    // Increments the API calls
    await stats.updateOne( { user: user } as IStorageStats, { $inc: { apiCallsUsed: 1 } as IStorageStats } );

    // Send bucket added events to sockets
    const token = { type: ClientInstructionType[ ClientInstructionType.BucketUploaded ], bucket: bucketEntry!, username: user };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, user ) );
    return bucketEntry! as IBucketEntry;
  }

  /**
   * Attempts to remove buckets of the given search result. This will also update the file and stats collection.
   * @param searchQuery A valid mongodb search query
   * @returns An array of ID's of the buckets removed
   */
  async remove( options: DeleteOptions ) {
    const bucketCollection = this._buckets;
    const toRemove: string[] = [];
    const searchQuery: Partial<IBucketEntry> = {};

    if ( options._id ) {
      if ( typeof options._id === 'string' ) {
        if ( !isValidObjectID( options._id ) )
          throw new Error( 'Please use a valid object id' );

        searchQuery._id = new ObjectID( options._id );
      }
      else
        searchQuery._id = options._id;
    }

    if ( options.user )
      searchQuery.user = options.user;

    // Get all the buckets
    const buckets = await bucketCollection.find( searchQuery ).toArray();

    if ( options._id && buckets.length === 0 )
      throw new Error( 'A bucket with that ID does not exist' );

    // Now delete each one
    const promises: Promise<IBucketEntry>[] = []
    for ( let i = 0, l = buckets.length; i < l; i++ )
      promises.push( this.deleteBucket( buckets[ i ] ) );

    await Promise.all( promises );
    return toRemove;
  }

  /**
   * Deletes the bucket from storage and updates the databases
   */
  private async deleteBucket( bucketEntry: IBucketEntry ) {
    const bucketCollection = this._buckets;
    const stats = this._stats;

    try {
      // First remove all bucket files
      await this._filesController.removeFiles( { bucketId: bucketEntry._id } );
    } catch ( err ) {
      throw new Error( `Could not remove the bucket: '${err.toString()}'` );
    }

    await this._activeManager.removeBucket( bucketEntry );

    // Remove the bucket entry
    await bucketCollection.deleteOne( { _id: bucketEntry._id } as IBucketEntry );
    await stats.updateOne( { user: bucketEntry.user } as IStorageStats, { $inc: { apiCallsUsed: 1 } as IStorageStats } );

    // Send events to sockets
    const token = { type: ClientInstructionType[ ClientInstructionType.BucketRemoved ], bucket: bucketEntry, username: bucketEntry.user! };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, bucketEntry.user ) );

    return bucketEntry;
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
    const files = this._files;

    if ( !name )
      throw new Error( `Uploaded item does not have a name or filename specified` );

    const fileEntry: IFileEntry = {
      name: ( part.filename || part.name ),
      user: user,
      bucketId: bucketEntry._id!,
      bucketName: bucketEntry.name!,
      parentFile: ( parentFile ? parentFile : null ),
      created: Date.now(),
      numDownloads: 0,
      size: part.byteCount,
      isPublic: makePublic,
      mimeType: part.headers[ 'content-type' ],
      meta: {}
    };

    const result = await files.insertOne( fileEntry );
    fileEntry._id = result.insertedId;

    const fileIdentifier = await this._activeManager.uploadFile( bucketEntry, fileEntry, part, { headers: part.headers, filename: name } );

    fileEntry.identifier = fileIdentifier;
    fileEntry.publicURL = this._activeManager.generateUrl( bucketEntry, fileEntry );

    await bucketCollection.updateOne( { identifier: bucketEntry.identifier } as IBucketEntry,
      { $inc: { memoryUsed: part.byteCount } as IBucketEntry } );

    await statCollection.updateOne( { user: user } as IStorageStats,
      { $inc: { memoryUsed: part.byteCount, apiCallsUsed: 1 } as IStorageStats } );

    await files.updateOne( { _id: fileEntry._id } as IFileEntry,
      { $set: { identifier: fileIdentifier, publicURL: fileEntry.publicURL } as IFileEntry } );

    // const file = await this.registerFile( fileIdentifier, bucketEntry, part, user, makePublic, parentFile );
    return fileEntry;
  }
}