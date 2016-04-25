"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schema_item_1 = require("./schema-item");
var mongodb_1 = require("mongodb");
var utils_1 = require("../../utils");
/**
* A mongodb ObjectID scheme item for use in Models
*/
var SchemaId = (function (_super) {
    __extends(SchemaId, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The string representation of the object ID
    */
    function SchemaId(name, val) {
        _super.call(this, name, val);
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaId} copy A sub class of the copy
    * @returns {SchemaId}
    */
    SchemaId.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaId(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaId.prototype.validate = function () {
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
    * @returns {SchemaValue}
    */
    SchemaId.prototype.getValue = function () {
        if (!this.value)
            return null;
        else
            return this.value;
    };
    return SchemaId;
}(schema_item_1.SchemaItem));
exports.SchemaId = SchemaId;
