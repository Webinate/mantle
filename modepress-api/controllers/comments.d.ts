import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IComment } from '../types/models/i-comment';
import * as mongodb from 'mongodb';
import Controller from './controller';
export declare type GetManyOptions = {
    public?: boolean;
    parentId?: string;
    keyword?: string;
    user?: string;
    sort?: boolean;
    verbose?: boolean;
    expanded?: boolean;
    depth?: number;
    sortType?: 'updated';
    sortOrder?: 'asc' | 'desc';
    index?: number;
    limit?: number;
};
export declare type GetOneOptions = {
    verbose?: boolean;
    expanded?: boolean;
    depth?: number;
};
/**
 * A controller that deals with the management of comments
 */
export declare class CommentsController extends Controller {
    private _commentsModel;
    /**
       * Creates a new instance of the controller
       */
    constructor(config: IConfig);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(db: mongodb.Db): Promise<this>;
    /**
     * Returns an array of comment entries
     */
    getAll(options?: GetManyOptions): Promise<Page<IComment>>;
    /**
     * Gets a single comment resource
     * @param id The id of the comment to fetch
     * @param options Options for getting the resource
     */
    getOne(id: string, options?: GetOneOptions): Promise<IComment>;
    /**
     * Removes a comment by its id
     * @param id The id of the comment
     */
    remove(id: string): Promise<void>;
    /**
     * Updates a comment by id
     * @param id The id of the comment
     * @param token The update token of the comment
     */
    update(id: string, token: IComment): Promise<IComment>;
    /**
     * Creates a new comment
     * @param token The data of the comment to create
     */
    create(token: IComment): Promise<IComment>;
}
