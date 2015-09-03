/**
* A definition of each item in the model
*/
var SchemaItem = (function () {
    function SchemaItem(name, value, sensitive) {
        this.name = name;
        this.value = value;
        this.sensitive = sensitive;
        this._unique = false;
        this._indexable = false;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaItem} copy A sub class of the copy
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaItem(this.name, this.value, this.sensitive) : copy;
        copy._unique = this._unique;
        return copy;
    };
    /**
    * Gets if this item is indexable by mongodb
    * @returns {boolean}
    */
    SchemaItem.prototype.getIndexable = function () { return this._indexable; };
    /**
    * Gets if this item represents a unique value in the database. An example might be a username
    * @returns {boolean}
    */
    SchemaItem.prototype.getUnique = function () { return this._unique; };
    /**
    * Sets if this item is indexable by mongodb
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.setIndexable = function (val) {
        this._indexable = val;
        return this;
    };
    /**
    * Sets if this item represents a unique value in the database. An example might be a username
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.setUnique = function (val) {
        this._unique = val;
        return this;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
    */
    SchemaItem.prototype.validate = function () {
        return true;
    };
    /**
    * Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
    */
    SchemaItem.prototype.getValue = function (sanitize) {
        if (sanitize === void 0) { sanitize = false; }
        return this.value;
    };
    return SchemaItem;
})();
exports.SchemaItem = SchemaItem;
