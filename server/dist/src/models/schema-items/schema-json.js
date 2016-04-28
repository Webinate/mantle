"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schema_item_1 = require("./schema-item");
/**
* A json scheme item for use in Models
*/
var SchemaJSON = (function (_super) {
    __extends(SchemaJSON, _super);
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {any} val The text of this item
    */
    function SchemaJSON(name, val) {
        _super.call(this, name, val);
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaJSON} copy A sub class of the copy
    * @returns {SchemaJSON}
    */
    SchemaJSON.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaJSON(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean>}
    */
    SchemaJSON.prototype.validate = function () {
        if (this.value === undefined)
            this.value = null;
        return Promise.resolve(true);
    };
    return SchemaJSON;
}(schema_item_1.SchemaItem));
exports.SchemaJSON = SchemaJSON;
