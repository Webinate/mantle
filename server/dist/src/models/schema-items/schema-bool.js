"use strict";
const schema_item_1 = require("./schema-item");
/**
* A bool scheme item for use in Models
*/
class SchemaBool extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {boolean} val The value of this item
    */
    constructor(name, val) {
        super(name, val);
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaBool} copy A sub class of the copy
    * @returns {SchemaBool}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaBool(this.name, this.value) : copy;
        super.clone(copy);
        return copy;
    }
    /**
    * Always true
    * @returns {Promise<boolean|Error>}
    */
    validate() {
        var val = this.value;
        if (val === undefined)
            return Promise.reject(new Error(`${this.name} cannot be undefined`));
        if (val === null)
            return Promise.reject(new Error(`${this.name} cannot be null`));
        return Promise.resolve(true);
    }
}
exports.SchemaBool = SchemaBool;
