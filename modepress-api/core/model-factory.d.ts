import { IConfig } from '../types/config/i-config';
import { IModelEntry } from '../types/models/i-model-entry';
import { Db, Collection } from 'mongodb';
import { Model } from '../models/model';
import { BucketModel } from '../models/bucket-model';
import { CategoriesModel } from '../models/categories-model';
import { CommentsModel } from '../models/comments-model';
import { FileModel } from '../models/file-model';
import { PostsModel } from '../models/posts-model';
import { RendersModel } from '../models/renders-model';
import { SessionModel } from '../models/session-model';
import { StorageStatsModel } from '../models/storage-stats-model';
import { UsersModel } from '../models/users-model';
/**
 * Factory classs for creating & getting models
 */
export declare class ModelFactory {
    private _db;
    private _models;
    initialize(config: IConfig, database: Db): void;
    /**
     * Adds the default models to the system
     */
    addBaseModelFactories(): Promise<void>;
    /**
     * Sets up a model's indices
     * @param model The model to setup
     */
    setupIndices(model: Model<IModelEntry>): Promise<Collection<any>>;
    get(type: 'buckets'): BucketModel;
    get(type: 'categories'): CategoriesModel;
    get(type: 'comments'): CommentsModel;
    get(type: 'files'): FileModel;
    get(type: 'posts'): PostsModel;
    get(type: 'renders'): RendersModel;
    get(type: 'sessions'): SessionModel;
    get(type: 'storage'): StorageStatsModel;
    get(type: 'users'): UsersModel;
    get(type: string): Model<IModelEntry>;
    /**
     * A factory method for creating models
     * @param type The type of model to create
     */
    private create(type);
}
declare const _default: ModelFactory;
export default _default;
