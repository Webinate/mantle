import { IModelEntry } from 'modepress';
import { ObjectID } from 'mongodb';
import { Schema } from './schema';
import { Model } from './model';

/**
 * An instance of a model with its own unique schema and ID. The initial schema is a clone
 * the parent model's
 */
export class ModelInstance<T extends IModelEntry | null> {
  public model: Model;
  public schema: Schema;
  public _id: ObjectID;
  public dbEntry: T;

  /**
	 * Creates a model instance
	 */
  constructor( model: Model, dbEntry: T ) {
    this.model = model;
    this.schema = model.defaultSchema.clone();
    this.dbEntry = dbEntry;
  }

  /**
   * Gets a string representation of all fields that are unique
   */
  uniqueFieldNames(): string {
    let uniqueNames = '';
    const items = this.schema.getItems();

    for ( let i = 0, l = items.length; i < l; i++ )
      if ( items[ i ].getUnique() )
        uniqueNames += items[ i ].name + ', ';

    if ( uniqueNames !== '' )
      uniqueNames = uniqueNames.slice( 0, uniqueNames.length - 2 );

    return uniqueNames;
  }
}