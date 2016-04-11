"use strict";
var schema_item_1 = require("./schema-items/schema-item");
/**
* Gives an overall description of each property in a model
*/
var Schema = (function () {
    function Schema() {
        this.items = [];
        this.error = "";
    }
    /**
    * Creates a copy of the schema
    * @returns {Schema}
    */
    Schema.prototype.clone = function () {
        var items = this.items;
        var copy = new Schema();
        for (var i = 0, l = items.length; i < l; i++)
            copy.items.push(items[i].clone());
        return copy;
    };
    /**
    * Sets a schema value by name
    * @param {any} data The data object we are setting
    */
    Schema.prototype.set = function (data) {
        var items = this.items, l = items.length;
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
        var items = this.items;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == name)
                items[i].setValue(val);
    };
    /**
    * De-serializes the schema items from the mongodb data entry
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
        var items = this.items;
        for (var i = 0, l = items.length; i < l; i++)
            toReturn[items[i].name] = items[i].getValue();
        return toReturn;
    };
    /**
    * Serializes the schema items into the JSON format for mongodb
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {any}
    */
    Schema.prototype.generateCleanData = function (sanitize, id) {
        var toReturn = {};
        var items = this.items;
        for (var i = 0, l = items.length; i < l; i++)
            toReturn[items[i].name] = items[i].getValue(sanitize);
        if (sanitize)
            toReturn._id = null;
        else
            toReturn._id = id;
        return toReturn;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @param {boolean} checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
    * @returns {boolean} Returns true if successful
    */
    Schema.prototype.validate = function (checkForRequiredFields) {
        var items = this.items;
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
        var items = this.items;
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
        if (this.getByName(val.name))
            throw new Error("An item with the name " + val.name + " already exists.");
        this.items.push(val);
        return val;
    };
    /**
    * Removes a schema item from this schema
    * @param {SchemaItem|string} val The name of the item or the item itself
    */
    Schema.prototype.remove = function (val) {
        var items = this.items;
        var name = "";
        if (val instanceof schema_item_1.SchemaItem)
            name = val.name;
        for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == name) {
                items.splice(i, 1);
                return;
            }
    };
    return Schema;
}());
exports.Schema = Schema;
