"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schema_item_1 = require("./schema-item");
/**
* A date scheme item for use in Models
*/
var SchemaDate = (function (_super) {
    __extends(SchemaDate, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {number} val The date of this item. If none is specified the Date.now() number is used.
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
    * @param {boolean} useNow [Optional] If true, the date will always be updated to use the current date
    */
    function SchemaDate(name, val, sensitive, useNow) {
        if (sensitive === void 0) { sensitive = false; }
        if (useNow === void 0) { useNow = false; }
        _super.call(this, name, val, sensitive);
        this.useNow = useNow;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaText} copy A sub class of the copy
    * @returns {SchemaText}
    */
    SchemaDate.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaDate(this.name, this.value) : copy;
        copy.useNow = this.useNow;
        _super.prototype.clone.call(this, copy);
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaDate.prototype.validate = function () {
        if (this.useNow)
            this.value = Date.now();
        return true;
    };
    /**
    * Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
    */
    SchemaDate.prototype.getValue = function (sanitize) {
        if (sanitize === void 0) { sanitize = false; }
        if (this.sensitive && sanitize)
            return 0;
        else
            return (this.value !== undefined && this.value !== null ? this.value : Date.now());
    };
    return SchemaDate;
}(schema_item_1.SchemaItem));
exports.SchemaDate = SchemaDate;
