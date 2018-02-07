/// <reference types="express" />
import { Model } from '../models/model';
import * as mongodb from 'mongodb';
import * as express from 'express';
import { IModelEntry } from '../types/models/i-model-entry';
export declare class Serializer {
    private _models;
    constructor(models: Model<IModelEntry>[] | null);
    /**
       * Called to initialize this controller and its related database objects
       */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
       * Gets a model by its collection name
       */
    getModel(collectionName: string): Model<IModelEntry> | null;
}
