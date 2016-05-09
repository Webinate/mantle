"use strict";
const schema_item_1 = require("./schema-item");
const mongodb_1 = require("mongodb");
const utils_1 = require("../../utils");
/**
* A mongodb ObjectID scheme item for use in Models
*/
class SchemaId extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The string representation of the object ID
    */
    constructor(name, val) {
        super(name, val);
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaId} copy A sub class of the copy
    * @returns {SchemaId}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaId(this.name, this.value) : copy;
        super.clone(copy);
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>}
    */
    validate() {
        var transformedValue = this.value;
        if (typeof this.value == "string") {
            if (utils_1.Utils.isValidObjectID(this.value))
                transformedValue = this.value = new mongodb_1.ObjectID(this.value);
            else if (this.value.trim() != "")
                return Promise.reject(new Error(`Please use a valid ID for '${this.name}'`));
            else
                transformedValue = null;
        }
        if (!transformedValue) {
            this.value = null;
            return Promise.resolve(true);
        }
        return Promise.resolve(true);
    }
}
exports.SchemaId = SchemaId;
