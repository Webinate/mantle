import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IBucketEntry } from '../types/models/i-bucket-entry';
import { IFileEntry } from '../types/models/i-file-entry';
import { Db, ObjectID } from 'mongodb';
import { Part } from 'multiparty';
import Controller from './controller';
export declare type GetManyOptions = {
    user?: string;
    searchTerm?: RegExp;
    index?: number;
    limit?: number;
};
export declare type GetOptions = {
    user?: string;
    identifier?: string;
    name?: string;
};
export declare type DeleteOptions = {
    user?: string;
    _id?: string | ObjectID;
};
/**
 * Class responsible for managing buckets and uploads
 */
export declare class BucketsController extends Controller {
    private _buckets;
    private _files;
    private _stats;
    private _activeManager;
    private _filesController;
    private _statsController;
    constructor(config: IConfig);
    /**
     * Initializes the controller
     * @param db The mongo db
     */
    initialize(db: Db): Promise<void>;
    /**
     * Fetches all bucket entries from the database
     * @param options Options for defining which buckets to return
     */
    getMany(options?: GetManyOptions): Promise<Page<IBucketEntry>>;
    /**
     * Gets a bucket entry by its name or ID
     */
    get(options?: GetOptions): Promise<IBucketEntry | null>;
    /**
     * Attempts to remove all data associated with a user
     * @param user The user we are removing
     */
    removeUser(user: string): Promise<void>;
    /**
     * Attempts to create a new user bucket by first creating the storage on the cloud and then updating the internal DB
     * @param name The name of the bucket
     * @param user The user associated with this bucket
     */
    create(name: string, user: string): Promise<IBucketEntry>;
    /**
     * Attempts to remove buckets of the given search result. This will also update the file and stats collection.
     * @param searchQuery A valid mongodb search query
     * @returns An array of ID's of the buckets removed
     */
    remove(options: DeleteOptions): Promise<string[]>;
    /**
     * Deletes the bucket from storage and updates the databases
     */
    private deleteBucket(bucketEntry);
    /**
     * Checks to see the user's storage limits to see if they are allowed to upload data
     * @param user The username
     * @param part
     */
    private canUpload(user, part);
    /**
     * Checks to see the user's api limit and make sure they can make calls
     * @param user The username
     */
    withinAPILimit(user: string): Promise<boolean>;
    /**
     * Uploads a part stream as a new user file. This checks permissions, updates the local db and uploads the stream to the bucket
     * @param part
     * @param bucket The bucket to which we are uploading to
     * @param user The username
     * @param makePublic Makes this uploaded file public to the world
     * @param parentFile [Optional] Set a parent file which when deleted will detelete this upload as well
     */
    uploadStream(part: Part, bucketEntry: IBucketEntry, user: string, makePublic?: boolean, parentFile?: string | null): Promise<IFileEntry>;
}
