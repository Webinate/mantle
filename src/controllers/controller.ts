import { Model } from '../models/model';
import * as mongodb from 'mongodb';
import * as express from 'express';

export class Controller {
  private static _models: Array<Model> = [];
  private _models: Array<Model>;

  constructor( models: Array<Model> | null ) {
    this._models = [];

    if ( models ) {
      for ( let ii = 0, il = models.length; ii < il; ii++ ) {
        let modelAlreadyAdded = false;

        for ( let i = 0, l = Controller._models.length; i < l; i++ )
          if ( Controller._models[ i ].collectionName === models[ ii ].collectionName ) {
            modelAlreadyAdded = true;
            break;
          }

        if ( !modelAlreadyAdded ) {
          this._models.push( models[ ii ] );
          Controller._models.push( models[ ii ] );
        }
      }
    }
  }

  /**
	 * Called to initialize this controller and its related database objects
	 */
  async initialize( e: express.Express, db: mongodb.Db ): Promise<Controller> {
    if ( !this._models )
      return this;

    // Start the initialization of all of the models
    const promises: Array<Promise<Model>> = [];
    for ( let i = 0, l = this._models.length; i < l; i++ )
      promises.push( this._models[ i ].initialize( db ) );

    await Promise.all( promises );
    return this;
  }

  /**
	 * Gets a model by its collection name
	 */
  getModel( collectionName: string ): Model | null {
    const models = Controller._models;
    for ( let i = 0, l = models.length; i < l; i++ )
      if ( models[ i ].collectionName === collectionName )
        return models[ i ];

    return null;
  }
}