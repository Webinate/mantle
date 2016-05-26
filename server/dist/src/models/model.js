"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const schema_1 = require("./schema");
const winston = require("winston");
/**
* An instance of a model with its own unique schema and ID. The initial schema is a clone
* the parent model's
*/
class ModelInstance {
    /**
    * Creates a model instance
    */
    constructor(model, dbEntry) {
        this.model = model;
        this.schema = model.defaultSchema.clone();
        this._id = null;
        this.dbEntry = dbEntry;
    }
    /**
    * Gets a string representation of all fields that are unique
    * @returns {string}
    */
    uniqueFieldNames() {
        var instance = this;
        var uniqueNames = "";
        var items = instance.schema.getItems();
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].getUnique())
                uniqueNames += items[i].name + ", ";
        if (uniqueNames != "")
            uniqueNames = uniqueNames.slice(0, uniqueNames.length - 2);
        return uniqueNames;
    }
}
exports.ModelInstance = ModelInstance;
/**
* Models map data in the application/client to data in the database
*/
class Model {
    /**
    * Creates an instance of a Model
    * @param {string} collection The collection name associated with this model
    */
    constructor(collection) {
        this.collection = null;
        this._collectionName = collection;
        this._initialized = false;
        this.defaultSchema = new schema_1.Schema();
        if (Model._registeredModels[collection])
            throw new Error(`You cannot create model '${collection}' as its already been registered`);
        // Register the model
        Model._registeredModels[collection] = this;
    }
    /**
     * Returns a new model of a given type. However if the model was already registered before,
     * then the previously created model is returned.
     * @param {any} modelConstructor The model class
     * @returns {Model} Returns the registered model
     */
    static registerModel(modelConstructor) {
        var models = Model._registeredModels;
        for (var i in models)
            if (modelConstructor == models[i].constructor)
                return models[i];
        return new modelConstructor();
    }
    /**
     * Returns a registered model by its name
     * @param {string} name The name of the model to fetch
     * @returns {Model} Returns the registered model or null if none exists
     */
    static getByName(name) {
        return Model._registeredModels[name];
    }
    /**
     * Creates an index for a collection
     * @param {string} name The name of the field we are setting an index of
     * @param {mongodb.Collection} collection The collection we are setting the index on
     */
    createIndex(name, collection) {
        return __awaiter(this, void 0, Promise, function* () {
            var index = yield collection.createIndex(name);
            return index;
        });
    }
    /**
    * Gets the name of the collection associated with this model
    * @returns {string}
    */
    get collectionName() { return this._collectionName; }
    /**
    * Initializes the model by setting up the database collections
    * @param {mongodb.Db} db The database used to create this model
    * @returns {Promise<mongodb.Db>}
    */
    initialize(db) {
        return __awaiter(this, void 0, Promise, function* () {
            // If the collection already exists - then we do not have to create it
            if (this._initialized)
                return this;
            // The collection does not exist - so create it
            this.collection = yield db.createCollection(this._collectionName);
            if (!this.collection)
                throw new Error("Error creating collection: " + this._collectionName);
            // First remove all existing indices
            var response = yield this.collection.dropIndexes();
            // Now re-create the models who need index supports
            var promises = [];
            var items = this.defaultSchema.getItems();
            for (var i = 0, l = items.length; i < l; i++)
                if (items[i].getIndexable())
                    promises.push(this.createIndex(items[i].name, this.collection));
            if (promises.length == 0)
                this._initialized = true;
            var models = yield Promise.all(promises);
            this._initialized = true;
            winston.info(`Successfully created model '${this._collectionName}'`, { process: process.pid });
            return this;
        });
    }
    /**
    * Gets the number of DB entries based on the selector
    * @param {any} selector The mongodb selector
    * @returns {Promise<Array<ModelInstance<T>>>}
    */
    count(selector) {
        return __awaiter(this, void 0, Promise, function* () {
            var collection = this.collection;
            if (!collection || !this._initialized)
                throw new Error("The model has not been initialized");
            return yield collection.count(selector);
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
    * @returns {Promise<Array<ModelInstance<T>>>}
    */
    findInstances(selector, sort, startIndex = 0, limit = 0, projection) {
        return __awaiter(this, void 0, Promise, function* () {
            var collection = this.collection;
            if (!collection || !this._initialized)
                throw new Error("The model has not been initialized");
            // Attempt to save the data to mongo collection
            var result = yield collection.find(selector).limit(limit).skip(startIndex).project(projection || {}).sort(sort).toArray();
            // Create the instance array
            var instances = [], instance;
            // For each data entry, create a new instance
            for (var i = 0, l = result.length; i < l; i++) {
                instance = new ModelInstance(this, result[i]);
                instance.schema.deserialize(result[i]);
                instance._id = result[i]._id;
                instances.push(instance);
            }
            // Complete
            return instances;
        });
    }
    /**
    * Gets a model instance based on the selector criteria
    * @param {any} selector The mongodb selector
    * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
    * @returns {Promise<ModelInstance<T>>}
    */
    findOne(selector, projection) {
        return __awaiter(this, void 0, Promise, function* () {
            var collection = this.collection;
            if (!collection || !this._initialized)
                throw new Error("The model has not been initialized");
            // Attempt to save the data to mongo collection
            var result = yield collection.find(selector).limit(1).project(projection || {}).next();
            // Check for errors
            if (!result)
                return null;
            else {
                // Create the instance array
                var instance;
                instance = new ModelInstance(this, result);
                instance.schema.deserialize(result);
                instance._id = result._id;
                // Complete
                return instance;
            }
        });
    }
    /**
    * Deletes a instance and all its dependencies are updated or deleted accordingly
    * @returns {Promise<number>}
    */
    deleteInstance(instance) {
        return __awaiter(this, void 0, Promise, function* () {
            var foreignModel;
            var optionalDependencies = instance.dbEntry._optionalDependencies;
            var requiredDependencies = instance.dbEntry._requiredDependencies;
            var arrayDependencies = instance.dbEntry._arrayDependencies;
            var promises = [];
            // Nullify all dependencies that are optional
            if (optionalDependencies)
                for (var i = 0, l = optionalDependencies.length; i < l; i++) {
                    foreignModel = Model.getByName(optionalDependencies[i].collection);
                    if (!foreignModel)
                        continue;
                    let setToken = { $set: {} };
                    setToken.$set[optionalDependencies[i].propertyName] = null;
                    promises.push(foreignModel.collection.updateOne({ _id: optionalDependencies[i]._id }, setToken));
                }
            // Remove any dependencies that are in arrays
            if (arrayDependencies)
                for (var i = 0, l = arrayDependencies.length; i < l; i++) {
                    foreignModel = Model.getByName(arrayDependencies[i].collection);
                    if (!foreignModel)
                        continue;
                    let pullToken = { $pull: {} };
                    pullToken.$pull[arrayDependencies[i].propertyName] = instance._id;
                    promises.push(foreignModel.collection.updateMany({ _id: arrayDependencies[i]._id }, pullToken));
                }
            // For those dependencies that are required, we delete the instances
            if (requiredDependencies)
                for (var i = 0, l = requiredDependencies.length; i < l; i++) {
                    foreignModel = Model.getByName(requiredDependencies[i].collection);
                    if (!foreignModel)
                        continue;
                    promises.push(foreignModel.deleteInstances({ _id: requiredDependencies[i]._id }));
                }
            var dependenciesResults = yield Promise.all(promises);
            // Remove the original instance from the DB
            var deleteResult = yield this.collection.deleteMany({ _id: instance.dbEntry._id });
            return deleteResult.deletedCount;
        });
    }
    /**
    * Deletes a number of instances based on the selector. The promise reports how many items were deleted
    * @returns {Promise<number>}
    */
    deleteInstances(selector) {
        return __awaiter(this, void 0, Promise, function* () {
            var model = this;
            var instances = yield this.findInstances(selector);
            if (!instances || instances.length == 0)
                return 0;
            var promises = [];
            for (var i = 0, l = instances.length; i < l; i++) {
                promises.push(this.deleteInstance(instances[i]));
            }
            ;
            yield Promise.all(promises);
        });
    }
    /**
    * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
    * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
    * with updating the specific instance.
    * @param {any} selector The selector for updating instances
    * @param {any} data The data object that will attempt to set the instance's schema variables
    * @returns {Promise<UpdateRequest<T>>} An array of objects that contains the field error and instance. Error is false if nothing
    * went wrong when updating the specific instance, and a string message if something did in fact go wrong
    */
    update(selector, data) {
        return __awaiter(this, void 0, Promise, function* () {
            var toRet = {
                error: false,
                tokens: []
            };
            var instances = yield this.findInstances(selector);
            if (!instances || instances.length == 0)
                return toRet;
            for (var i = 0, l = instances.length; i < l; i++) {
                var instance = instances[i];
                // If we have data, then set the variables
                if (data)
                    instance.schema.set(data);
                try {
                    // Make sure the new updates are valid
                    yield instance.schema.validate(false);
                    // Make sure any unique fields are still being respected
                    var unique = yield this.checkUniqueness(instance);
                    if (!unique) {
                        toRet.error = true;
                        toRet.tokens.push({ error: `'${instance.uniqueFieldNames()}' must be unique`, instance: instance });
                        continue;
                    }
                    // Transform the schema into a JSON ready format
                    var json = instance.schema.serialize();
                    var collection = this.collection;
                    var updateResult = yield collection.updateOne({ _id: instance._id }, { $set: json });
                    // Now that everything has been added, we can do some post insert/update validation
                    yield instance.schema.postValidation(instance, this._collectionName);
                    toRet.tokens.push({ error: false, instance: instance });
                }
                catch (err) {
                    toRet.error = true;
                    toRet.tokens.push({ error: err.message, instance: instance });
                }
                ;
            }
            ;
            return toRet;
        });
    }
    /**
    * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
    * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
    * by parsing the data object and setting each schema item's value by the name/value in the data object.
    * @returns {Promise<boolean>}
    */
    checkUniqueness(instance) {
        return __awaiter(this, void 0, Promise, function* () {
            var items = instance.schema.getItems();
            var hasUniqueField = false;
            var searchToken = { $or: [] };
            if (instance._id)
                searchToken["_id"] = { $ne: instance._id };
            for (var i = 0, l = items.length; i < l; i++) {
                if (items[i].getUnique()) {
                    hasUniqueField = true;
                    var searchField = {};
                    searchField[items[i].name] = items[i].getDbValue();
                    searchToken.$or.push(searchField);
                }
                else if (items[i].getUniqueIndexer())
                    searchToken[items[i].name] = items[i].getDbValue();
            }
            if (!hasUniqueField)
                return true;
            else {
                var result = yield this.collection.count(searchToken);
                if (result == 0)
                    return true;
                else
                    return false;
            }
        });
    }
    /**
    * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
    * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
    * by parsing the data object and setting each schema item's value by the name/value in the data object.
    * @returns {Promise<ModelInstance<T>>}
    */
    createInstance(data) {
        return __awaiter(this, void 0, Promise, function* () {
            var newInstance = new ModelInstance(this, null);
            // If we have data, then set the variables
            if (data)
                newInstance.schema.set(data);
            var unique = yield this.checkUniqueness(newInstance);
            if (!unique)
                throw new Error(`'${newInstance.uniqueFieldNames()}' must be unique`);
            // Now try to create a new instance
            var instance = yield this.insert([newInstance]);
            // All ok
            return instance[0];
        });
    }
    /**
    * Attempts to insert an array of instances of this model into the database.
    * @param {Promise<Array<ModelInstance<T>>>} instances An array of instances to save
    * @returns {Promise<Array<ModelInstance<T>>>}
    */
    insert(instances) {
        return __awaiter(this, void 0, Promise, function* () {
            var model = this;
            var collection = model.collection;
            if (!collection || !model._initialized)
                throw new Error("The model has not been initialized");
            var instance;
            var documents = [];
            var promises = [];
            // Make sure the parameters are valid
            for (var i = 0, l = instances.length; i < l; i++)
                promises.push(instances[i].schema.validate(true));
            var schemas = yield Promise.all(promises);
            // Transform the schema into a JSON ready format
            for (var i = 0, l = schemas.length; i < l; i++) {
                var json = schemas[i].serialize();
                documents.push(json);
            }
            // Attempt to save the data to mongo collection
            var insertResult = yield collection.insertMany(documents);
            // Assign the ID's
            for (var i = 0, l = insertResult.ops.length; i < l; i++) {
                instances[i]._id = insertResult.ops[i]._id;
                instances[i].dbEntry = insertResult.ops[i];
            }
            // Now that everything has been added, we can do some post insert/update validation
            var postValidationPromises = [];
            for (var i = 0, l = instances.length; i < l; i++)
                postValidationPromises.push(instances[i].schema.postValidation(instances[i], this._collectionName));
            yield Promise.all(postValidationPromises);
            return instances;
        });
    }
}
Model._registeredModels = {};
exports.Model = Model;
