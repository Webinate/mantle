import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IVolume } from '../types/models/i-volume-entry';
import { Db, ObjectID } from 'mongodb';
import { generateRandString, isValidObjectID } from '../utils/utils';
import Controller from './controller';
import { FilesController } from './files';
import ControllerFactory from '../core/controller-factory';
import { VolumeModel } from '../models/volume-model';
import ModelFactory from '../core/model-factory';
import RemoteFactory from '../core/remotes/remote-factory';
import { Error500, Error404 } from '../utils/errors';
import { UsersController } from './users';

export type GetManyOptions = {
  user: string;
  searchTerm: RegExp;
  index: number;
  limit: number;
};

export type GetOptions = {
  id: string;
  user: string;
  identifier: string;
  name: string;
};

export type DeleteOptions = {
  user: string;
  _id: string | ObjectID;
};

/**
 * Class responsible for managing volumes and uploads
 */
export class VolumesController extends Controller {
  private static MEMORY_ALLOCATED: number = 5e+8; // 500mb

  private _volumes: VolumeModel;
  private _filesController: FilesController;
  private _users: UsersController;

  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {

    this._volumes = ModelFactory.get( 'volumes' );
    this._filesController = ControllerFactory.get( 'files' );
    this._users = ControllerFactory.get( 'users' );
    return this;
  }

  /**
   * Fetches all volume entries from the database
   * @param options Options for defining which volumes to return
   */
  async getMany( options: Partial<GetManyOptions> = { index: 0, limit: 10 } ) {
    const volumeModel = this._volumes;
    const search: Partial<IVolume<'server'>> = {};

    if ( options.user ) {
      const user = await this._users.getUser( options.user );
      if ( user )
        search.user = new ObjectID( user.dbEntry._id );
      else
        throw new Error404( `User not found` );
    }

    if ( options.searchTerm )
      search.name = options.searchTerm as any;

    let limit = options.limit !== undefined ? options.limit : 10;
    let index = options.index !== undefined ? options.index : 0;

    // Save the new entry into the database
    const count = await volumeModel.count( search );
    const schemas = await volumeModel.findMany<IVolume<'server'>>( { selector: search, index, limit } );
    const volumes = await Promise.all( schemas.map( s => s.downloadToken<IVolume<'client'>>( { verbose: true, expandMaxDepth: 2, expandForeignKeys: true } ) ) );

    const toRet: Page<IVolume<'client'>> = {
      limit: limit,
      count: count,
      index: index,
      data: volumes
    };
    return toRet;
  }

  /**
   * Gets a volume by its name or ID
   */
  async get( options: Partial<GetOptions> = {} ) {
    const volumeModel = this._volumes;
    const searchQuery: Partial<IVolume<'server'>> = {};

    if ( options.user ) {
      const user = await this._users.getUser( options.user );
      if ( user )
        searchQuery.user = new ObjectID( user.dbEntry._id );
      else
        throw new Error404( `User not found` );
    }

    if ( options.name )
      searchQuery.name = options.name;

    if ( options.identifier )
      searchQuery.identifier = options.identifier;

    if ( options.id )
      searchQuery._id = new ObjectID( options.id );

    const result = await volumeModel.findOne<IVolume<'server'>>( searchQuery );

    if ( !result )
      return null;
    else {
      const volume = await result.downloadToken<IVolume<'client'>>( { verbose: true, expandForeignKeys: true, expandMaxDepth: 1 } );
      return volume;
    }
  }

  /**
   * Updates a volume resource
   * @param id The id of the volume to edit
   * @param token The edit token
   */
  async update( id: string, token: IVolume<'client'> ) {

    if ( !isValidObjectID( id ) )
      throw new Error( `Please use a valid object id` );

    const updatedVolume = await this._volumes.update<IVolume<'client'>>( { _id: new ObjectID( id ) }, token, { verbose: true, expandMaxDepth: 1, expandForeignKeys: true } );
    return updatedVolume;
  }

  /**
   * Attempts to remove all data associated with a user
   * @param user The user we are removing
   */
  async removeUser( user: string ) {
    await this.remove( { user: user } );
    await this._filesController.removeFiles( { user: user } );
    return;
  }

  /**
   * Attempts to create a new user volume by first creating the storage on the cloud and then updating the internal DB
   * @param token The volume token to save
   */
  async create( token: Partial<IVolume<'client'>> ) {
    const identifier = `webinate-volume-${generateRandString( 8 ).toLowerCase()}`;
    const volumeModel = this._volumes;

    // Create the new volume
    const volume: Partial<IVolume<'client'>> = {
      name: 'New Volume',
      identifier: identifier,
      created: Date.now(),
      memoryUsed: 0,
      memoryAllocated: VolumesController.MEMORY_ALLOCATED,
      ...token
    }

    if ( volume!.memoryUsed! > volume!.memoryAllocated! )
      throw new Error500( `memoryUsed cannot be greater than memoryAllocated` );

    // Save the new entry into the database
    const schema = await volumeModel.createInstance( volume );

    // Attempt to create a new Google volume
    try {
      await RemoteFactory.get( schema.dbEntry.type ).createVolume( schema.dbEntry );
    }
    catch ( err ) {
      await volumeModel.deleteInstances( { _id: schema.dbEntry._id } as IVolume<'server'> );
      throw new Error( `Could not create remote: ${err.message}` );
    }

    return schema.downloadToken<IVolume<'client'>>( { verbose: true, expandForeignKeys: true, expandMaxDepth: 1 } );
  }

  /**
   * Attempts to remove volumes of the given search result. This will also update the file and stats collection.
   * @param searchQuery A valid mongodb search query
   * @returns An array of ID's of the volumes removed
   */
  async remove( options: Partial<DeleteOptions> ) {
    const volumesModel = this._volumes;
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

    if ( options.user ) {
      const user = await this._users.getUser( options.user );
      if ( user )
        searchQuery.user = new ObjectID( user.dbEntry._id );
      else
        throw new Error404( `User not found` );
    }

    // Get all the volumes
    const schemas = await volumesModel.findMany<IVolume<'server'>>( { selector: searchQuery, limit: -1 } );

    if ( options._id && schemas.length === 0 )
      throw new Error( 'A volume with that ID does not exist' );

    // Now delete each one
    const promises: Promise<IVolume<'server'>>[] = []
    for ( let i = 0, l = schemas.length; i < l; i++ )
      promises.push( this.deleteVolume( schemas[ i ].dbEntry ) as Promise<IVolume<'server'>> );

    await Promise.all( promises );
    return toRemove;
  }

  /**
   * Deletes the volume from storage and updates the databases
   */
  private async deleteVolume( volume: IVolume<'server' | 'client'> ) {
    const volumesModel = this._volumes;

    try {
      // First remove all volume files
      await this._filesController.removeFiles( { volumeId: volume._id } );
    } catch ( err ) {
      throw new Error( `Could not remove the volume: '${err.toString()}'` );
    }

    await RemoteFactory.get( volume.type ).removeVolume( volume );

    // Remove the volume entry
    await volumesModel.deleteInstances( { _id: volume._id } as IVolume<'server'> );
    return volume;
  }
}