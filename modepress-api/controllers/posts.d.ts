import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IPost } from '../types/models/i-post';
import * as mongodb from 'mongodb';
import Controller from './controller';
export declare type GetManyOptions = {
    verbose?: boolean;
    keyword?: RegExp;
    author?: RegExp;
    public?: boolean;
    tags?: string[];
    requiredTags?: string[];
    categories?: string[];
    sort?: boolean;
    sortOrder?: 'asc' | 'desc';
    minimal?: boolean;
    index?: number;
    limit?: number;
};
export declare type GetOneOptions = {
    id?: string;
    slug?: string;
    verbose?: boolean;
    public?: boolean;
};
/**
 * A controller that deals with the management of posts
 */
export declare class PostsController extends Controller {
    private _postsModel;
    /**
       * Creates a new instance of the controller
       */
    constructor(config: IConfig);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(db: mongodb.Db): Promise<this>;
    /**
     * Returns an array of IPost items
     */
    getPosts(options?: GetManyOptions): Promise<Page<IPost>>;
    /**
     * Removes a post by ID
     * @param id The id of the post we are removing
     */
    removePost(id: string): Promise<void>;
    /**
     * Updates a post resource
     * @param id The id of the post to edit
     * @param token The edit token
     */
    update(id: string, token: IPost): Promise<IPost>;
    /**
     * Creates a new post
     * @param token The initial post data
     */
    create(token: IPost): Promise<IPost>;
    /**
     * Gets a single post resource
     * @param options Options for getting the post resource
     */
    getPost(options?: GetOneOptions): Promise<IPost>;
}
