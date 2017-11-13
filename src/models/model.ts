import { IModelEntry, ISchemaOptions } from 'modepress';
import { Collection, Db, ObjectID } from 'mongodb';
import { Schema } from './schema';
import { info } from '../utils/logger';
import Factory from '../core/model-factory';

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
export abstract class Model<T extends IModelEntry> {
  public collection: Collection<T>;
  public schema: Schema<T>;
  private _collectionName: string;

  /**
	 * Creates an instance of a Model
	 * @param collection The collection name associated with this model
	 */
  constructor( collection: string ) {
    this._collectionName = collection;
    this.schema = new Schema();
  }

  /**
	 * Gets the name of the collection associated with this model
	 */
  get collectionName(): string { return this._collectionName; }

  /**
	 * Initializes the model by setting up the database collections
	 */
  async initialize( collection: Collection, db: Db ): Promise<Model<T>> {
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
	 */
  async findInstances( options: ISearchOptions<T> = {} ) {
    const collection = this.collection;

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
    const schemas: Schema<IModelEntry>[] = [];
    let schema: Schema<IModelEntry>;

    // For each data entry, create a new instance
    for ( let i = 0, l = result.length; i < l; i++ ) {
      schema = this.schema.clone();
      schema.set( result[ i ], true );
      schema.deserialize( result[ i ] );
      schemas.push( schema );
    }

    // Complete
    return schemas as Schema<T>[];
  }

  /**
   * Gets a model instance based on the selector criteria
   * @param selector The mongodb selector
   * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
   */
  async findOne( selector: any, projection?: any ) {
    const instances = await this.findInstances( { selector: selector, projection: projection, limit: 1 } );
    if ( !instances || instances.length === 0 )
      return null;
    else
      return instances[ 0 ];
  }

  /**
   * Deletes a instance and all its dependencies are updated or deleted accordingly
   */
  private async deleteInstance( schema: Schema<IModelEntry> ) {
    let foreignModel: Model<IModelEntry>;
    const optionalDependencies = schema.dbEntry._optionalDependencies;
    const requiredDependencies = schema.dbEntry._requiredDependencies;
    const arrayDependencies = schema.dbEntry._arrayDependencies;

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
        pullToken.$pull[ arrayDependencies[ i ].propertyName ] = schema.dbEntry._id;
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
    promises.push( schema.postDelete( this._collectionName ) );

    await Promise.all( promises );

    // Remove the original instance from the DB
    const deleteResult = await this.collection.deleteMany( <IModelEntry>{ _id: schema.dbEntry._id } );

    return deleteResult.deletedCount!;
  }

  /**
	 * Deletes a number of instances based on the selector. The promise reports how many items were deleted
	 */
  async deleteInstances( selector: any ): Promise<number> {
    const schemas = await this.findInstances( { selector: selector } );

    if ( !schemas || schemas.length === 0 )
      return 0;

    const promises: Array<Promise<any>> = [];

    for ( let i = 0, l = schemas.length; i < l; i++ ) {
      promises.push( this.deleteInstance( schemas[ i ] ) );
    };

    await Promise.all( promises );

    return Promise.resolve( schemas.length );
  }

  /**
   * Updates an instance with new data. The update process will validate the new data and check that
   * unique fields are still being respected.
   * @param selector The selector to determine which model to update
   * @param data The data to update the model with
   */
  async update( selector: any, data: T, options: ISchemaOptions = { verbose: true, expandForeignKeys: false } ) {

    const schema = await this.findOne( selector );

    if ( !schema )
      throw new Error( `Resource does not exist` );

    // If we have data, then set the variables
    if ( data )
      schema.set( data, false );

    // Make sure the new updates are valid
    await schema.validate( false );

    // Make sure any unique fields are still being respected
    const unique = await this.checkUniqueness( schema, schema.dbEntry._id );

    if ( !unique )
      throw new Error( `'${this.schema.uniqueFieldNames()}' must be unique` );

    // Transform the schema into a JSON ready format
    const json = schema.serialize();
    const collection = this.collection;
    await collection.updateOne( { _id: schema.dbEntry._id }, { $set: json } );

    // Now that everything has been added, we can do some post insert/update validation
    await schema.postUpsert( this._collectionName );
    return schema.getAsJson( options );
  }

  /**
   * Checks if the schema item being ammended is unique
   */
  async checkUniqueness( schema: Schema<IModelEntry>, id?: ObjectID ): Promise<boolean> {
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
  async createInstance( data?: T ) {
    const schema = this.schema.clone();

    // If we have data, then set the variables
    if ( data )
      schema.set( data, true );

    const unique = await this.checkUniqueness( schema );

    if ( !unique )
      throw new Error( `'${this.schema.uniqueFieldNames()}' must be unique` );

    // Now try to create a new instance
    const schemas = await this.insert( [ schema ] );

    // All ok
    return schemas[ 0 ] as Schema<T>;
  }

  /**
	 * Attempts to insert an array of instances of this model into the database.
	 * @param instances An array of instances to save
	 */
  async insert( instances: Schema<IModelEntry>[] ) {
    const model = this;
    const collection = model.collection;

    if ( !collection )
      throw new Error( 'The model has not been initialized' );

    const documents: Array<any> = [];
    const promises: Array<Promise<Schema<IModelEntry>>> = [];

    // Make sure the parameters are valid
    for ( let i = 0, l = instances.length; i < l; i++ )
      promises.push( instances[ i ].validate( true ) );

    const schemas = await Promise.all<Schema<IModelEntry>>( promises );

    // Transform the schema into a JSON ready format
    for ( let i = 0, l = schemas.length; i < l; i++ ) {
      const json = schemas[ i ].serialize();
      documents.push( json );
    }

    // Attempt to save the data to mongo collection
    const insertResult = await collection.insertMany( documents );

    // Assign the ID's
    for ( let i = 0, l = insertResult.ops.length; i < l; i++ ) {
      // instances[ i ]._id = insertResult.ops[ i ]._id;
      // instances[ i ].dbEntry = insertResult.ops[ i ];
      schemas[ i ].set( insertResult.ops[ i ], true );
    }

    // Now that everything has been added, we can do some post insert/update validation
    const postValidationPromises: Array<Promise<Schema<IModelEntry>>> = [];
    for ( let i = 0, l = instances.length; i < l; i++ )
      postValidationPromises.push( instances[ i ].postUpsert( this._collectionName ) );

    await Promise.all( postValidationPromises );

    return instances;
  }
}