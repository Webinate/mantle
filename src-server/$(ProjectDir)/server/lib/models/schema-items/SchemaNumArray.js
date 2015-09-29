var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SchemaItem_1 = require("./SchemaItem");
var SchemaNumber_1 = require("./SchemaNumber");
/**
* A number array scheme item for use in Models
*/
var SchemaNumArray = (function (_super) {
    __extends(SchemaNumArray, _super);
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
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
    */
    function SchemaNumArray(name, val, minItems, maxItems, min, max, type, decimalPlaces, sensitive) {
        if (minItems === void 0) { minItems = 0; }
        if (maxItems === void 0) { maxItems = Infinity; }
        if (min === void 0) { min = -Infinity; }
        if (max === void 0) { max = Infinity; }
        if (type === void 0) { type = SchemaNumber_1.NumberType.Integer; }
        if (decimalPlaces === void 0) { decimalPlaces = 2; }
        if (sensitive === void 0) { sensitive = false; }
        _super.call(this, name, val, sensitive);
        this.max = max;
        this.min = min;
        this.maxItems = maxItems;
        this.minItems = minItems;
        this.type = type;
        if (decimalPlaces > 20)
            throw new Error("Decimal palces for " + name + " cannot be more than 20");
        this.decimalPlaces = decimalPlaces;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaNumArray} copy A sub class of the copy
    * @returns {SchemaNumArray}
    */
    SchemaNumArray.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaNumArray(this.name, this.value) : copy;
        _super.prototype.clone.call(this, copy);
        copy.max = this.max;
        copy.min = this.min;
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        copy.type = this.type;
        copy.decimalPlaces = this.decimalPlaces;
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaNumArray.prototype.validate = function () {
        var transformedValue = this.value;
        var max = this.max;
        var min = this.min;
        var type = this.type;
        var temp;
        var decimalPlaces = this.decimalPlaces;
        for (var i = 0, l = transformedValue.length; i < l; i++) {
            if (type == SchemaNumber_1.NumberType.Integer)
                temp = parseInt(transformedValue.toString());
            else
                temp = parseFloat((parseFloat(transformedValue.toString()).toFixed(decimalPlaces)));
            if (temp < min || temp > max)
                return "The value of " + this.name + " is not within the range of " + this.min + " and " + this.max;
            transformedValue[i] = temp;
        }
        if (transformedValue.length < this.minItems)
            return "You must select at least " + this.minItems + " item" + (this.minItems == 1 ? "" : "s") + " for " + this.name;
        if (transformedValue.length > this.maxItems)
            return "You have selected too many items for " + this.name + ", please only use up to " + this.maxItems;
        return true;
    };
    /**
    * Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {Array<number>}
    */
    SchemaNumArray.prototype.getValue = function (sanitize) {
        if (sanitize === void 0) { sanitize = false; }
        if (this.sensitive && sanitize)
            return null;
        else
            return this.value;
    };
    return SchemaNumArray;
})(SchemaItem_1.SchemaItem);
exports.SchemaNumArray = SchemaNumArray;
