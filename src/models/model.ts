import { IModelEntry } from 'modepress';
import { Collection, Db, ObjectID } from 'mongodb';
import { Schema } from './schema';
import { info } from '../utils/logger';
import { ModelInstance } from './model-instance';
import Factory from '../core/controller-factory';

export interface UpdateToken<T> { error: string | boolean; instance: ModelInstance<T> }

/*
 * Describes a token returned from updating instances
 */
export interface UpdateRequest<T> { error: boolean; tokens: Array<UpdateToken<T>> }

export interface ISearchOptions<T> {
  selector?: any;
  sort?: { [ name: string ]: number; } | null | T;
  index?: number;
  limit?: number;
  projection?: { [ name: string ]: number }
}

/**
 * Models map data in the application/client to data in the database
 */
export abstract class Model {
  public collection: Collection;
  public defaultSchema: Schema;
  private _collectionName: string;

  /**
	 * Creates an instance of a Model
	 * @param collection The collection name associated with this model
	 */
  constructor( collection: string ) {
    this._collectionName = collection;
    this.defaultSchema = new Schema();
  }

  /**
	 * Gets the name of the collection associated with this model
	 */
  get collectionName(): string { return this._collectionName; }

  /**
	 * Initializes the model by setting up the database collections
	 */
  async initialize( collection: Collection, db: Db ): Promise<Model> {
    info( `Successfully created model '${this._collectionName}'` );
    this.collection = collection;

    return this;
  }

  /**
   * Gets the number of DB entries based on the selector
   * @param selector The mongodb selector
   */
  count( selector: any ) {
    return this.collection.count( selector );
  }

  /**
	 * Gets an arrray of instances based on the selector search criteria
 	 * @param selector The mongodb selector
 	 * @param sort Specify an array of items to sort.
   * Each item key represents a field, and its associated number can be either 1 or -1 (asc / desc)
   * @param startIndex The start index of where to select from
	 * @param limit The number of results to fetch
   * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
	 */
  async findInstances<T>( options: ISearchOptions<T> = {} ) {
    const collection = this.collection;

    if ( !collection )
      throw new Error( 'The model has not been initialized' );

    // Attempt to save the data to mongo collection
    let cursor = collection.find( options.selector || {} );

    if ( options.index !== undefined )
      cursor = cursor.skip( options.index );
    if ( options.limit !== undefined )
      cursor = cursor.limit( options.limit );
    if ( options.projection !== undefined )
      cursor = cursor.project( options.projection );
    if ( options.sort )
      cursor = cursor.sort( options.sort );

    const result = await cursor.toArray();

    // Create the instance array
    const instances: Array<ModelInstance<T>> = [];
    let instance: ModelInstance<T>;

    // For each data entry, create a new instance
    for ( let i = 0, l = result.length; i < l; i++ ) {
      instance = new ModelInstance<T>( this, result[ i ] );
      instance.schema.deserialize( result[ i ] );
      instance._id = result[ i ]._id;
      instances.push( instance );
    }

    // Complete
    return instances;
  }

  /**
   * Gets a model instance based on the selector criteria
   * @param selector The mongodb selector
   * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
   */
  async findOne<T>( selector: any, projection?: any ): Promise<ModelInstance<T> | null> {
    const collection = this.collection;

    if ( !collection )
      throw new Error( 'The model has not been initialized' );

    // Attempt to save the data to mongo collection
    const result = await collection.find( selector ).limit( 1 ).project( projection || {} ).next();

    // Check for errors
    if ( !result )
      return null;
    else {
      // Create the instance array
      let instance: ModelInstance<T>;

      instance = new ModelInstance<T>( this, result );
      instance.schema.deserialize( result );
      instance._id = ( <IModelEntry>result )._id;

      // Complete
      return instance;
    }
  }

