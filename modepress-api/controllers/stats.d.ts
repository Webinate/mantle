import { IConfig } from '../types/config/i-config';
import { IStorageStats } from '../types/models/i-storage-stats';
import { Db } from 'mongodb';
import Controller from './controller';
/**
 * Class responsible for managing user stats
 */
export declare class StatsController extends Controller {
    private static MEMORY_ALLOCATED;
    private static API_CALLS_ALLOCATED;
    private _stats;
    constructor(config: IConfig);
    /**
     * Initializes the controller
     * @param db The mongo db
     */
    initialize(db: Db): Promise<void>;
    /**
     * Fetches the storage/api data for a given user
     * @param user The user whos data we are fetching
     */
    get(user?: string): Promise<IStorageStats>;
    /**
     * Attempts to create a user usage statistics
     * @param user The user associated with this bucket
     */
    createUserStats(user: string): Promise<IStorageStats>;
    /**
     * Attempts to remove the usage stats of a given user
     * @param user The user associated with this bucket
     */
    remove(user: string): Promise<number>;
    /**
     * Finds and downloads a file
     * @param fileID The file ID of the file on the bucket
     * @returns Returns the number of results affected
     */
    update(user: string, value: Partial<IStorageStats>): Promise<IStorageStats>;
}
