import { Model } from '../models/model';
import * as mongodb from 'mongodb';
import * as express from 'express';
import { IModelEntry } from 'modepress';

export class Serializer {
  private _models: Model<IModelEntry>[];

  constructor( models: Model<IModelEntry>[] | null ) {
    this._models = models || [];
  }

  /**
	 * Called to initialize this controller and its related database objects
	 */
  async initialize( e: express.Express, db: mongodb.Db ) {
    return this;
  }

  /**
	 * Gets a model by its collection name
	 */
  getModel( collectionName: string ): Model<IModelEntry> | null {
    const models = this._models;
    for ( let i = 0, l = models.length; i < l; i++ )
      if ( models[ i ].collectionName === collectionName )
        return models[ i ];

    return null;
  }
}