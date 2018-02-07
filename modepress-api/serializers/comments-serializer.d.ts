/// <reference types="express" />
import * as mongodb from 'mongodb';
import * as express from 'express';
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
/**
 * A controller that deals with the management of comments
 */
export declare class CommentsSerializer extends Serializer {
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
     * Returns an array of IComment items
     */
    private getComments(req, res);
    /**
     * Returns a single comment
     */
    private getComment(req, res);
    /**
     * Attempts to remove a comment by ID
     */
    private remove(req, res);
    /**
     * Attempts to update a comment by ID
     */
    private update(req, res);
    /**
     * Attempts to create a new comment
     */
    private create(req, res);
}
