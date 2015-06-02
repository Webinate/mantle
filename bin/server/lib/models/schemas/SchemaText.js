var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schemaModule = require("./SchemaItem");
/**
* A numeric scheme for use in Models
*/
var SchemaText = (function (_super) {
    __extends(SchemaText, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The text of this item
    */
    function SchemaText(name, val, maxCharacters) {
        if (maxCharacters === void 0) { maxCharacters = 10000; }
        _super.call(this, name, val);
        this.maxCharacters = maxCharacters;
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
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaText.prototype.validate = function () {
        var maxCharacters = this.maxCharacters;
        var transformedValue = this.value;
        if (transformedValue.length > maxCharacters)
            return "The character length of " + this.name + " is too long, please keep it below " + maxCharacters;
        else
            return true;
    };
    return SchemaText;
})(schemaModule.SchemaItem);
exports.SchemaText = SchemaText;
