import * as mongodb from "mongodb";
import {Schema} from "./Schema";
import * as winston from "winston";

/**
* An instance of a model with its own unique schema and ID. The initial schema is a clone
* the parent model's
*/
export class ModelInstance
{
	public model: Model;
	public schema: Schema;
	public _id: mongodb.ObjectID;
	
	/**
	* Creates a model instance
	*/
	constructor(model: Model)
	{
		this.model = model;
		this.schema = model.defaultSchema.clone();
		this._id = null;
	}
}

/**
* Models map data in the application/client to data in the database
*/
export class Model
{
	public collection: mongodb.Collection;
	public defaultSchema: Schema;
	private _collectionName: string;
	private _initialized: boolean;
	
	/**
	* Creates an instance of a Model
	* @param {string} collection The collection name associated with this model
	*/
	constructor(collection: string)
	{
		this.collection = null;
		this._collectionName = collection;
		this._initialized = false;
		this.defaultSchema = new Schema();
	}

	/**
	* Gets the name of the collection associated with this model
	* @returns {string}
	*/
	get collectionName():string { return this._collectionName; }

    private createIndex(name: string, collection: mongodb.Collection): Promise<any>
    {
        return new Promise<any>(function (resolve, reject)
        {
            collection.ensureIndex(name, function (err, index: string)
            {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

	/**
	* Initializes the model by setting up the database collections
	* @param {mongodb.Db} db The database used to create this model
	* @returns {Promise<mongodb.Db>}
	*/
	initialize(db: mongodb.Db): Promise<Model>
	{
		var model = this;

		return new Promise<Model>( function(resolve, reject)
		{
			// If the collection already exists - then we do not have to create it
			if (model._initialized)
			{
				resolve(model);
				return;
			}

			// The collection does not exist - so create it
			db.createCollection(model._collectionName, function (err: Error, collection: mongodb.Collection) 
			{
				if (err || !collection)
					return reject(new Error("Error creating collection: " + err.message));
				else
				{
                    model.collection = collection;

                    // First remove all existing indices
                    collection.dropAllIndexes(function(err)
                    {
                        if (err)
                            return reject(err);

                        // Now re-create the models who need index supports
                        var promises: Array<Promise<any>> = [];
                        var items = model.defaultSchema.items;
                        for (var i = 0, l = items.length; i < l; i++)
                            if (items[i].indexable())
                                promises.push(model.createIndex(items[i].name, collection));

                        if (promises.length == 0)
                        {
                            model._initialized = true;
                            winston.info(`Successfully created model '${model.collectionName}'`, { process: process.pid });
                            return resolve(model);
                        }

                        Promise.all(promises).then(function ()
                        {
                            model._initialized = true;
                            return resolve(model);

                        }).catch(function (err)
                        {
                            return reject(err);
                        });

                    });
				}
			});
		});
	}

	/**
	* Updates the models collection based on the search criteria.
	* @param {any} selector The selector for defining which entries to update
	* @param {any} document The object that defines what has to be updated
	* @returns {Promise<number>} A promise with the number of entities affected
	*/
	update(selector: any, document: any): Promise<number>
	{
		var model = this;
		return new Promise<number>(function(resolve, reject)
		{
			var collection = model.collection;
			
			// Attempt to save the data to mongo collection
			collection.update(selector, document, function (err: Error, result: mongodb.WriteResult<any> )
			{
				if (err)
					reject(err);
				else if (result.result.n !== 0)
					resolve(result.result.n);
				else
					resolve(0);
			});
		});
	}
	
    /**
	* Gets the number of DB entries based on the selector
	* @param {any} selector The mongodb selector
	* @returns {Promise<Array<ModelInstance>>}
	*/
    count(selector: any): Promise<number>
    {
        var that = this;
        var model = this;

        return new Promise<number>(function (resolve, reject)
        {
            var collection = model.collection;

            if (!collection || !model._initialized)
                reject(new Error("The model has not been initialized"));
            else
            {
                collection.count(selector, function (err: Error, result: number)
                {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            }
        });
    }

	/**
	* Gets an arrray of instances based on the selector search criteria
	* @param {any} selector The mongodb selector
	* @param {any} sort Specify an array of items to sort. 
    * Each item key represents a field, and its associated number can be either 1 or -1 (asc / desc)
    * @param {number} startIndex The start index of where to select from
	* @param {number} limit The number of results to fetch
    * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
	* @returns {Promise<Array<ModelInstance>>}
	*/
    findInstances(selector: any, sort?: any, startIndex?: number, limit?: number, projection?: any): Promise<Array<ModelInstance>>
	{
		var model = this;
		return new Promise<Array<ModelInstance>>(function (resolve, reject)
		{
			var collection = model.collection;

			if (!collection || !model._initialized)
				reject(new Error("The model has not been initialized"));
			else
			{
				// Attempt to save the data to mongo collection
                collection.find(selector, projection || {}, startIndex, limit, function (err: Error, result: mongodb.Cursor)
				{
					// Check for errors
					if (err || !result)
						reject(err);
					else
                    {
                        var cursor = result;
                        if (sort)
                            cursor = result.sort(sort);

                        result.toArray(function(err: Error, dbEntries: Array<any>)
						{
							// Check for errors
							if (err)
								reject(err);
							else
							{
								// Create the instance array
								var instances: Array<ModelInstance> = [],
									instance: ModelInstance;

								// For each data entry, create a new instance
								for (var i = 0, l = dbEntries.length; i < l; i++)
								{
									instance = new ModelInstance(model);
									instance.schema.deserialize(dbEntries[i]);
									instance._id = dbEntries[i]._id;
									instances.push(instance);
								}

								// Complete
								resolve(instances);
							}
						});
					}
				});
			}
		});
	}
	
	/**
	* Deletes a number of instances based on the selector. The promise reports how many items were deleted
	* @returns {Promise<number>}
	*/
	deleteInstances(selector: any): Promise<number>
	{
		var model = this;

		return new Promise<number>(function (resolve, reject)
		{
			var collection = model.collection;
			collection.remove(selector, function (err: Error, result: mongodb.WriteResult<any> )
			{
				// Report what happened
				if (err)
					reject(err);
				else
					resolve(result.result.n );
			});
		});
    }

    /**
	* Updates an instance by its ID
	* @param {string} id The id of the instance we are updating
    * @param {any} data The data object that will attempt to set the instance's schema variables
	* by parsing the object and setting each schema item's value by the name/value in the data object. 
	* @returns {Promise<ModelInstance>}
	*/
    updateInstance( id : string, data: any): Promise<ModelInstance>
    {
        var that = this;
        
        return new Promise<ModelInstance>(function (resolve, reject)
        {
            that.findInstances({ _id: new mongodb.ObjectID(id) }).then(function (instances)
            {
                if (!instances || instances.length == 0)
                    return reject(new Error("Could not find any posts based on the given selector"));
                
                // If we have data, then set the variables
                if (data)
                {
                    for (var d in data)
                        instances[0].schema.set(d, data[d]);
                }

                // Make sure the new updates are valid
                if (!instances[0].schema.validate())
                {
                    reject(new Error(instances[0].schema.error));
                    return;
                }

                // Transform the schema into a JSON ready format
                var json = instances[0].schema.serialize();
                var collection = that.collection;

                collection.update({ _id: new mongodb.ObjectID(id) }, { $set: json }, function (err: Error, result: mongodb.WriteResult<any>)
                {
                    if (err )
                        reject(err);
                    else
                    {
                        resolve(instances[0]);
                    }
                });

            }).catch(function (err: Error)
            {
                // Report what happened
                reject(err);
            });
        });
    }

    /**
	* Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
	* @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
	* by parsing the data object and setting each schema item's value by the name/value in the data object. 
	* @returns {Promise<boolean>}
	*/
    checkUniqueness(instance: ModelInstance): Promise<boolean>
    {
        var that = this;
        return new Promise<boolean>(function (resolve, reject)
        {
            var items = instance.schema.items;
            var hasUniqueField: boolean = false;
            var searchToken = { $or : [] };
            for (var i = 0, l = items.length; i < l; i++)
            {
                if (items[i].unique())
                {
                    hasUniqueField = true;
                    var searchField = {};
                    searchField[items[i].name] = items[i].getValue();
                    searchToken.$or.push(searchField);
                }
            }

            if (!hasUniqueField)
                return resolve(true);
            else
            {
                that.collection.count(searchToken, function (error: Error, result)
                {
                    if (error)
                        return reject(error);

                    if (result == 0)
                        resolve(true);
                    else
                        resolve(false);
                });
            }
        });
    }

	/**
	* Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
	* @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
	* by parsing the data object and setting each schema item's value by the name/value in the data object. 
	* @returns {Promise<ModelInstance>}
	*/
	createInstance( data? : any ): Promise<ModelInstance>
	{
		var that = this;

		return new Promise<ModelInstance>(function (resolve, reject)
		{
            var newInstance = new ModelInstance(that);
			
			// If we have data, then set the variables
			if (data)
			{
				for (var i in data)
                    newInstance.schema.set(i, data[i]);
            }

            that.checkUniqueness(newInstance).then(function (unique)
            {
                if (!unique)
                {
                    var uniqueNames = "";
                    for (var i = 0, l = newInstance.schema.items.length; i < l; i++)
                        if (newInstance.schema.items[i].unique())
                            uniqueNames += newInstance.schema.items[i].name + ", ";

                    if (uniqueNames != "")
                        uniqueNames = uniqueNames.slice(0, uniqueNames.length - 2);

                    return Promise.reject(new Error(`'${uniqueNames}' must be unique`));
                }

                // Now try to create a new instance
                return that.insert([newInstance]);

            }).then(function (instance: Array<ModelInstance>)
			{
				// All ok
				resolve(instance[0]);

			}).catch(function (err: Error)
			{
				// Report what happened
				reject(err);
			});
		});
	}

	/**
	* Attempts to insert an array of instances of this model into the database. 
	* @param {Promise<Array<ModelInstance>>} instances An array of instances to save
	* @returns {Promise<Array<ModelInstance>>}
	*/
	insert(instances: Array<ModelInstance>): Promise<Array<ModelInstance>>
	{
		var model = this;

		return new Promise<Array<ModelInstance>>(function(resolve, reject)
		{
			var collection = model.collection;

			if (!collection || !model._initialized)
				reject(new Error("The model has not been initialized"));
			else
			{
				var instance: ModelInstance;
				var documents: Array<any> = [];

				for (var i = 0, l = instances.length; i < l; i++)
				{
					instance = instances[i];

					// Get the schema
					var schema = instance.schema;

					// Make sure the parameters are valid
					if (!schema.validate())
					{
						reject(new Error(schema.error));
						return;
					}

					// Transform the schema into a JSON ready format
					var json = schema.serialize();
					documents.push(json);
				}
				
				// Attempt to save the data to mongo collection
				collection.insert(documents, function (err: Error, result: mongodb.WriteResult<any> )
				{
					if (err || !result)
						reject(err);
					else
					{
						// Assign the ID's
						for (var i = 0, l = result.ops.length; i < l; i++)
							instances[i]._id = result.ops[i]._id;
						
						resolve(instances);
					}
				});
			}
		});
	}
}