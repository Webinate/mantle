import { IConfig } from '../types/config/i-config';
import { Db } from 'mongodb';
import Controller from '../controllers/controller';
import { BucketsController } from '../controllers/buckets';
import { FilesController } from '../controllers/files';
import { PostsController } from '../controllers/posts';
import { SessionsController } from '../controllers/sessions';
import { UsersController } from '../controllers/users';
import { CommentsController } from '../controllers/comments';
import { StatsController } from '../controllers/stats';
/**
 * Factory classs for creating & getting controllers
 */
export declare class ControllerFactory {
    private _config;
    private _db;
    private _controllers;
    initialize(config: IConfig, database: Db): void;
    /**
     * Adds the default models to the system
     */
    addDefaults(): Promise<void>;
    get(type: 'buckets'): BucketsController;
    get(type: 'posts'): PostsController;
    get(type: 'comments'): CommentsController;
    get(type: 'sessions'): SessionsController;
    get(type: 'users'): UsersController;
    get(type: 'files'): FilesController;
    get(type: 'stats'): StatsController;
    get(type: string): Controller;
    /**
     * A factory method for creating models
     * @param type The type of model to create
     */
    private create(type);
}
declare const singleton: ControllerFactory;
export default singleton;
