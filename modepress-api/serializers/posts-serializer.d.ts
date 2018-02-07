/// <reference types="express" />
import * as mongodb from 'mongodb';
import * as express from 'express';
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
/**
 * A controller that deals with the management of posts
 */
export declare class PostsSerializer extends Serializer {
    private _options;
    private _controller;
    /**
       * Creates a new instance of the controller
       */
    constructor(options: IBaseControler);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
     * Returns an array of IPost items
     */
    private getPosts(req, res);
    /**
     * Returns a single post
     */
    private getPost(req, res);
    /**
     * Attempts to remove a post by ID
     */
    private removePost(req, res);
    /**
     * Attempts to update a post by ID
     */
    private updatePost(req, res);
    /**
     * Attempts to create a new post
     */
    private createPost(req, res);
}