  /**
   * Deletes a instance and all its dependencies are updated or deleted accordingly
   */
  private async deleteInstance( instance: ModelInstance<IModelEntry> ): Promise<number> {
    let foreignModel: Model;
    const optionalDependencies = instance.dbEntry._optionalDependencies;
    const requiredDependencies = instance.dbEntry._requiredDependencies;
    const arrayDependencies = instance.dbEntry._arrayDependencies;

    const promises: Array<Promise<any>> = [];

    // Nullify all dependencies that are optional
    if ( optionalDependencies )
      for ( let i = 0, l = optionalDependencies.length; i < l; i++ ) {
        foreignModel = Factory.get( optionalDependencies[ i ].collection );
        if ( !foreignModel )
          continue;

        let setToken = { $set: {} };
        setToken.$set[ optionalDependencies[ i ].propertyName ] = null;
        promises.push( foreignModel.collection.updateOne( <IModelEntry>{ _id: optionalDependencies[ i ]._id }, setToken ) );
      }

    // Remove any dependencies that are in arrays
    if ( arrayDependencies )
      for ( let i = 0, l = arrayDependencies.length; i < l; i++ ) {
        foreignModel = Factory.get( arrayDependencies[ i ].collection );
        if ( !foreignModel )
          continue;

        let pullToken = { $pull: {} };
        pullToken.$pull[ arrayDependencies[ i ].propertyName ] = instance._id;
        promises.push( foreignModel.collection.updateMany( <IModelEntry>{ _id: arrayDependencies[ i ]._id }, pullToken ) );
      }

    // For those dependencies that are required, we delete the instances
    if ( requiredDependencies )
      for ( let i = 0, l = requiredDependencies.length; i < l; i++ ) {
        foreignModel = Factory.get( requiredDependencies[ i ].collection );
        if ( !foreignModel )
          continue;

        promises.push( foreignModel.deleteInstances( <IModelEntry>{ _id: requiredDependencies[ i ]._id } ) );
      }

    // Added the schema item post deletion promises
    promises.push( instance.schema.postDelete( instance, this._collectionName ) );

    await Promise.all( promises );

    // Remove the original instance from the DB
    const deleteResult = await this.collection.deleteMany( <IModelEntry>{ _id: instance.dbEntry._id } );

    return deleteResult.deletedCount!;
  }

  /**
	 * Deletes a number of instances based on the selector. The promise reports how many items were deleted
	 */
  async deleteInstances( selector: any ): Promise<number> {
    const instances = await this.findInstances<IModelEntry>( { selector: selector } );

    if ( !instances || instances.length === 0 )
      return 0;

    const promises: Array<Promise<any>> = [];

    for ( let i = 0, l = instances.length; i < l; i++ ) {
      promises.push( this.deleteInstance( instances[ i ] ) );
    };

    await Promise.all( promises );

    return Promise.resolve( instances.length );
  }

  /**
   * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
   * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
   * with updating the specific instance.
   * @param selector The selector for updating instances
   * @param data The data object that will attempt to set the instance's schema variables
   * @returns {Promise<UpdateRequest<T>>} An array of objects that contains the field error and instance. Error is false if nothing
   * went wrong when updating the specific instance, and a string message if something did in fact go wrong
   */
  async update<T>( selector: any, data: T ): Promise<UpdateRequest<T>> {
    const toRet: UpdateRequest<T> = {
      error: false,
      tokens: []
    };

    const instances = await this.findInstances<T>( { selector: selector } );

    if ( !instances || instances.length === 0 )
      return toRet;

    for ( let i = 0, l = instances.length; i < l; i++ ) {
      const instance = instances[ i ];

      // If we have data, then set the variables
      if ( data )
        instance.schema.set( data, false );

      try {
        // Make sure the new updates are valid
        await instance.schema.validate( false );

        // Make sure any unique fields are still being respected
        const unique = await this.checkUniqueness( instance.schema, instance._id );

        if ( !unique ) {
          toRet.error = true;
          toRet.tokens.push( { error: `'${this.defaultSchema.uniqueFieldNames()}' must be unique`, instance: instance } );
          continue;
        }

        // Transform the schema into a JSON ready format
        const json = instance.schema.serialize();
        const collection = this.collection;
        await collection.updateOne( { _id: ( <IModelEntry>instance )._id }, { $set: json } );

        // Now that everything has been added, we can do some post insert/update validation
        await instance.schema.postUpsert<T>( instance, this._collectionName );

        toRet.tokens.push( { error: false, instance: instance } );

      } catch ( err ) {
        toRet.error = true;
        toRet.tokens.push( { error: err.message, instance: instance } );
      };
    };

    return toRet;
  }

