import * as mongodb from "mongodb";
import { Schema } from "./schema";
import * as winston from "winston";
import { IModelEntry } from "modepress-api";


export interface UpdateToken<T> { error: string | boolean; instance: ModelInstance<T> }

/*
 * Describes a token returned from updating instances
 */
export interface UpdateRequest<T> { error: boolean; tokens: Array<UpdateToken<T>> }


/**
 * An instance of a model with its own unique schema and ID. The initial schema is a clone
 * the parent model's
 */
export class ModelInstance<T extends Modepress.IModelEntry | null>
{
    public model: Model;
    public schema: Schema;
    public _id: mongodb.ObjectID;
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
        var instance = this;
        var uniqueNames = "";
        var items = instance.schema.getItems();

        for ( var i = 0, l = items.length; i < l; i++ )
            if ( items[ i ].getUnique() )
                uniqueNames += items[ i ].name + ", ";

        if ( uniqueNames != "" )
            uniqueNames = uniqueNames.slice( 0, uniqueNames.length - 2 );

        return uniqueNames;
    }
}

/**
 * Models map data in the application/client to data in the database
 */
export abstract class Model {
    public collection: mongodb.Collection;
    public defaultSchema: Schema;
    private _collectionName: string;
    private _initialized: boolean;

    private static _registeredModels: { [ name: string ]: Model } = {};

	/**
	 * Creates an instance of a Model
	 * @param collection The collection name associated with this model
	 */
    constructor( collection: string ) {
        this._collectionName = collection;
        this._initialized = false;
        this.defaultSchema = new Schema();

        if ( Model._registeredModels[ collection ] )
            throw new Error( `You cannot create model '${collection}' as its already been registered` );

        // Register the model
        Model._registeredModels[ collection ] = this;
    }


    /**
     * Returns a new model of a given type. However if the model was already registered before,
     * then the previously created model is returned.
     * @param modelConstructor The model class
     * @returns Returns the registered model
     */
    static registerModel<T extends Model>( modelConstructor: any ): T {
        var models = Model._registeredModels;
        for ( var i in models )
            if ( modelConstructor == models[ i ].constructor )
                return <T>models[ i ];

        return new modelConstructor();
    }


    /**
     * Returns a registered model by its name
     * @param name The name of the model to fetch
     * @returns Returns the registered model or null if none exists
     */
    static getByName( name: string ): Model {
        return Model._registeredModels[ name ];
    }

    /**
     * Creates an index for a collection
     * @param name The name of the field we are setting an index of
     * @param collection The collection we are setting the index on
     */
    private async createIndex( name: string, collection: mongodb.Collection ): Promise<string> {
        var index = await collection.createIndex( name );
        return index;
    }

	/**
	 * Gets the name of the collection associated with this model
	 */
    get collectionName(): string { return this._collectionName; }

	/**
	 * Initializes the model by setting up the database collections
	 * @param db The database used to create this model
	 */
    async initialize( db: mongodb.Db ): Promise<Model> {
        // If the collection already exists - then we do not have to create it
        if ( this._initialized )
            return this;

        // The collection does not exist - so create it
        this.collection = await db.createCollection( this._collectionName );

        if ( !this.collection )
            throw new Error( "Error creating collection: " + this._collectionName );

        // First remove all existing indices
        var response = await this.collection.dropIndexes();

        // Now re-create the models who need index supports
        var promises: Array<Promise<string>> = [];
        var items = this.defaultSchema.getItems();
        for ( var i = 0, l = items.length; i < l; i++ )
            if ( items[ i ].getIndexable() )
                promises.push( this.createIndex( items[ i ].name, this.collection ) );

        if ( promises.length == 0 )
            this._initialized = true;

        var models = await Promise.all( promises );

        this._initialized = true;
        winston.info( `Successfully created model '${this._collectionName}'`, { process: process.pid });
        return this;
    }

