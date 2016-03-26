"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schema_item_1 = require("./schema-item");
var sanitizeHtml = require("sanitize-html");
/**
* A text scheme item for use in Models
*/
var SchemaTextArray = (function (_super) {
    __extends(SchemaTextArray, _super);
    /**
    * Creates a new schema item that holds an array of text items
    * @param {string} name The name of this item
    * @param {Array<string>} val The text array of this schema item
    * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
    * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
    * @param {number} minCharacters [Optional] Specify the minimum number of characters for each text item
    * @param {number} maxCharacters [Optional] Specify the maximum number of characters for each text item
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
    */
    function SchemaTextArray(name, val, minItems, maxItems, minCharacters, maxCharacters, sensitive) {
        if (minItems === void 0) { minItems = 0; }
        if (maxItems === void 0) { maxItems = 10000; }
        if (minCharacters === void 0) { minCharacters = 0; }
        if (maxCharacters === void 0) { maxCharacters = 10000; }
        if (sensitive === void 0) { sensitive = false; }
        _super.call(this, name, val, sensitive);
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
        this.maxItems = maxItems;
        this.minItems = minItems;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaTextArray} copy A sub class of the copy
    * @returns {SchemaTextArray}
    */
    SchemaTextArray.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaTextArray(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaTextArray.prototype.validate = function () {
        var transformedValue = this.value;
        var toRemove = [];
        for (var i = 0, l = transformedValue.length; i < l; i++) {
            transformedValue[i] = sanitizeHtml(transformedValue[i].trim(), { allowedTags: [] });
            if (transformedValue[i].trim() == "")
                toRemove.push(i);
        }
        // Remove any "" cells
        for (var i = toRemove.length - 1; i >= 0; i--)
            transformedValue.splice(toRemove[i], 1);
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        if (transformedValue.length < this.minItems)
            return "You must select at least " + this.minItems + " item" + (this.minItems == 1 ? "" : "s") + " for " + this.name;
        if (transformedValue.length > this.maxItems)
            return "You have selected too many items for " + this.name + ", please only use up to " + this.maxItems;
        for (var i = 0, l = transformedValue.length; i < l; i++) {
            transformedValue[i] = transformedValue[i].trim();
            if (transformedValue[i].length > maxCharacters)
                return "The character length of '" + transformedValue[i] + "' in " + this.name + " is too long, please keep it below " + maxCharacters;
            else if (transformedValue[i].length < minCharacters)
                return "The character length of '" + transformedValue[i] + "' in " + this.name + " is too short, please keep it above " + minCharacters;
        }
        return true;
    };
    /**
    * Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {Array<string>}
    */
    SchemaTextArray.prototype.getValue = function (sanitize) {
        if (sanitize === void 0) { sanitize = false; }
        if (this.sensitive && sanitize)
            return null;
        else
            return this.value;
    };
    return SchemaTextArray;
}(schema_item_1.SchemaItem));
exports.SchemaTextArray = SchemaTextArray;
