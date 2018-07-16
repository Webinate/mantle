import { IConfig } from '../types/config/i-config';
import { IGoogleProperties } from '../types/config/properties/i-google';
import { Page } from '../types/tokens/standard-tokens';
import { ILocalVolume } from '../types/config/properties/i-remote-options';
import { IRemote } from '../types/interfaces/i-remote';
import { IFileEntry } from '../types/models/i-file-entry';
import { IStorageStats } from '../types/models/i-storage-stats';
import { IVolume } from '../types/models/i-volume-entry';
import { Db, ObjectID } from 'mongodb';
import { googleVolume } from '../core/remotes/google-volume';
import { localVolume } from '../core/remotes/local-volume';
import Controller from './controller';
import { FileModel } from '../models/file-model';
import ModelFactory from '../core/model-factory';
import { StorageStatsModel } from '../models/storage-stats-model';
import { isValidObjectID } from '../utils/utils';
import { VolumeModel } from '../models/volume-model';
import { CommsController } from '../socket-api/comms-controller';
import { ClientInstruction } from '../socket-api/client-instruction';
import { ClientInstructionType } from '../socket-api/socket-event-types';

export type GetOptions = {
  volumeId?: string | ObjectID;
  user?: string;
  index?: number;
  limit?: number;
  searchTerm?: RegExp;
  verbose?: boolean;
}

export type DeleteOptions = {
  volumeId?: string | ObjectID;
  user?: string;
  fileId?: string | ObjectID;
}

/**
 * Class responsible for managing files
 */
