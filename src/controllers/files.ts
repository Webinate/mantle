import { IConfig, IFileEntry, IRemote, ILocalBucket, IGoogleProperties, IStorageStats } from 'modepress';
import { Db, ObjectID } from 'mongodb';
import { googleBucket } from '../core/remotes/google-bucket';
import { localBucket } from '../core/remotes/local-bucket';
import Controller from './controller';
import { FileModel } from '../models/file-model';
import ModelFactory from '../core/model-factory';
import { StorageStatsModel } from '../models/storage-stats-model';
import { isValidObjectID } from '../utils/utils';

/**
 * Class responsible for managing files
 */
export class FilesController extends Controller {
  private _files: FileModel;
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
    this._stats = ModelFactory.get( 'storage' );

    this._activeManager;
  }

  /**
   * Fetches a file by its ID
   * @param fileID The file ID of the file on the bucket
   * @param user Optionally specify the user of the file
   * @param searchTerm Specify a search term
   */
  async getFile( fileID: string, user?: string, searchTerm?: RegExp ) {
    const files = this._files;
    const searchQuery: IFileEntry = { identifier: fileID };
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
}