"use strict";
var schema_1 = require("./schema");
var winston = require("winston");
/**
* An instance of a model with its own unique schema and ID. The initial schema is a clone
* the parent model's
*/
var ModelInstance = (function () {
    /**
    * Creates a model instance
    */
    function ModelInstance(model, dbEntry) {
        this.model = model;
        this.schema = model.defaultSchema.clone();
        this._id = null;
        this.dbEntry = dbEntry;
    }
    /**
    * Gets a string representation of all fields that are unique
    * @returns {string}
    */
    ModelInstance.prototype.uniqueFieldNames = function () {
        var instance = this;
        var uniqueNames = "";
        for (var i = 0, l = instance.schema.items.length; i < l; i++)
            if (instance.schema.items[i].getUnique())
                uniqueNames += instance.schema.items[i].name + ", ";
        if (uniqueNames != "")
            uniqueNames = uniqueNames.slice(0, uniqueNames.length - 2);
        return uniqueNames;
    };
    return ModelInstance;
}());
exports.ModelInstance = ModelInstance;
/**
* Models map data in the application/client to data in the database
*/
var Model = (function () {
    /**
    * Creates an instance of a Model
    * @param {string} collection The collection name associated with this model
    */
    function Model(collection) {
        this.collection = null;
        this._collectionName = collection;
        this._initialized = false;
        this.defaultSchema = new schema_1.Schema();
    }
    /**
     * Creates an index for a collection
     * @param {string} name The name of the field we are setting an index of
     * @param {mongodb.Collection} collection The collection we are setting the index on
     */
    Model.prototype.createIndex = function (name, collection) {
        return new Promise(function (resolve, reject) {
            collection.createIndex(name, function (err, index) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    };
    Object.defineProperty(Model.prototype, "collectionName", {
        /**
        * Gets the name of the collection associated with this model
        * @returns {string}
        */
        get: function () { return this._collectionName; },
        enumerable: true,
        configurable: true
    });
    /**
    * Initializes the model by setting up the database collections
    * @param {mongodb.Db} db The database used to create this model
    * @returns {Promise<mongodb.Db>}
    */
    Model.prototype.initialize = function (db) {
        var model = this;
        return new Promise(function (resolve, reject) {
            // If the collection already exists - then we do not have to create it
            if (model._initialized) {
                resolve(model);
                return;
            }
            // The collection does not exist - so create it
            db.createCollection(model._collectionName, function (err, collection) {
                if (err || !collection)
                    return reject(new Error("Error creating collection: " + err.message));
                else {
                    model.collection = collection;
                    // First remove all existing indices
                    collection.dropIndexes().then(function (response) {
                        // Now re-create the models who need index supports
                        var promises = [];
                        var items = model.defaultSchema.items;
                        for (var i = 0, l = items.length; i < l; i++)
                            if (items[i].getIndexable())
                                promises.push(model.createIndex(items[i].name, collection));
                        if (promises.length == 0) {
                            model._initialized = true;
                            return Promise.resolve();
                        }
                        return Promise.all(promises);
                    }).then(function (models) {
                        model._initialized = true;
                        winston.info("Successfully created model '" + model._collectionName + "'", { process: process.pid });
                        return resolve(model);
                    }).catch(function (err) {
                        return reject(err);
                    });
                }
            });
        });
    };
    ///**
    //* Updates the models collection based on the search criteria.
    //* @param {any} selector The selector for defining which entries to update
    //* @param {any} document The object that defines what has to be updated
    //* @returns {Promise<number>} A promise with the number of entities affected
    //*/
    //update(selector: any, document: any): Promise<number>
    //{
    //	var model = this;
    //	return new Promise<number>(function(resolve, reject)
    //	{
    //		var collection = model.collection;
    //		// Attempt to save the data to mongo collection
    //		collection.update(selector, document, function (err: Error, result: mongodb.WriteResult<any> )
    //		{
    //			if (err)
    //				reject(err);
    //			else if (result.result.n !== 0)
    //				resolve(result.result.n);
    //			else
    //				resolve(0);
    //		});
    //	});
    //}
    /**
    * Gets the number of DB entries based on the selector
    * @param {any} selector The mongodb selector
    * @returns {Promise<Array<ModelInstance<T>>>}
    */
    Model.prototype.count = function (selector) {
        var that = this;
        var model = this;
        return new Promise(function (resolve, reject) {
            var collection = model.collection;
            if (!collection || !model._initialized)
                reject(new Error("The model has not been initialized"));
            else {
                collection.count(selector, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            }
        });
    };
    /**
    * Gets an arrray of instances based on the selector search criteria
    * @param {any} selector The mongodb selector
    * @param {any} sort Specify an array of items to sort.
    * Each item key represents a field, and its associated number can be either 1 or -1 (asc / desc)
    * @param {number} startIndex The start index of where to select from
    * @param {number} limit The number of results to fetch
    * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
    * @returns {Promise<Array<ModelInstance<T>>>}
    */
    Model.prototype.findInstances = function (selector, sort, startIndex, limit, projection) {
        if (startIndex === void 0) { startIndex = -1; }
        if (limit === void 0) { limit = -1; }
        var model = this;
        return new Promise(function (resolve, reject) {
            var collection = model.collection;
            if (!collection || !model._initialized)
                reject(new Error("The model has not been initialized"));
            else {
                // Attempt to save the data to mongo collection
                collection.find(selector).limit(limit).skip(startIndex).project(projection || {}).sort(sort).toArray().then(function (result) {
                    // Create the instance array
                    var instances = [], instance;
                    // For each data entry, create a new instance
                    for (var i = 0, l = result.length; i < l; i++) {
                        instance = new ModelInstance(model, result[i]);
                        instance.schema.deserialize(result[i]);
                        instance._id = result[i]._id;
                        instances.push(instance);
                    }
                    // Complete
                    resolve(instances);
                }).catch(function (err) {
                    reject(err);
                });
            }
        });
    };
    /**
    * Gets a model instance based on the selector criteria
    * @param {any} selector The mongodb selector
    * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
    * @returns {Promise<ModelInstance<T>>}
    */
    Model.prototype.findOne = function (selector, projection) {
        var model = this;
        return new Promise(function (resolve, reject) {
            var collection = model.collection;
            if (!collection || !model._initialized)
                reject(new Error("The model has not been initialized"));
            else {
                // Attempt to save the data to mongo collection
                collection.find(selector).limit(1).project(projection || {}).next().then(function (result) {
                    // Check for errors
                    if (!result)
                        return resolve(null);
                    else {
                        // Create the instance array
                        var instance;
                        instance = new ModelInstance(model, result);
                        instance.schema.deserialize(result);
                        instance._id = result._id;
                        // Complete
                        return resolve(instance);
                    }
                }).catch(function (err) {
                    reject(err);
                });
            }
        });
    };
    /**
    * Deletes a number of instances based on the selector. The promise reports how many items were deleted
    * @returns {Promise<number>}
    */
    Model.prototype.deleteInstances = function (selector) {
        var model = this;
        return new Promise(function (resolve, reject) {
            var collection = model.collection;
            collection.deleteMany(selector).then(function (deleteResult) {
                resolve(deleteResult.deletedCount);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    /**
    * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
    * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
    * with updating the specific instance.
    * @param {any} selector The selector for updating instances
    * @param {any} data The data object that will attempt to set the instance's schema variables
    * @returns {Promise<UpdateRequest<T>>} An array of objects that contains the field error and instance. Error is false if nothing
    * went wrong when updating the specific instance, and a string message if something did in fact go wrong
    */
    Model.prototype.update = function (selector, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var toRet = {
                error: false,
                tokens: []
            };
            that.findInstances(selector).then(function (instances) {
                if (!instances || instances.length == 0)
                    return resolve(toRet);
                instances.forEach(function (instance, index) {
                    // If we have data, then set the variables
                    if (data)
                        instance.schema.set(data);
                    // Make sure the new updates are valid
                    if (!instance.schema.validate()) {
                        if (instance.schema.error)
                            toRet.error = true;
                        toRet.tokens.push({ error: instance.schema.error, instance: instance });
                        if (index == instances.length - 1)
                            return resolve(toRet);
                        else
                            return;
                    }
                    // Make sure any unique fields are still being respected
                    that.checkUniqueness(instance).then(function (unique) {
                        if (!unique) {
                            toRet.error = true;
                            toRet.tokens.push({ error: "'" + instance.uniqueFieldNames() + "' must be unique", instance: instance });
                            if (index == instances.length - 1)
                                return resolve(toRet);
                            else
                                return;
                        }
                        // Transform the schema into a JSON ready format
                        var json = instance.schema.serialize();
                        var collection = that.collection;
                        collection.updateOne({ _id: instance._id }, { $set: json }).then(function (updateResult) {
                            toRet.tokens.push({ error: false, instance: instance });
                            if (index == instances.length - 1)
                                return resolve(toRet);
                            else
                                return;
                        }).catch(function (err) {
                            toRet.error = true;
                            toRet.tokens.push({ error: err.message, instance: instance });
                            if (index == instances.length - 1)
                                return resolve(toRet);
                            else
                                return;
                        });
                    });
                });
            }).catch(function (err) {
                // Report what happened
                reject(err);
            });
        });
    };
    /**
    * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
    * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
    * by parsing the data object and setting each schema item's value by the name/value in the data object.
    * @returns {Promise<boolean>}
    */
    Model.prototype.checkUniqueness = function (instance) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var items = instance.schema.items;
            var hasUniqueField = false;
            var searchToken = { $or: [] };
            if (instance._id)
                searchToken["_id"] = { $ne: instance._id };
            for (var i = 0, l = items.length; i < l; i++) {
                if (items[i].getUnique()) {
                    hasUniqueField = true;
                    var searchField = {};
                    searchField[items[i].name] = items[i].getValue();
                    searchToken.$or.push(searchField);
                }
                else if (items[i].getUniqueIndexer())
                    searchToken[items[i].name] = items[i].getValue();
            }
            if (!hasUniqueField)
                return resolve(true);
            else {
                that.collection.count(searchToken, function (error, result) {
                    if (error)
                        return reject(error);
                    if (result == 0)
                        resolve(true);
                    else
                        resolve(false);
                });
            }
        });
    };
    /**
    * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
    * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
    * by parsing the data object and setting each schema item's value by the name/value in the data object.
    * @returns {Promise<ModelInstance<T>>}
    */
    Model.prototype.createInstance = function (data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var newInstance = new ModelInstance(that, null);
            // If we have data, then set the variables
            if (data)
                newInstance.schema.set(data);
            that.checkUniqueness(newInstance).then(function (unique) {
                if (!unique)
                    return Promise.reject(new Error("'" + newInstance.uniqueFieldNames() + "' must be unique"));
                // Now try to create a new instance
                return that.insert([newInstance]);
            }).then(function (instance) {
                // All ok
                resolve(instance[0]);
            }).catch(function (err) {
                // Report what happened
                reject(err);
            });
        });
    };
    /**
    * Attempts to insert an array of instances of this model into the database.
    * @param {Promise<Array<ModelInstance<T>>>} instances An array of instances to save
    * @returns {Promise<Array<ModelInstance<T>>>}
    */
    Model.prototype.insert = function (instances) {
        var model = this;
        return new Promise(function (resolve, reject) {
            var collection = model.collection;
            if (!collection || !model._initialized)
                reject(new Error("The model has not been initialized"));
            else {
                var instance;
                var documents = [];
                for (var i = 0, l = instances.length; i < l; i++) {
                    instance = instances[i];
                    // Get the schema
                    var schema = instance.schema;
                    // Make sure the parameters are valid
                    if (!schema.validate()) {
                        reject(new Error(schema.error));
                        return;
                    }
                    // Transform the schema into a JSON ready format
                    var json = schema.serialize();
                    documents.push(json);
                }
                // Attempt to save the data to mongo collection
                collection.insertMany(documents).then(function (insertResult) {
                    // Assign the ID's
                    for (var i = 0, l = insertResult.ops.length; i < l; i++)
                        instances[i]._id = insertResult.ops[i]._id;
                    resolve(instances);
                }).catch(function (err) {
                    reject(err);
                });
            }
        });
    };
    return Model;
}());
exports.Model = Model;
