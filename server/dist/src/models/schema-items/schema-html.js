"use strict";
const schema_item_1 = require("./schema-item");
const sanitizeHtml = require("sanitize-html");
/**
* An html scheme item for use in Models
*/
class SchemaHtml extends schema_item_1.SchemaItem {
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
    constructor(name, val, allowedTags = SchemaHtml.defaultTags, allowedAttributes = SchemaHtml.defaultAllowedAttributes, errorBadHTML = true, minCharacters = 0, maxCharacters = 10000) {
        super(name, val);
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
    clone(copy) {
        copy = copy === undefined ? new SchemaHtml(this.name, this.value) : copy;
        super.clone(copy);
        copy.allowedTags = this.allowedTags.slice(0, this.allowedTags.length);
        copy.allowedAttributes = this.allowedAttributes;
        copy.errorBadHTML = this.errorBadHTML;
        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>} Returns true if successful or an error message string if unsuccessful
    */
    validate() {
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        var transformedValue = this.value.trim();
        if (transformedValue.length < minCharacters && minCharacters == 1)
            return Promise.reject(new Error(`'${this.name}' cannot be empty`));
        else if (transformedValue.length > maxCharacters)
            return Promise.reject(new Error(`The character length of '${this.name}' is too long, please keep it below ${maxCharacters}`));
        else if (transformedValue.length < minCharacters)
            return Promise.reject(new Error(`The character length of '${this.name}' is too short, please keep it above ${minCharacters}`));
        var sanitizedHTML = sanitizeHtml(this.value, { allowedAttributes: this.allowedAttributes, allowedTags: this.allowedTags }).trim();
        if (this.errorBadHTML && transformedValue != sanitizedHTML)
            return Promise.reject(new Error(`'${this.name}' has html code that is not allowed`));
        this.value = sanitizedHTML;
        return Promise.resolve(true);
    }
}
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
exports.SchemaHtml = SchemaHtml;
