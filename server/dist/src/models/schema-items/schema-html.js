"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schema_item_1 = require("./schema-item");
var sanitizeHtml = require("sanitize-html");
/**
* An html scheme item for use in Models
*/
var SchemaHtml = (function (_super) {
    __extends(SchemaHtml, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The text of this item
    * @param {Array<string>} allowedTags The tags allowed by the html parser
    * @param {[name: string] : Array<string>} allowedAttributes The attributes allowed by each attribute
    * @param {boolean} errorBadHTML If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you
    * @param {number} minCharacters [Optional] Specify the minimum number of characters for use with this text item
    * @param {number} maxCharacters [Optional] Specify the maximum number of characters for use with this text item
    */
    function SchemaHtml(name, val, allowedTags, allowedAttributes, errorBadHTML, minCharacters, maxCharacters) {
        if (allowedTags === void 0) { allowedTags = SchemaHtml.defaultTags; }
        if (allowedAttributes === void 0) { allowedAttributes = SchemaHtml.defaultAllowedAttributes; }
        if (errorBadHTML === void 0) { errorBadHTML = true; }
        if (minCharacters === void 0) { minCharacters = 0; }
        if (maxCharacters === void 0) { maxCharacters = 10000; }
        _super.call(this, name, val);
        this.errorBadHTML = errorBadHTML;
        this.allowedAttributes = allowedAttributes;
        this.allowedTags = allowedTags;
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaHtml} copy A sub class of the copy
    * @returns {SchemaHtml}
    */
    SchemaHtml.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaHtml(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        copy.allowedTags = this.allowedTags.slice(0, this.allowedTags.length);
        copy.allowedAttributes = this.allowedAttributes;
        copy.errorBadHTML = this.errorBadHTML;
        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean>} Returns true if successful or an error message string if unsuccessful
    */
    SchemaHtml.prototype.validate = function () {
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        var transformedValue = this.value.trim();
        if (transformedValue.length < minCharacters && minCharacters == 1)
            return Promise.reject(new Error("'" + this.name + "' cannot be empty"));
        else if (transformedValue.length > maxCharacters)
            return Promise.reject(new Error("The character length of '" + this.name + "' is too long, please keep it below " + maxCharacters));
        else if (transformedValue.length < minCharacters)
            return Promise.reject(new Error("The character length of '" + this.name + "' is too short, please keep it above " + minCharacters));
        var sanitizedHTML = sanitizeHtml(this.value, { allowedAttributes: this.allowedAttributes, allowedTags: this.allowedTags }).trim();
        if (this.errorBadHTML && transformedValue != sanitizedHTML)
            return Promise.reject(new Error("'" + this.name + "' has html code that is not allowed"));
        this.value = sanitizedHTML;
        return Promise.resolve(true);
    };
    /**
    * The default tags allowed
    * includes: h3, h4, h5, h6, blockquote, p, a, ul, ol,
    *    nl, li, b, i, strong, em, strike, code, hr, br, div,
    *    table, thead, caption, tbody, tr, th, td, pre
    */
    SchemaHtml.defaultTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'];
    /**
    * The default allowed attributes for each tag
    */
    SchemaHtml.defaultAllowedAttributes = {
        a: ['href', 'name', 'target'],
        img: ['src']
    };
    return SchemaHtml;
}(schema_item_1.SchemaItem));
exports.SchemaHtml = SchemaHtml;
