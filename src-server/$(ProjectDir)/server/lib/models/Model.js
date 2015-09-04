var Schema_1 = require("./Schema");
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
})();
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
        this.defaultSchema = new Schema_1.Schema();
    }
    Object.defineProperty(Model.prototype, "collectionName", {
        /**
        * Gets the name of the collection associated with this model
        * @returns {string}
        */
        get: function () { return this._collectionName; },
        enumerable: true,
        configurable: true
    });
    Model.prototype.createIndex = function (name, collection) {
        return new Promise(function (resolve, reject) {
            collection.ensureIndex(name, function (err, index) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    };
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
                    collection.dropAllIndexes(function (err) {
                        if (err)
                            return reject(err);
                        // Now re-create the models who need index supports
                        var promises = [];
                        var items = model.defaultSchema.items;
                        for (var i = 0, l = items.length; i < l; i++)
                            if (items[i].getIndexable())
                                promises.push(model.createIndex(items[i].name, collection));
                        if (promises.length == 0) {
                            model._initialized = true;
                            winston.info("Successfully created model '" + model._collectionName + "'", { process: process.pid });
                            return resolve(model);
                        }
                        Promise.all(promises).then(function () {
                            model._initialized = true;
                            winston.info("Successfully created model '" + model._collectionName + "'", { process: process.pid });
                            return resolve(model);
                        }).catch(function (err) {
                            return reject(err);
                        });
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
        var model = this;
        return new Promise(function (resolve, reject) {
            var collection = model.collection;
            if (!collection || !model._initialized)
                reject(new Error("The model has not been initialized"));
            else {
                // Attempt to save the data to mongo collection
                collection.find(selector, projection || {}, startIndex, limit, function (err, result) {
                    // Check for errors
                    if (err || !result)
                        reject(err);
                    else {
                        var cursor = result;
                        if (sort)
                            cursor = result.sort(sort);
                        result.toArray(function (err, dbEntries) {
                            // Check for errors
                            if (err)
                                reject(err);
                            else {
                                // Create the instance array
                                var instances = [], instance;
                                // For each data entry, create a new instance
                                for (var i = 0, l = dbEntries.length; i < l; i++) {
                                    instance = new ModelInstance(model, dbEntries[i]);
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
                collection.findOne(selector, projection || {}, function (err, result) {
                    // Check for errors
                    if (err || !result)
                        reject(err);
                    else {
                        // Create the instance array
                        var instance;
                        instance = new ModelInstance(model, result);
                        instance.schema.deserialize(result);
                        instance._id = result._id;
                        // Complete
                        resolve(instance);
                    }
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
            collection.remove(selector, function (err, result) {
                // Report what happened
                if (err)
                    reject(err);
                else
                    resolve(result.result.n);
            });
        });
    };
    /**
    * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
    * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
    * with updating the specific instance.
    * @param {any} selector The selector for updating instances
    * @param {any} data The data object that will attempt to set the instance's schema variables
    * @returns {Promise<Array<ModelInstance<T>>>} An array of objects that contains the field error and instance. Error is false if nothing
    * went wrong when updating the specific instance, and a string message if something did in fact go wrong
    */
    Model.prototype.update = function (selector, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var toRet = [];
            that.findInstances(selector).then(function (instances) {
                if (!instances || instances.length == 0)
                    return resolve(toRet);
                instances.forEach(function (instance, index) {
                    // If we have data, then set the variables
                    if (data)
                        instance.schema.set(data);
                    // Make sure the new updates are valid
                    if (!instance.schema.validate()) {
                        toRet.push({ error: instance.schema.error, instance: instance });
                        return;
                    }
                    // Make sure any unique fields are still being respected
                    that.checkUniqueness(instance).then(function (unique) {
                        if (!unique) {
                            toRet.push({ error: "'" + instance.uniqueFieldNames() + "' must be unique", instance: instance });
                            return;
                        }
                        // Transform the schema into a JSON ready format
                        var json = instance.schema.serialize();
                        var collection = that.collection;
                        collection.update({ _id: instance._id }, { $set: json }, function (err, result) {
                            if (err) {
                                toRet.push({ error: err.message, instance: instance });
                                return;
                            }
                            else {
                                toRet.push({ error: false, instance: instance });
                                if (index == instances.length - 1)
                                    return resolve(toRet);
                                else
                                    return;
                            }
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
            for (var i = 0, l = items.length; i < l; i++) {
                if (items[i].getUnique()) {
                    hasUniqueField = true;
                    var searchField = {};
                    searchField[items[i].name] = items[i].getValue();
                    searchToken.$or.push(searchField);
                }
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
                collection.insert(documents, function (err, result) {
                    if (err || !result)
                        reject(err);
                    else {
                        // Assign the ID's
                        for (var i = 0, l = result.ops.length; i < l; i++)
                            instances[i]._id = result.ops[i]._id;
                        resolve(instances);
                    }
                });
            }
        });
    };
    return Model;
})();
exports.Model = Model;
