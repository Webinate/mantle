import { IConfig, IFileEntry, IRemote, ILocalBucket, IGoogleProperties } from 'modepress';
import { Db } from 'mongodb';
import { googleBucket } from '../core/remotes/google-bucket';
import { localBucket } from '../core/remotes/local-bucket';
import Controller from './controller';
import { FileModel } from '../models/file-model';
import ModelFactory from '../core/model-factory';

/**
 * Class responsible for managing files
 */
export class FilesController extends Controller {
  private _files: FileModel;
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
    this._files = ModelFactory.get( 'file' );

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
}