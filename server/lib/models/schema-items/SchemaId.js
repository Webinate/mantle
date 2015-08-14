var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SchemaItem_1 = require("./SchemaItem");
var mongodb_1 = require("mongodb");
/**
* A mongodb ObjectID scheme item for use in Models
*/
var SchemaId = (function (_super) {
    __extends(SchemaId, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The string representation of the object ID
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
    */
    function SchemaId(name, val, sensitive) {
        if (sensitive === void 0) { sensitive = false; }
        this._str = val;
        if (this.isValidObjectID(val))
            _super.call(this, name, new mongodb_1.ObjectID(val), sensitive);
        else
            _super.call(this, name, null, sensitive);
    }
    /**
    * Checks a string to see if its a valid mongo id
    * @param {string} str
    * @returns {boolean} True if the string is valid
    */
    SchemaId.prototype.isValidObjectID = function (str) {
        // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
        str = str.trim() + '';
        var len = str.length, valid = false;
        if (len == 12 || len == 24) {
            valid = /^[0-9a-fA-F]+$/.test(str);
        }
        return valid;
    };
    /**
    * Creates a clone of this item
    * @returns {SchemaId} copy A sub class of the copy
    * @returns {SchemaId}
    */
    SchemaId.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaId(this.name, this._str) : copy;
        _super.prototype.clone.call(this, copy);
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaId.prototype.validate = function () {
        var transformedValue = this.value;
        if (!transformedValue)
            return "Please use a valid ID for '" + this.name + "'";
        else
            return true;
    };
    /**
    * Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
    */
    SchemaId.prototype.getValue = function (sanitize) {
        if (sanitize === void 0) { sanitize = false; }
        if (this.sensitive && sanitize)
            return new mongodb_1.ObjectID();
        else if (!this.value)
            return new mongodb_1.ObjectID();
        else
            return this.value;
    };
    return SchemaId;
})(SchemaItem_1.SchemaItem);
exports.SchemaId = SchemaId;
