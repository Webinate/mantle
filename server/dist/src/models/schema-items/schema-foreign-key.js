"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schema_item_1 = require("./schema-item");
var Model_1 = require("../Model");
var mongodb_1 = require("mongodb");
var utils_1 = require("../../utils");
/**
 * Represents a mongodb ObjectID of a document in separate collection.
 * Foreign keys are used as a way of relating models to one another. They can be required or optional.
 * Required keys will mean that the current document cannot exist if the target does not. Optional keys
 * will simply be nullified if the target no longer exists.
 */
var SchemaForeignKey = (function (_super) {
    __extends(SchemaForeignKey, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The string representation of the foreign key's _id
    * @param {string} targetCollection The name of the collection to which the target exists
    * @param {boolean} optionalKey If true, then this key will only be nullified if the target is removed
    */
    function SchemaForeignKey(name, val, targetCollection, optionalKey) {
        if (optionalKey === void 0) { optionalKey = false; }
        _super.call(this, name, val);
        this.targetCollection = targetCollection;
        this.optionalKey = optionalKey;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaForeignKey} copy A sub class of the copy
    * @returns {SchemaForeignKey}
    */
    SchemaForeignKey.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaForeignKey(this.name, this.value, this.targetCollection) : copy;
        _super.prototype.clone.call(this, copy);
        copy.optionalKey = this.optionalKey;
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaForeignKey.prototype.validate = function () {
        var transformedValue = this.value;
        if (typeof this.value == "string") {
            if (utils_1.Utils.isValidObjectID(this.value))
                transformedValue = this.value = new mongodb_1.ObjectID(this.value);
            else if (this.value.trim() != "")
                return "Please use a valid ID for '" + this.name + "'";
            else
                transformedValue = null;
        }
        if (!transformedValue) {
            this.value = null;
            return true;
        }
        return true;
    };
    /**
    * Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<any>}
    */
    SchemaForeignKey.prototype.getValue = function (options) {
        var that = this;
        if (!options.expandForeignKeys)
            return this.value;
        else {
            return new Promise(function (resolve, reject) {
                var model = Model_1.Model.getByName(that.targetCollection);
                if (model) {
                    model.collection.find({ _id: that.value }).limit(1).next().then(function (result) {
                        model.createInstance(result).then(function (instance) {
                            resolve(instance);
                        }).catch(function (err) {
                            reject("An error occurred fetching the foreign key for " + that.name + " : '" + err.message + "'");
                        });
                    });
                }
                else
                    reject(new Error(that.name + " references a foreign key '" + that.targetCollection + "' which doesn't seem to exist"));
            });
        }
    };
    return SchemaForeignKey;
}(schema_item_1.SchemaItem));
exports.SchemaForeignKey = SchemaForeignKey;
