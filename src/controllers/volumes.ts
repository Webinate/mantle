import { IConfig } from '../types/config/i-config';
import { IGoogleProperties } from '../types/config/properties/i-google';
import { IRemote } from '../types/interfaces/i-remote';
import { Page } from '../types/tokens/standard-tokens';
import { ILocalVolume } from '../types/config/properties/i-remote-options';
import { IVolume } from '../types/models/i-volume-entry';
import { IFileEntry } from '../types/models/i-file-entry';
import { IStorageStats } from '../types/models/i-storage-stats';
import { Collection, Db, ObjectID } from 'mongodb';
import { Part } from 'multiparty';
import { CommsController } from '../socket-api/comms-controller';
import { ClientInstructionType } from '../socket-api/socket-event-types';
import { ClientInstruction } from '../socket-api/client-instruction';
import { googleVolume } from '../core/remotes/google-volume';
import { localVolume } from '../core/remotes/local-volume';
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
 * Class responsible for managing volumes and uploads
 */
export class VolumesController extends Controller {
  private _volumes: Collection<IVolume<'server' | 'client'>>;
  private _files: Collection<IFileEntry<'server' | 'client'>>;
  private _stats: Collection<IStorageStats<'server' | 'client'>>;
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
    this._volumes = await db.collection( this._config.collections.volumesCollection );
    this._files = await db.collection( this._config.collections.filesCollection );
    this._stats = await db.collection( this._config.collections.statsCollection );

