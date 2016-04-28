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
var SchemaText = (function (_super) {
    __extends(SchemaText, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The text of this item
    * @param {number} minCharacters [Optional] Specify the minimum number of characters for use with this text item
    * @param {number} maxCharacters [Optional] Specify the maximum number of characters for use with this text item
    * @param {boolean} htmlClean [Optional] If true, the text is cleaned of HTML before insertion. The default is true
    */
    function SchemaText(name, val, minCharacters, maxCharacters, htmlClean) {
        if (minCharacters === void 0) { minCharacters = 0; }
        if (maxCharacters === void 0) { maxCharacters = 10000; }
        if (htmlClean === void 0) { htmlClean = true; }
        _super.call(this, name, val);
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
        this.htmlClean = htmlClean;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaText} copy A sub class of the copy
    * @returns {SchemaText}
    */
    SchemaText.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaText(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
        copy.htmlClean = this.htmlClean;
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean>}
    */
    SchemaText.prototype.validate = function () {
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        this.value = this.value || "";
        var transformedValue = "";
        if (this.htmlClean)
            transformedValue = sanitizeHtml(this.value.trim(), { allowedTags: [] });
        else
            transformedValue = this.value.trim();
        this.value = transformedValue;
        if (transformedValue.length < minCharacters && minCharacters == 1)
            return Promise.reject(new Error(this.name + " cannot be empty"));
        if (transformedValue.length > maxCharacters)
            return Promise.reject(new Error("The character length of " + this.name + " is too long, please keep it below " + maxCharacters));
        else if (transformedValue.length < minCharacters)
            return Promise.reject(new Error("The character length of " + this.name + " is too short, please keep it above " + minCharacters));
        else
            return Promise.resolve(true);
    };
    return SchemaText;
}(schema_item_1.SchemaItem));
exports.SchemaText = SchemaText;
