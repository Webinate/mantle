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
    */
    function SchemaBool(name, val) {
        _super.call(this, name, val);
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
    * @returns {Promise<boolean>}
    */
    SchemaBool.prototype.validate = function () {
        var val = this.value;
        if (val === undefined)
            return Promise.reject(new Error(this.name + " cannot be undefined"));
        if (val === null)
            return Promise.reject(new Error(this.name + " cannot be null"));
        return Promise.resolve(true);
    };
    return SchemaBool;
}(schema_item_1.SchemaItem));
exports.SchemaBool = SchemaBool;
