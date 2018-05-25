import { IConfig } from '../types/config/i-config';
import { IStorageStats } from '../types/models/i-storage-stats';
import { Db } from 'mongodb';
import Controller from './controller';
import ModelFactory from '../core/model-factory';
import { StorageStatsModel } from '../models/storage-stats-model';

/**
 * Class responsible for managing user stats
 */
export class StatsController extends Controller {
  private static MEMORY_ALLOCATED: number = 5e+8; // 500mb
  private static API_CALLS_ALLOCATED: number = 20000; // 20,000
  private _stats: StorageStatsModel;

  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {
    this._stats = ModelFactory.get( 'storage' );
    return this;
  }

  /**
   * Fetches the storage/api data for a given user
   * @param user The user whos data we are fetching
   */
  async get( user?: string ) {
    const result = await this._stats.downloadOne<IStorageStats<'client'>>( { user: user } as IStorageStats<'server'>, { verbose: true } );
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

    const storage: Partial<IStorageStats<'client'>> = {
      user: user,
      apiCallsAllocated: StatsController.API_CALLS_ALLOCATED,
      memoryAllocated: StatsController.MEMORY_ALLOCATED,
      apiCallsUsed: 0,
      memoryUsed: 0
    }

    const schema = await stats.createInstance( storage );
    return schema.downloadToken<IStorageStats<'client'>>( { verbose: true } );
  }

  /**
   * Attempts to remove the usage stats of a given user
   * @param user The user associated with this bucket
   */
  async remove( user: string ) {
    const deleteResult = await this._stats.deleteInstances( { user: user } as IStorageStats<'server'> );
    return deleteResult;
  }

  /**
   * Finds and downloads a file
   * @param fileID The file ID of the file on the bucket
   * @returns Returns the number of results affected
   */
  async update( user: string, value: Partial<IStorageStats<'client'>> ) {
    const stats = this._stats;
    const result = await stats.update<IStorageStats<'client'>>( { user: user } as IStorageStats<'server'>, value );
    return result;
  }
}