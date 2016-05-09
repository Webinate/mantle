"use strict";
const schema_item_1 = require("./schema-item");
const schema_number_1 = require("./schema-number");
/**
* A number array scheme item for use in Models
*/
class SchemaNumArray extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item that holds an array of number items
    * @param {string} name The name of this item
    * @param {Array<number>} val The number array of this schema item
    * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
    * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
    * @param {number} min [Optional] Specify the minimum a number can be
    * @param {number} max [Optional] Specify the maximum a number can be
    * @param {NumberType} type [Optional] What type of numbers to expect
    * @param {number} decimalPlaces [Optional] The number of decimal places to use if the type is a Float
    */
    constructor(name, val, minItems = 0, maxItems = Infinity, min = -Infinity, max = Infinity, type = schema_number_1.NumberType.Integer, decimalPlaces = 2) {
        super(name, val);
        this.max = max;
        this.min = min;
        this.maxItems = maxItems;
        this.minItems = minItems;
        this.type = type;
        if (decimalPlaces > 20)
            throw new Error(`Decimal palces for ${name} cannot be more than 20`);
        this.decimalPlaces = decimalPlaces;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaNumArray} copy A sub class of the copy
    * @returns {SchemaNumArray}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaNumArray(this.name, this.value) : copy;
        super.clone(copy);
        copy.max = this.max;
        copy.min = this.min;
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        copy.type = this.type;
        copy.decimalPlaces = this.decimalPlaces;
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>}
    */
    validate() {
        var transformedValue = this.value;
        var max = this.max;
        var min = this.min;
        var type = this.type;
        var temp;
        var decimalPlaces = this.decimalPlaces;
        for (var i = 0, l = transformedValue.length; i < l; i++) {
            if (type == schema_number_1.NumberType.Integer)
                temp = parseInt(transformedValue.toString());
            else
                temp = parseFloat((parseFloat(transformedValue.toString()).toFixed(decimalPlaces)));
            if (temp < min || temp > max)
                return Promise.reject(new Error(`The value of ${this.name} is not within the range of ${this.min} and ${this.max}`));
            transformedValue[i] = temp;
        }
        if (transformedValue.length < this.minItems)
            return Promise.reject(new Error(`You must select at least ${this.minItems} item${(this.minItems == 1 ? "" : "s")} for ${this.name}`));
        if (transformedValue.length > this.maxItems)
            return Promise.reject(new Error(`You have selected too many items for ${this.name}, please only use up to ${this.maxItems}`));
        return Promise.resolve(true);
    }
}
exports.SchemaNumArray = SchemaNumArray;