export class FilesController extends Controller {
  private _files: FileModel;
  private _volumes: VolumeModel;
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
    googleVolume.initialize( this._config.remotes.google as IGoogleProperties );
    localVolume.initialize( this._config.remotes.local as ILocalVolume );
    this._activeManager = localVolume;
    this._files = ModelFactory.get( 'files' );
    this._volumes = ModelFactory.get( 'volumes' );
    this._stats = ModelFactory.get( 'storage' );
    return this;
  }

  /**
   * Fetches a file by its ID
   * @param fileID The file ID of the file on the volume
   * @param user Optionally specify the user of the file
   * @param searchTerm Specify a search term
   */
  async getFile( fileID: string, user?: string, searchTerm?: RegExp ) {
    const files = this._files;
    const searchQuery: Partial<IFileEntry<'server'>> = { identifier: fileID };
    if ( user )
      searchQuery.user = user;

    if ( searchTerm )
      searchQuery.name = searchTerm as any;

    const file = await files.downloadOne<IFileEntry<'client'>>( searchQuery, { verbose: true } );

    if ( !file )
      throw new Error( `File '${fileID}' does not exist` );

    return file;
  }

  /**
   * Fetches all file entries by a given query
   */
  async getFiles( options: GetOptions ) {
    const files = this._files;
    const volumes = this._volumes;

    const searchQuery: Partial<IFileEntry<'server'>> = {};

    if ( options.volumeId ) {
      if ( typeof ( options.volumeId ) === 'string' && !isValidObjectID( options.volumeId ) )
        throw new Error( 'Please use a valid identifier for volumeId' );

      const volumeQuery: Partial<IVolume<'server'>> = { _id: new ObjectID( options.volumeId ) };
      if ( options.user )
        volumeQuery.user = options.user;

      const volume = await volumes.downloadOne( volumeQuery, { verbose: true } );

      if ( !volume )
        throw new Error( `Could not find the volume resource` );

      searchQuery.volumeId = new ObjectID( options.volumeId );
    }

    if ( options.searchTerm )
      searchQuery.name = new RegExp( options.searchTerm ) as any;

    if ( options.user )
      searchQuery.user = options.user;

    const count = await files.count( searchQuery );
    const index: number = options.index || 0;
    const limit: number = options.limit || 10;
    const verbose = options.verbose !== undefined ? options.verbose : true;

    const sanitizedData = await files.downloadMany<IFileEntry<'client'>>( {
      selector: searchQuery,
      index: index,
      limit: limit
    }, { verbose } );

    const toRet: Page<IFileEntry<'client'>> = {
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
  async count( searchQuery: IFileEntry<'server'> ) {
    const filesCollection = this._files;
    const count = await filesCollection.count( searchQuery );
    return count;
  }

  /**
   * Renames a file
   * @param fileId The id of the file to rename
   * @param name The new name of the file
   */
  async update( fileId: string | ObjectID, token: Partial<IFileEntry<'client'>> ) {
    const files = this._files;

    if ( typeof fileId === 'string' && !isValidObjectID( fileId ) )
      throw new Error( 'Invalid ID format' );

    const query = typeof fileId === 'string' ? { _id: new ObjectID( fileId ) } : { _id: fileId };
    const file = await this._files.downloadOne<IFileEntry<'client'>>( query, { verbose: true } );

    if ( !file )
      throw new Error( 'Resource not found' );

    await this.incrementAPI( file.user! );
    const toRet = await files.update<IFileEntry<'client'>>( query, token );
    return toRet;
  }

  /**
   * Adds an API call to a user
   * @param user The username
   */
  private async incrementAPI( user: string ) {
    const stats = this._stats.collection;
    await stats.update( { user: user } as IStorageStats<'server'>, { $inc: { apiCallsUsed: 1 } as IStorageStats<'server'> } );
    return true;
  }

  /**
   * Deletes the file from storage and updates the databases
   * @param fileEntry
   */
  private async deleteFile( fileEntry: IFileEntry<'server'>, idsAlreadyHandled?: string[] ) {
    const files = this._files;
    const promises: Promise<any>[] = [];

    // First remove any files that have this as their parent
    const children = await files.findMany<IFileEntry<'server'>>( { selector: { parentFile: fileEntry._id } as Partial<IFileEntry<'server'>> } );
    for ( const child of children )
      promises.push( this.deleteFile( child.dbEntry ) );

    await Promise.all( promises );

    const volumes = this._volumes;
    const stats = this._stats;
    const volume = await volumes.downloadOne<IVolume<'client'>>( fileEntry.volumeId, { verbose: true } );

    if ( volume ) {

      // Get the volume and delete the file
      await this._activeManager.removeFile( volume, fileEntry );

      // Update the volume data usage
      await volumes.collection.updateOne( { identifier: volume.identifier } as IVolume<'server'>, { $inc: { memoryUsed: -fileEntry.size! } as IVolume<'server'> } );
    }

    await files.deleteInstances( { _id: fileEntry._id } as IFileEntry<'server'> );
    await stats.collection.updateOne( { user: fileEntry.user }, { $inc: { memoryUsed: -fileEntry.size!, apiCallsUsed: 1 } as IStorageStats<'server'> } );

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
  async removeFiles( options: DeleteOptions ) {
    const files = this._files;
    const volumes = this._volumes;
    const query: Partial<IFileEntry<'server'>> = {};

    if ( options.volumeId !== undefined ) {
      if ( typeof ( options.volumeId ) === 'string' && !isValidObjectID( options.volumeId ) )
        throw new Error( 'Invalid volume ID format' );

      const volumeQuery: Partial<IVolume<'server'>> = { _id: new ObjectID( options.volumeId ) }
      const volume = await volumes.collection.findOne( volumeQuery );

      if ( !volume )
        throw new Error( 'Volume resource does not exist' );

      query.volumeId = volume._id;
    }

    if ( options.fileId !== undefined ) {
      if ( typeof ( options.fileId ) === 'string' && !isValidObjectID( options.fileId ) )
        throw new Error( 'Invalid file ID format' );

      query._id = new ObjectID( options.fileId );
    }

    if ( options.user ) {
      query.user = options.user;
    }

    const fileEntries = await files.collection.find( query ).toArray();
    for ( let i = 0, l = fileEntries.length; i < l; i++ )
      await this.deleteFile( fileEntries[ i ] as IFileEntry<'server'> );

    return;
  }
}