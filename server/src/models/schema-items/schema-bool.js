"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schema_item_1 = require("./schema-item");
/**
* A bool scheme item for use in Models
*/
var SchemaBool = (function (_super) {
    __extends(SchemaBool, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {boolean} val The value of this item
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
    */
    function SchemaBool(name, val, sensitive) {
        if (sensitive === void 0) { sensitive = false; }
        _super.call(this, name, val, sensitive);
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaBool} copy A sub class of the copy
    * @returns {SchemaBool}
    */
    SchemaBool.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaBool(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        return copy;
    };
    /**
    * Always true
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaBool.prototype.validate = function () {
        return true;
    };
    /**
    * Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {boolean}
    */
    SchemaBool.prototype.getValue = function (sanitize) {
        if (sanitize === void 0) { sanitize = false; }
        if (this.sensitive && sanitize)
            return false;
        else
            return this.value;
    };
    return SchemaBool;
}(schema_item_1.SchemaItem));
exports.SchemaBool = SchemaBool;
