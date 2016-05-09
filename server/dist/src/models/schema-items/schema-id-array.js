"use strict";
const schema_item_1 = require("./schema-item");
const mongodb_1 = require("mongodb");
const utils_1 = require("../../utils");
/**
* A n ID array scheme item for use in Models
*/
class SchemaIdArray extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item that holds an array of id items
    * @param {string} name The name of this item
    * @param {Array<string|ObjectID>} val The array of ids for this schema item
    * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
    * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
    */
    constructor(name, val, minItems = 0, maxItems = 10000) {
        super(name, val);
        this.maxItems = maxItems;
        this.minItems = minItems;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaIdArray} copy A sub class of the copy
    * @returns {SchemaIdArray}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaIdArray(this.name, this.value) : copy;
        super.clone(copy);
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>} Returns true if successful or an error message string if unsuccessful
    */
    validate() {
        var transformedValue = this.value;
        for (var i = 0, l = transformedValue.length; i < l; i++) {
            if (typeof this.value[i] == "string") {
                if (utils_1.Utils.isValidObjectID(this.value[i]))
                    transformedValue[i] = new mongodb_1.ObjectID(this.value[i]);
                else if (this.value[i].trim() != "")
                    return Promise.reject(new Error(`Please use a valid ID for '${this.name}'`));
                else
                    return Promise.reject(new Error(`Please use a valid ID for '${this.name}'`));
            }
        }
        if (transformedValue.length < this.minItems)
            return Promise.reject(new Error(`You must select at least ${this.minItems} item${(this.minItems == 1 ? "" : "s")} for ${this.name}`));
        if (transformedValue.length > this.maxItems)
            return Promise.reject(new Error(`You have selected too many items for ${this.name}, please only use up to ${this.maxItems}`));
        return Promise.resolve(true);
    }
}
exports.SchemaIdArray = SchemaIdArray;
