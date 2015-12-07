var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SchemaItem_1 = require("./SchemaItem");
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
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
    */
    function SchemaText(name, val, minCharacters, maxCharacters, sensitive) {
        if (minCharacters === void 0) { minCharacters = 0; }
        if (maxCharacters === void 0) { maxCharacters = 10000; }
        if (sensitive === void 0) { sensitive = false; }
        _super.call(this, name, val, sensitive);
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
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
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaText.prototype.validate = function () {
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        this.value = this.value || "";
        var transformedValue = sanitizeHtml(this.value.trim(), { allowedTags: [] });
        this.value = transformedValue;
        if (transformedValue.length < minCharacters && minCharacters == 1)
            return this.name + " cannot be empty";
        if (transformedValue.length > maxCharacters)
            return "The character length of " + this.name + " is too long, please keep it below " + maxCharacters;
        else if (transformedValue.length < minCharacters)
            return "The character length of " + this.name + " is too short, please keep it above " + minCharacters;
        else
            return true;
    };
    /**
    * Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
    */
    SchemaText.prototype.getValue = function (sanitize) {
        if (sanitize === void 0) { sanitize = false; }
        if (this.sensitive && sanitize)
            return new Array(this.value.length).join("*");
        else
            return this.value;
    };
    return SchemaText;
})(SchemaItem_1.SchemaItem);
exports.SchemaText = SchemaText;
