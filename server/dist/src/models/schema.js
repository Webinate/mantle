"use strict";
var schema_item_1 = require("./schema-items/schema-item");
/**
* Gives an overall description of each property in a model
*/
var Schema = (function () {
    function Schema() {
        this._items = [];
        this.error = "";
    }
    /**
    * Creates a copy of the schema
    * @returns {Schema}
    */
    Schema.prototype.clone = function () {
        var items = this._items;
        var copy = new Schema();
        for (var i = 0, l = items.length; i < l; i++)
            copy._items.push(items[i].clone());
        return copy;
    };
    /**
    * Sets a schema value by name
    * @param {any} data The data object we are setting
    */
    Schema.prototype.set = function (data) {
        var items = this._items, l = items.length;
        for (var i in data) {
            for (var ii = 0; ii < l; ii++)
                if (items[ii].name == i)
                    items[ii].setValue(data[i]);
        }
    };
    /**
    * Sets a schema value by name
    * @param {string} name The name of the schema item
    * @param {any} val The new value of the item
    */
    Schema.prototype.setVal = function (name, val) {
        var items = this._items;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == name)
                items[i].setValue(val);
    };
    /**
    * De-serializes the schema items from the mongodb data entry.
    * I.e. the data is the document from the DB and the schema item sets its values from the document
    * @param {any} data
    */
    Schema.prototype.deserialize = function (data) {
        for (var i in data)
            this.setVal(i, data[i]);
    };
    /**
    * Serializes the schema items into the JSON format for mongodb
    * @returns {any}
    */
    Schema.prototype.serialize = function () {
        var toReturn = {};
        var items = this._items;
        for (var i = 0, l = items.length; i < l; i++)
            toReturn[items[i].name] = items[i].getValue();
        return toReturn;
    };
    /**
    * Serializes the schema items into a JSON
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @param {ObjectID} id The models dont store the _id property directly, and so this has to be passed for serialization
    * @returns {Promise<T>}
    */
    Schema.prototype.getAsJson = function (sanitize, id) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var toReturn = {};
            var items = that._items;
            var fKey;
            var model;
            var promises = [];
            var promiseOrder = [];
            toReturn._id = id;
            for (var i = 0, l = items.length; i < l; i++) {
                // If this data is sensitive and the request must be sanitized
                // then skip the item
                if (items[i].getSensitive() && sanitize)
                    continue;
                var itemValue = items[i].getValue();
                // If its a promise - then add the promise to the promise array
                if (itemValue instanceof Promise) {
                    promises.push(itemValue);
                    // Keep track of the item name in an array so we can fetch it later
                    promiseOrder.push(items[i].name);
                }
                else
                    toReturn[items[i].name] = itemValue;
            }
            // Wait for all the promises to resolve
            Promise.all(promises).then(function (returns) {
                // Assign the promise values
                for (var i = 0, l = returns.length; i < l; l++)
                    toReturn[promiseOrder[i]] = returns[i];
                resolve(toReturn);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @param {boolean} checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
    * @returns {boolean} Returns true if successful
    */
    Schema.prototype.validate = function (checkForRequiredFields) {
        var items = this._items;
        this.error = "";
        for (var i = 0, l = items.length; i < l; i++) {
            if (checkForRequiredFields && !items[i].getModified() && items[i].getRequired()) {
                this.error = items[i].name + " is required";
                return false;
            }
            var validated = items[i].validate();
            if (validated !== true) {
                this.error = validated;
                return false;
            }
        }
        return true;
    };
    /**
    * Gets a schema item from this schema by name
    * @param {string} val The name of the item
    * @param {SchemaItem}
    */
    Schema.prototype.getByName = function (val) {
        var items = this._items;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == val)
                return items[i];
        return null;
    };
    /**
    * Adds a schema item to this schema
    * @param {SchemaItem} val The new item to add
    * @returns {SchemaItem}
    */
    Schema.prototype.add = function (val) {
        if (val.name == "_id")
            throw new Error("You cannot use the schema item name _id as its a reserved keyword");
        else if (val.name == "_requiredDependencies")
            throw new Error("You cannot use the schema item name _requiredDependencies as its a reserved keyword");
        else if (val.name == "_optionalDependencies")
            throw new Error("You cannot use the schema item name _optionalDependencies as its a reserved keyword");
        else if (this.getByName(val.name))
            throw new Error("An item with the name " + val.name + " already exists.");
        this._items.push(val);
        return val;
    };
    /**
    * Removes a schema item from this schema
    * @param {SchemaItem|string} val The name of the item or the item itself
    */
    Schema.prototype.remove = function (val) {
        var items = this._items;
        var name = "";
        if (val instanceof schema_item_1.SchemaItem)
            name = val.name;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == name) {
                items.splice(i, 1);
                return;
            }
    };
    /**
     * Gets the schema items associated with this schema
     * @returns {Array<SchemaItem<any>>}
     */
    Schema.prototype.getItems = function () {
        return this._items;
    };
    return Schema;
}());
exports.Schema = Schema;
