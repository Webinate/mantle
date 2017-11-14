import { IConfig, IFileEntry, IRemote, ILocalBucket, IGoogleProperties, IStorageStats, Page, IBucketEntry } from 'modepress';
import { Db, ObjectID } from 'mongodb';
import { googleBucket } from '../core/remotes/google-bucket';
import { localBucket } from '../core/remotes/local-bucket';
import Controller from './controller';
import { FileModel } from '../models/file-model';
import ModelFactory from '../core/model-factory';
import { StorageStatsModel } from '../models/storage-stats-model';
import { isValidObjectID } from '../utils/utils';
import { BucketModel } from '../models/bucket-model';
import { CommsController } from '../socket-api/comms-controller';
import { ClientInstruction } from '../socket-api/client-instruction';
import { ClientInstructionType } from '../socket-api/socket-event-types';

export type GetOptions = {
  bucketId?: string;
  user?: string;
  index?: number;
  limit?: number;
  searchTerm?: RegExp;
  verbose?: boolean;
}

/**
 * Class responsible for managing files
 */
export class FilesController extends Controller {
  private _files: FileModel;
  private _buckets: BucketModel;
  private _stats: StorageStatsModel;
  private _activeManager: IRemote;

  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {
    googleBucket.initialize( this._config.remotes.google as IGoogleProperties );
    localBucket.initialize( this._config.remotes.local as ILocalBucket );
    this._activeManager = localBucket;
    this._files = ModelFactory.get( 'files' );
    this._buckets = ModelFactory.get( 'buckets' );
    this._stats = ModelFactory.get( 'storage' );
  }

  /**
   * Fetches a file by its ID
   * @param fileID The file ID of the file on the bucket
   * @param user Optionally specify the user of the file
   * @param searchTerm Specify a search term
   */
  async getFile( fileID: string, user?: string, searchTerm?: RegExp ) {
    const files = this._files;
    const searchQuery: Partial<IFileEntry> = { identifier: fileID };
    if ( user )
      searchQuery.user = user;

    if ( searchTerm )
      searchQuery.name = searchTerm as any;

    const result = await files.findOne( searchQuery );

    if ( !result )
      throw new Error( `File '${fileID}' does not exist` );

    return result.getAsJson( { verbose: true } );
  }

  /**
   * Fetches all file entries by a given query
   */
  async getFiles( options: GetOptions ) {
    const files = this._files;
    const buckets = this._buckets;

    const searchQuery: Partial<IFileEntry> = {};

    if ( options.bucketId ) {
      if ( !isValidObjectID( options.bucketId ) )
        throw new Error( 'Please use a valid identifier for bucketId' );

      const bucketQuery: Partial<IBucketEntry> = { _id: new ObjectID( options.bucketId ) };
      if ( options.user )
        bucketQuery.user = options.user;

      const bucketEntry = await buckets.findOne( bucketQuery );

      if ( !bucketEntry )
        throw new Error( `Could not find the bucket resource` );

      searchQuery.bucketId = new ObjectID( options.bucketId ) as any;
    }

    if ( options.searchTerm )
      searchQuery.name = new RegExp( options.searchTerm ) as any;

    if ( options.user )
      searchQuery.user = options.user;

    const count = await files.count( searchQuery );
    const index: number = options.index || 0;
    const limit: number = options.limit || 10;

    // Save the new entry into the database
    const schemas = await files.findInstances( {
      selector: searchQuery,
      index: index,
      limit: limit
    } );

    const jsons: Array<Promise<IFileEntry>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( { verbose: options.verbose !== undefined ? options.verbose : true } ) );

    const sanitizedData = await Promise.all( jsons );
    const toRet: Page<IFileEntry> = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit
    };

    return toRet;
  }

  /**
   * Fetches the file count based on the given query
   * @param searchQuery The search query to idenfify files
   */
  async count( searchQuery: IFileEntry ) {
    const filesCollection = this._files;
    const count = await filesCollection.count( searchQuery );
    return count;
  }

  /**
   * Renames a file
   * @param fileId The id of the file to rename
   * @param name The new name of the file
   */
  async update( fileId: string, token: Partial<IFileEntry> ) {
    const files = this._files;

    if ( !isValidObjectID( fileId ) )
      throw new Error( 'Invalid ID format' );

    const query = { _id: new ObjectID( fileId ) };
    const fileSchema = await this._files.findOne( query );

    if ( !fileSchema )
      throw new Error( 'Resource not found' );

    await this.incrementAPI( fileSchema.dbEntry.user! );
    const toRet = await files.update( query, token );
    return toRet;
  }

  /**
   * Adds an API call to a user
   * @param user The username
   */
  private async incrementAPI( user: string ) {
    const stats = this._stats.collection;
    await stats.update( { user: user } as IStorageStats, { $inc: { apiCallsUsed: 1 } as IStorageStats } );
    return true;
  }

  /**
   * Deletes the file from storage and updates the databases
   * @param fileEntry
   */
  private async deleteFile( fileEntry: IFileEntry ) {
    const buckets = this._buckets;
    const files = this._files;
    const stats = this._stats;

    const bucketEntry = await buckets.findOne( fileEntry.bucketId );
    const bucketId = bucketEntry ? bucketEntry.dbEntry.identifier : fileEntry.bucketId;

    // Get the bucket and delete the file
    await this._activeManager.removeFile( bucketId, fileEntry.identifier );

    // Update the bucket data usage
    await buckets.collection.updateOne( { identifier: bucketId } as IBucketEntry, { $inc: { memoryUsed: -fileEntry.size! } as IBucketEntry } );
    await files.collection.deleteOne( { _id: fileEntry._id } as IFileEntry );
    await stats.collection.updateOne( { user: fileEntry.user }, { $inc: { memoryUsed: -fileEntry.size!, apiCallsUsed: 1 } as IStorageStats } as IStorageStats );

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
    const fileEntries: Array<IFileEntry> = await files.collection.find( searchQuery ).toArray();

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
    const searchQuery = { $or: [] as Partial<IFileEntry>[] };
    for ( let i = 0, l = fileIDs.length; i < l; i++ )
      searchQuery.$or.push( { identifier: fileIDs[ i ] } as IFileEntry, { parentFile: fileIDs[ i ] } as IFileEntry );

    if ( user )
      ( searchQuery as Partial<IFileEntry> ).user = user;

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
}