    googleVolume.initialize( this._config.remotes.google as IGoogleProperties );
    localVolume.initialize( this._config.remotes.local as ILocalVolume );
    this._activeManager = localVolume;
    this._filesController = ControllerFactory.get( 'files' );
    this._statsController = ControllerFactory.get( 'stats' );
    return this;
  }

  /**
   * Fetches all volume entries from the database
   * @param options Options for defining which volumes to return
   */
  async getMany( options: GetManyOptions = { index: 0, limit: 10 } ) {
    const columes = this._volumes;
    const search: Partial<IVolume<'server'>> = {};

    if ( options.user )
      search.user = options.user;

    if ( options.searchTerm )
      search.name = options.searchTerm as any;

    // Save the new entry into the database
    const count = await columes.count( search );
    let cursor = await columes.find( search );

    let limit = options.limit;
    let index = options.index;

    if ( index !== undefined )
      cursor = cursor.skip( index );

    if ( limit !== undefined )
      cursor = cursor.limit( limit );

    const result = await cursor.toArray() as IVolume<'client'>[];
    const toRet: Page<IVolume<'client'>> = {
      limit: limit !== undefined ? limit : -1,
      count: count,
      index: index !== undefined ? index : -1,
      data: result
    };
    return toRet;
  }

  /**
   * Gets a volume by its name or ID
   */
  async get( options: GetOptions = {} ) {
    const volumeCollection = this._volumes;
    const searchQuery: Partial<IVolume<'server'>> = {};

    if ( options.user )
      searchQuery.user = options.user;

    if ( options.name )
      searchQuery.name = options.name;

    if ( options.identifier )
      searchQuery.identifier = options.identifier;

    const result = await volumeCollection.findOne( searchQuery );

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
   * Attempts to create a new user volume by first creating the storage on the cloud and then updating the internal DB
   * @param name The name of the volume
   * @param user The user associated with this volume
   */
  async create( name: string, user: string ) {
    const identifier = `webinate-volume-${generateRandString( 8 ).toLowerCase()}`;
    const volumeCollection = this._volumes;
    const stats = this._stats;

    // Get the entry
    let volume: Partial<IVolume<'server' | 'client'>> | null = await this.get( { name: name, user: user } );

    // Make sure no volume already exists with that name
    if ( volume )
      throw new Error( `A volume with the name '${name}' has already been registered` );

    // Create the new volume
    volume = {
      name: name,
      identifier: identifier,
      created: Date.now(),
      user: user,
      memoryUsed: 0
    }

    // Save the new entry into the database
    const insertResult = await volumeCollection.insertOne( volume );
    volume = insertResult.ops[ 0 ];

    // Attempt to create a new Google volume
    await this._activeManager.createVolume( volume! );

    // Increments the API calls
    await stats.updateOne( { user: user } as IStorageStats<'server'>, { $inc: { apiCallsUsed: 1 } as IStorageStats<'server'> } );

    // Send volume added events to sockets
    const token = { type: ClientInstructionType[ ClientInstructionType.VolumeUploaded ], volume: volume!, username: user };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, user ) );
    return volume!;
  }

  /**
   * Attempts to remove volumes of the given search result. This will also update the file and stats collection.
   * @param searchQuery A valid mongodb search query
   * @returns An array of ID's of the volumes removed
   */
  async remove( options: DeleteOptions ) {
    const volumesCollection = this._volumes;
    const toRemove: string[] = [];
    const searchQuery: Partial<IVolume<'server'>> = {};

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

    // Get all the volumes
    const volumes = await volumesCollection.find( searchQuery ).toArray();

    if ( options._id && volumes.length === 0 )
      throw new Error( 'A volume with that ID does not exist' );

    // Now delete each one
    const promises: Promise<IVolume<'server' | 'client'>>[] = []
    for ( let i = 0, l = volumes.length; i < l; i++ )
      promises.push( this.deleteVolume( volumes[ i ] ) );

    await Promise.all( promises );
    return toRemove;
  }

  /**
   * Deletes the volume from storage and updates the databases
   */
  private async deleteVolume( volume: IVolume<'server' | 'client'> ) {
    const volumesCollection = this._volumes;
    const stats = this._stats;

    try {
      // First remove all volume files
      await this._filesController.removeFiles( { volumeId: volume._id } );
    } catch ( err ) {
      throw new Error( `Could not remove the volume: '${err.toString()}'` );
    }

    await this._activeManager.removeVolume( volume );

    // Remove the volume entry
    await volumesCollection.deleteOne( { _id: volume._id } as IVolume<'server'> );
    await stats.updateOne( { user: volume.user } as IStorageStats<'server'>, { $inc: { apiCallsUsed: 1 } as IStorageStats<'server'> } );

    // Send events to sockets
    const token = { type: ClientInstructionType[ ClientInstructionType.VolumeRemoved ], volume: volume, username: volume.user! };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, volume.user ) );

    return volume;
  }

  /**
   * Checks to see the user's storage limits to see if they are allowed to upload data
   * @param user The username
   * @param part
   */
  private async canUpload( user: string, part: Part ) {
    const stats = this._stats;

    const result = await stats.find( <IStorageStats<'server'>>{ user: user } ).limit( 1 ).next();

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
    const result = await stats.find( { user: user } as IStorageStats<'server'> ).limit( 1 ).next();

    if ( !result )
      throw new Error( `Could not find the user ${user}` );

    else if ( result.apiCallsUsed! + 1 < result.apiCallsAllocated! )
      return true;
    else
      return false;
  }

  // /**
  //  * Uploads a part stream as a new user file. This checks permissions, updates the local db and uploads the stream to the volume
  //  * @param part
  //  * @param volume The volume to which we are uploading to
  //  * @param user The username
  //  * @param makePublic Makes this uploaded file public to the world
  //  * @param parentFile [Optional] Set a parent file which when deleted will detelete this upload as well
  //  */
  // async uploadStream( part: Part, volume: IVolume<'server' | 'client'>, user: string, makePublic: boolean = true, parentFile: string | null = null ) {

  //   await this.canUpload( user, part );

  //   const volumesCollection = this._volumes;
  //   const statCollection = this._stats;
  //   const name = part.filename || part.name;
  //   const files = this._files;

  //   if ( !name )
  //     throw new Error( `Uploaded item does not have a name or filename specified` );

  //   const fileEntry: Partial<IFileEntry<'server'>> = {
  //     name: ( part.filename || part.name ),
  //     user: user,
  //     volumeId: volume._id!,
  //     volumeName: volume.name!,
  //     parentFile: ( parentFile ? new ObjectID( parentFile ) : null ),
  //     created: Date.now(),
  //     numDownloads: 0,
  //     size: part.byteCount,
  //     isPublic: makePublic,
  //     mimeType: part.headers[ 'content-type' ],
  //     meta: {}
  //   };

  //   const result = await files.insertOne( fileEntry );
  //   fileEntry._id = result.insertedId;

  //   const fileIdentifier = await this._activeManager.uploadFile( volume, fileEntry, part, { headers: part.headers, filename: name } );

  //   fileEntry.identifier = fileIdentifier;
  //   fileEntry.publicURL = this._activeManager.generateUrl( volume, fileEntry );

  //   await volumesCollection.updateOne( { identifier: volume.identifier } as IVolume<'server'>,
  //     { $inc: { memoryUsed: part.byteCount } as IVolume<'server'> } );

  //   await statCollection.updateOne( { user: user } as IStorageStats<'server'>,
  //     { $inc: { memoryUsed: part.byteCount, apiCallsUsed: 1 } as IStorageStats<'server'> } );

  //   await files.updateOne( { _id: fileEntry._id } as IFileEntry<'server'>,
  //     { $set: { identifier: fileIdentifier, publicURL: fileEntry.publicURL } as IFileEntry<'server'> } );

  //   return fileEntry;
  // }
}