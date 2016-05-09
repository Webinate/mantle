"use strict";
const schema_item_1 = require("./schema-item");
const sanitizeHtml = require("sanitize-html");
/**
* A text scheme item for use in Models
*/
class SchemaText extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The text of this item
    * @param {number} minCharacters [Optional] Specify the minimum number of characters for use with this text item
    * @param {number} maxCharacters [Optional] Specify the maximum number of characters for use with this text item
    * @param {boolean} htmlClean [Optional] If true, the text is cleaned of HTML before insertion. The default is true
    */
    constructor(name, val, minCharacters = 0, maxCharacters = 10000, htmlClean = true) {
        super(name, val);
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
        this.htmlClean = htmlClean;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaText} copy A sub class of the copy
    * @returns {SchemaText}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaText(this.name, this.value) : copy;
        super.clone(copy);
        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
        copy.htmlClean = this.htmlClean;
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>}
    */
    validate() {
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
            return Promise.reject(new Error(`${this.name} cannot be empty`));
        if (transformedValue.length > maxCharacters)
            return Promise.reject(new Error(`The character length of ${this.name} is too long, please keep it below ${maxCharacters}`));
        else if (transformedValue.length < minCharacters)
            return Promise.reject(new Error(`The character length of ${this.name} is too short, please keep it above ${minCharacters}`));
        else
            return Promise.resolve(true);
    }
}
exports.SchemaText = SchemaText;
