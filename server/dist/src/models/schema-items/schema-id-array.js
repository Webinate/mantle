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
* A n ID array scheme item for use in Models
*/
var SchemaIdArray = (function (_super) {
    __extends(SchemaIdArray, _super);
    /**
    * Creates a new schema item that holds an array of id items
    * @param {string} name The name of this item
    * @param {Array<string|ObjectID>} val The array of ids for this schema item
    * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
    * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
    */
    function SchemaIdArray(name, val, minItems, maxItems) {
        if (minItems === void 0) { minItems = 0; }
        if (maxItems === void 0) { maxItems = 10000; }
        _super.call(this, name, val);
        this.maxItems = maxItems;
        this.minItems = minItems;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaIdArray} copy A sub class of the copy
    * @returns {SchemaIdArray}
    */
    SchemaIdArray.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaIdArray(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaIdArray.prototype.validate = function () {
        var transformedValue = this.value;
        for (var i = 0, l = transformedValue.length; i < l; i++) {
            if (typeof this.value[i] == "string") {
                if (utils_1.Utils.isValidObjectID(this.value[i]))
                    transformedValue[i] = new mongodb_1.ObjectID(this.value[i]);
                else if (this.value[i].trim() != "")
                    return "Please use a valid ID for '" + this.name + "'";
                else
                    return "Please use a valid ID for '" + this.name + "'";
            }
        }
        if (transformedValue.length < this.minItems)
            return "You must select at least " + this.minItems + " item" + (this.minItems == 1 ? "" : "s") + " for " + this.name;
        if (transformedValue.length > this.maxItems)
            return "You have selected too many items for " + this.name + ", please only use up to " + this.maxItems;
        return true;
    };
    /**
    * Gets the value of this item
    * @returns {Array<string|ObjectID>}
    */
    SchemaIdArray.prototype.getValue = function () {
        return this.value;
    };
    return SchemaIdArray;
}(schema_item_1.SchemaItem));
exports.SchemaIdArray = SchemaIdArray;
