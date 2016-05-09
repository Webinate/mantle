"use strict";
const schema_item_1 = require("./schema-item");
/**
* A json scheme item for use in Models
*/
class SchemaJSON extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {any} val The text of this item
    */
    constructor(name, val) {
        super(name, val);
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaJSON} copy A sub class of the copy
    * @returns {SchemaJSON}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaJSON(this.name, this.value) : copy;
        super.clone(copy);
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>}
    */
    validate() {
        if (this.value === undefined)
            this.value = null;
        return Promise.resolve(true);
    }
}
exports.SchemaJSON = SchemaJSON;