    /**
	 * Gets the number of DB entries based on the selector
	 * @param selector The mongodb selector
	 */
    async count( selector: any ): Promise<number> {
        var collection = this.collection;

        if ( !collection || !this._initialized )
            throw new Error( "The model has not been initialized" );

        return await collection.count( selector );
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
    async findInstances<T>( selector: any, sort?: any, startIndex: number = 0, limit: number = 0, projection?: any ): Promise<Array<ModelInstance<T>>> {
        var collection = this.collection;

        if ( !collection || !this._initialized )
            throw new Error( "The model has not been initialized" );

        // Attempt to save the data to mongo collection
        var result = await collection.find( selector ).limit( limit ).skip( startIndex ).project( projection || {}).sort( sort ).toArray();

        // Create the instance array
        var instances: Array<ModelInstance<T>> = [],
            instance: ModelInstance<T>;

        // For each data entry, create a new instance
        for ( var i = 0, l = result.length; i < l; i++ ) {
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
        var collection = this.collection;

        if ( !collection || !this._initialized )
            throw new Error( "The model has not been initialized" );

        // Attempt to save the data to mongo collection
        var result = await collection.find( selector ).limit( 1 ).project( projection || {}).next();

        // Check for errors
        if ( !result )
            return null;
        else {
            // Create the instance array
            var instance: ModelInstance<T>;

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
        var foreignModel: Model;
        var optionalDependencies = instance.dbEntry._optionalDependencies;
        var requiredDependencies = instance.dbEntry._requiredDependencies;
        var arrayDependencies = instance.dbEntry._arrayDependencies;

        var promises: Array<Promise<any>> = [];

        // Nullify all dependencies that are optional
        if ( optionalDependencies )
            for ( var i = 0, l = optionalDependencies.length; i < l; i++ ) {
                foreignModel = Model.getByName( optionalDependencies[ i ].collection );
                if ( !foreignModel )
                    continue;

                let setToken = { $set: {} };
                setToken.$set[ optionalDependencies[ i ].propertyName ] = null;
                promises.push( foreignModel.collection.updateOne( <IModelEntry>{ _id: optionalDependencies[ i ]._id }, setToken ) );
            }

        // Remove any dependencies that are in arrays
        if ( arrayDependencies )
            for ( var i = 0, l = arrayDependencies.length; i < l; i++ ) {
                foreignModel = Model.getByName( arrayDependencies[ i ].collection );
                if ( !foreignModel )
                    continue;

                let pullToken = { $pull: {} };
                pullToken.$pull[ arrayDependencies[ i ].propertyName ] = instance._id;
                promises.push( foreignModel.collection.updateMany( <IModelEntry>{ _id: arrayDependencies[ i ]._id }, pullToken ) );
            }

        // For those dependencies that are required, we delete the instances
        if ( requiredDependencies )
            for ( var i = 0, l = requiredDependencies.length; i < l; i++ ) {
                foreignModel = Model.getByName( requiredDependencies[ i ].collection );
                if ( !foreignModel )
                    continue;

                promises.push( foreignModel.deleteInstances( <IModelEntry>{ _id: requiredDependencies[ i ]._id }) );
            }

        // Added the schema item post deletion promises
        promises.push( instance.schema.postDelete( instance, this._collectionName ) );

        var dependenciesResults = await Promise.all( promises );

        // Remove the original instance from the DB
        var deleteResult = await this.collection.deleteMany( <IModelEntry>{ _id: instance.dbEntry._id });

        return deleteResult.deletedCount!;
    }

	/**
	 * Deletes a number of instances based on the selector. The promise reports how many items were deleted
	 */
    async deleteInstances( selector: any ): Promise<number> {
        var model = this;

        var instances = await this.findInstances<IModelEntry>( selector );

        if ( !instances || instances.length == 0 )
            return 0;

        var promises: Array<Promise<any>> = [];

        for ( var i = 0, l = instances.length; i < l; i++ ) {
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
        var toRet: UpdateRequest<T> = {
            error: false,
            tokens: []
        };

        var instances = await this.findInstances<T>( selector );

        if ( !instances || instances.length == 0 )
            return toRet;

        for ( var i = 0, l = instances.length; i < l; i++ ) {
            var instance = instances[ i ];

            // If we have data, then set the variables
            if ( data )
                instance.schema.set( data );

            try {
                // Make sure the new updates are valid
                await instance.schema.validate( false );

                // Make sure any unique fields are still being respected
                var unique = await this.checkUniqueness( instance );

                if ( !unique ) {
                    toRet.error = true;
                    toRet.tokens.push( { error: `'${instance.uniqueFieldNames()}' must be unique`, instance: instance });
                    continue;
                }

                // Transform the schema into a JSON ready format
                var json = instance.schema.serialize();
                var collection = this.collection;
                var updateResult = await collection.updateOne( { _id: ( <IModelEntry>instance )._id }, { $set: json });

                // Now that everything has been added, we can do some post insert/update validation
                await instance.schema.postUpsert<T>( instance, this._collectionName );

                toRet.tokens.push( { error: false, instance: instance });

            } catch ( err ) {
                toRet.error = true;
                toRet.tokens.push( { error: err.message, instance: instance });
            };
        };

        return toRet;
    }

    /**
	 * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
	 * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
	 * by parsing the data object and setting each schema item's value by the name/value in the data object.
	 */
    async checkUniqueness<T>( instance: ModelInstance<T> ): Promise<boolean> {
        var items = instance.schema.getItems();
        var hasUniqueField: boolean = false;
        var searchToken = { $or: [] as any[] };

        if ( instance._id )
            searchToken[ "_id" ] = { $ne: instance._id };

        for ( var i = 0, l = items.length; i < l; i++ ) {
            if ( items[ i ].getUnique() ) {
                hasUniqueField = true;
                var searchField = {};
                searchField[ items[ i ].name ] = items[ i ].getDbValue();
                searchToken.$or.push( searchField );
            }
            else if ( items[ i ].getUniqueIndexer() )
                searchToken[ items[ i ].name ] = items[ i ].getDbValue();
        }

        if ( !hasUniqueField )
            return true;
        else {
            var result = await this.collection.count( searchToken );
            if ( result == 0 )
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
        var newInstance = new ModelInstance<T | null>( this, null );

        // If we have data, then set the variables
        if ( data )
            newInstance.schema.set( data );

        var unique = await this.checkUniqueness( newInstance );

        if ( !unique )
            throw new Error( `'${newInstance.uniqueFieldNames()}' must be unique` );

        // Now try to create a new instance
        var instance = await this.insert( [ newInstance ] );

        // All ok
        return instance[ 0 ];
    }

	/**
	 * Attempts to insert an array of instances of this model into the database.
	 * @param instances An array of instances to save
	 */
    async insert<T>( instances: Array<ModelInstance<T>> ): Promise<Array<ModelInstance<T>>> {
        var model = this;
        var collection = model.collection;

        if ( !collection || !model._initialized )
            throw new Error( "The model has not been initialized" );

        var instance: ModelInstance<T>;
        var documents: Array<any> = [];
        var promises: Array<Promise<Schema>> = [];

        // Make sure the parameters are valid
        for ( var i = 0, l = instances.length; i < l; i++ )
            promises.push( instances[ i ].schema.validate( true ) );

        var schemas = await Promise.all<Schema>( promises );

        // Transform the schema into a JSON ready format
        for ( var i = 0, l = schemas.length; i < l; i++ ) {
            var json = schemas[ i ].serialize();
            documents.push( json );
        }

        // Attempt to save the data to mongo collection
        var insertResult = await collection.insertMany( documents );

        // Assign the ID's
        for ( var i = 0, l = insertResult.ops.length; i < l; i++ ) {
            instances[ i ]._id = insertResult.ops[ i ]._id;
            instances[ i ].dbEntry = insertResult.ops[ i ];
        }

        // Now that everything has been added, we can do some post insert/update validation
        var postValidationPromises: Array<Promise<Schema>> = [];
        for ( var i = 0, l = instances.length; i < l; i++ )
            postValidationPromises.push( instances[ i ].schema.postUpsert<T>( instances[ i ], this._collectionName ) );

        await Promise.all<Schema>( postValidationPromises );

        return instances;
    }
}