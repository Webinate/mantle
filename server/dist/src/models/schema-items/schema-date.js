"use strict";
const schema_item_1 = require("./schema-item");
/**
* A date scheme item for use in Models
*/
class SchemaDate extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {number} val The date of this item. If none is specified the Date.now() number is used.
    * @param {boolean} useNow [Optional] If true, the date will always be updated to use the current date
    */
    constructor(name, val, useNow = false) {
        super(name, val);
        this.useNow = useNow;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaText} copy A sub class of the copy
    * @returns {SchemaText}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaDate(this.name, this.value) : copy;
        copy.useNow = this.useNow;
        super.clone(copy);
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>}
    */
    validate() {
        if (this.useNow)
            this.value = Date.now();
        return Promise.resolve(true);
    }
    /**
    * Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {number}
    */
    getValue(options) {
        return (this.value !== undefined && this.value !== null ? this.value : Date.now());
    }
}
exports.SchemaDate = SchemaDate;
