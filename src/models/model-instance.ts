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
  public schema: Schema<IModelEntry>;
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


}