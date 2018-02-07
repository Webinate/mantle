import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IFileEntry } from '../types/models/i-file-entry';
import { Db, ObjectID } from 'mongodb';
import Controller from './controller';
export declare type GetOptions = {
    bucketId?: string | ObjectID;
    user?: string;
    index?: number;
    limit?: number;
    searchTerm?: RegExp;
    verbose?: boolean;
};
export declare type DeleteOptions = {
    bucketId?: string | ObjectID;
    user?: string;
    fileId?: string | ObjectID;
};
/**
 * Class responsible for managing files
 */
export declare class FilesController extends Controller {
    private _files;
    private _buckets;
    private _stats;
    private _activeManager;
    constructor(config: IConfig);
    /**
     * Initializes the controller
     * @param db The mongo db
     */
    initialize(db: Db): Promise<void>;
    /**
     * Fetches a file by its ID
     * @param fileID The file ID of the file on the bucket
     * @param user Optionally specify the user of the file
     * @param searchTerm Specify a search term
     */
    getFile(fileID: string, user?: string, searchTerm?: RegExp): Promise<IFileEntry>;
    /**
     * Fetches all file entries by a given query
     */
    getFiles(options: GetOptions): Promise<Page<IFileEntry>>;
    /**
     * Fetches the file count based on the given query
     * @param searchQuery The search query to idenfify files
     */
    count(searchQuery: IFileEntry): Promise<number>;
    /**
     * Renames a file
     * @param fileId The id of the file to rename
     * @param name The new name of the file
     */
    update(fileId: string | ObjectID, token: Partial<IFileEntry>): Promise<IFileEntry>;
    /**
     * Adds an API call to a user
     * @param user The username
     */
    private incrementAPI(user);
    /**
     * Deletes the file from storage and updates the databases
     * @param fileEntry
     */
    private deleteFile(fileEntry);
    /**
     * Attempts to remove files from the cloud and database by a query
     * @param searchQuery The query we use to select the files
     * @returns Returns the file IDs of the files removed
     */
    removeFiles(options: DeleteOptions): Promise<void>;
}
