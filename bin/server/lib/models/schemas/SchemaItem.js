/**
* A definition of each item in the model
*/
var SchemaItem = (function () {
    function SchemaItem(name, value) {
        this.name = name;
        this.value = value;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaItem} copy A sub class of the copy
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaItem(this.name, this.value) : copy;
        return copy;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaItem.prototype.validate = function () {
        return true;
    };
    return SchemaItem;
})();
exports.SchemaItem = SchemaItem;
