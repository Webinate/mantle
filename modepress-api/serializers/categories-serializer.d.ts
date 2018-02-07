/// <reference types="express" />
import * as mongodb from 'mongodb';
import * as express from 'express';
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
/**
 * A controller that deals with the management of categories
 */
export declare class CategoriesSerializer extends Serializer {
    private _options;
    /**
       * Creates a new instance of the controller
       */
    constructor(options: IBaseControler);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
     * Returns an array of ICategory items
     */
    private getCategories(req, res);
    /**
     * Attempts to remove a category by ID
     */
    private removeCategory(req, res);
    /**
     * Attempts to create a new category item
     */
    private createCategory(req, res);
}