  /**
   * Checks if the schema item being ammended is unique
   */
  async checkUniqueness( schema: Schema, id?: ObjectID ): Promise<boolean> {
    const items = schema.getItems();
    let hasUniqueField: boolean = false;
    const searchToken = { $or: [] as any[] };

    if ( id )
      searchToken[ '_id' ] = { $ne: id };

    for ( let i = 0, l = items.length; i < l; i++ ) {
      if ( items[ i ].getUnique() ) {
        hasUniqueField = true;
        const searchField = {};
        searchField[ items[ i ].name ] = items[ i ].getDbValue();
        searchToken.$or.push( searchField );
      }
      else if ( items[ i ].getUniqueIndexer() )
        searchToken[ items[ i ].name ] = items[ i ].getDbValue();
    }

    if ( !hasUniqueField )
      return true;
    else {
      const result = await this.collection.count( searchToken );
      if ( result === 0 )
        return true;
      else
        return false;
    }
  }


  /**
	 * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
	 * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
	 * by parsing the data object and setting each schema item's value by the name/value in the data object
	 */
  async createInstance<T>( data?: T ): Promise<ModelInstance<T | null>> {
    const newInstance = new ModelInstance<T | null>( this, null );

    // If we have data, then set the variables
    if ( data )
      newInstance.schema.set( data, true );

    const unique = await this.checkUniqueness( newInstance.schema );

    if ( !unique )
      throw new Error( `'${this.defaultSchema.uniqueFieldNames()}' must be unique` );

    // Now try to create a new instance
    const instance = await this.insert( [ newInstance ] );

    // All ok
    return instance[ 0 ];
  }

  /**
	 * Attempts to insert an array of instances of this model into the database.
	 * @param instances An array of instances to save
	 */
  async insert<T>( instances: Array<ModelInstance<T>> ): Promise<Array<ModelInstance<T>>> {
    const model = this;
    const collection = model.collection;

    if ( !collection )
      throw new Error( 'The model has not been initialized' );

    const documents: Array<any> = [];
    const promises: Array<Promise<Schema>> = [];

    // Make sure the parameters are valid
    for ( let i = 0, l = instances.length; i < l; i++ )
      promises.push( instances[ i ].schema.validate( true ) );

    const schemas = await Promise.all<Schema>( promises );

    // Transform the schema into a JSON ready format
    for ( let i = 0, l = schemas.length; i < l; i++ ) {
      const json = schemas[ i ].serialize();
      documents.push( json );
    }

    // Attempt to save the data to mongo collection
    const insertResult = await collection.insertMany( documents );

    // Assign the ID's
    for ( let i = 0, l = insertResult.ops.length; i < l; i++ ) {
      instances[ i ]._id = insertResult.ops[ i ]._id;
      instances[ i ].dbEntry = insertResult.ops[ i ];
    }

    // Now that everything has been added, we can do some post insert/update validation
    const postValidationPromises: Array<Promise<Schema>> = [];
    for ( let i = 0, l = instances.length; i < l; i++ )
      postValidationPromises.push( instances[ i ].schema.postUpsert<T>( instances[ i ], this._collectionName ) );

    await Promise.all<Schema>( postValidationPromises );

    return instances;
  }
}