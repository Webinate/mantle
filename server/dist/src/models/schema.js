"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const schema_item_1 = require("./schema-items/schema-item");
/**
* Gives an overall description of each property in a model
*/
class Schema {
    constructor() {
        this._items = [];
    }
    /**
    * Creates a copy of the schema
    * @returns {Schema}
    */
    clone() {
        var items = this._items;
        var copy = new Schema();
        for (var i = 0, l = items.length; i < l; i++)
            copy._items.push(items[i].clone());
        return copy;
    }
    /**
    * Sets a schema value by name
    * @param {any} data The data object we are setting
    */
    set(data) {
        var items = this._items, l = items.length;
        for (var i in data) {
            for (var ii = 0; ii < l; ii++)
                if (items[ii].name == i)
                    items[ii].setValue(data[i]);
        }
    }
    /**
    * Sets a schema value by name
    * @param {string} name The name of the schema item
    * @param {any} val The new value of the item
    */
    setVal(name, val) {
        var items = this._items;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == name)
                items[i].setValue(val);
    }
    /**
    * De-serializes the schema items from the mongodb data entry.
    * I.e. the data is the document from the DB and the schema item sets its values from the document
    * @param {any} data
    */
    deserialize(data) {
        for (var i in data)
            this.setVal(i, data[i]);
    }
    /**
    * Serializes the schema items into the JSON format for mongodb
    * @returns {any}
    */
    serialize() {
        var toReturn = {};
        var items = this._items;
        for (var i = 0, l = items.length; i < l; i++)
            toReturn[items[i].name] = items[i].getDbValue();
        return toReturn;
    }
    /**
    * Serializes the schema items into a JSON
    * @param {ObjectID} id The models dont store the _id property directly, and so this has to be passed for serialization
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<T>}
    */
    getAsJson(id, options) {
        return __awaiter(this, void 0, Promise, function* () {
            var toReturn = { _id: id };
            var items = this._items;
            var fKey;
            var model;
            var promises = [];
            for (var i = 0, l = items.length; i < l; i++) {
                // If this data is sensitive and the request must be sanitized
                // then skip the item
                if (items[i].getSensitive() && options.verbose == false)
                    continue;
                promises.push(items[i].getValue(options));
            }
            // Wait for all the promises to resolve
            var returns = yield Promise.all(promises);
            // Assign the promise values
            for (var i = 0, l = returns.length; i < l; i++)
                toReturn[items[i].name] = returns[i];
            return Promise.resolve(toReturn);
        });
    }
    /**
    * Checks the values stored in the items to see if they are correct
    * @param {boolean} checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
    * @returns {Promise<Schema>} Returns true if successful
    */
    validate(checkForRequiredFields) {
        return __awaiter(this, void 0, Promise, function* () {
            var items = this._items;
            var promises = [];
            for (var i = 0, l = items.length; i < l; i++) {
                if (checkForRequiredFields && !items[i].getModified() && items[i].getRequired())
                    throw new Error(`${items[i].name} is required`);
                promises.push(items[i].validate());
            }
            var validations = yield Promise.all(promises);
            return this;
        });
    }
    /**
     * Called once a schema has been validated and inserted into the database. Useful for
     * doing any post update/insert operations
     * @param {ModelInstance<T>} instance The model instance that was inserted or updated
     * @param {string} collection The DB collection that the model was inserted into
     */
    postValidation(instance, collection) {
        return __awaiter(this, void 0, Promise, function* () {
            var items = this._items;
            var promises = [];
            for (var i = 0, l = items.length; i < l; i++)
                promises.push(items[i].postValidation(instance, collection));
            var validations = yield Promise.all(promises);
            return this;
        });
    }
    /**
    * Gets a schema item from this schema by name
    * @param {string} val The name of the item
    * @param {SchemaItem}
    */
    getByName(val) {
        var items = this._items;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == val)
                return items[i];
        return null;
    }
    /**
    * Adds a schema item to this schema
    * @param {SchemaItem} val The new item to add
    * @returns {SchemaItem}
    */
    add(val) {
        if (val.name == "_id")
            throw new Error(`You cannot use the schema item name _id as its a reserved keyword`);
        else if (val.name == "_requiredDependencies")
            throw new Error(`You cannot use the schema item name _requiredDependencies as its a reserved keyword`);
        else if (val.name == "_optionalDependencies")
            throw new Error(`You cannot use the schema item name _optionalDependencies as its a reserved keyword`);
        else if (this.getByName(val.name))
            throw new Error(`An item with the name ${val.name} already exists.`);
        this._items.push(val);
        return val;
    }
    /**
    * Removes a schema item from this schema
    * @param {SchemaItem|string} val The name of the item or the item itself
    */
    remove(val) {
        var items = this._items;
        var name = "";
        if (val instanceof schema_item_1.SchemaItem)
            name = val.name;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == name) {
                items.splice(i, 1);
                return;
            }
    }
    /**
     * Gets the schema items associated with this schema
     * @returns {Array<SchemaItem<any>>}
     */
    getItems() {
        return this._items;
    }
}
exports.Schema = Schema;
