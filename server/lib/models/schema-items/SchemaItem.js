/**
* A definition of each item in the model
*/
var SchemaItem = (function () {
    function SchemaItem(name, value, sensitive) {
        this.name = name;
        this.value = value;
        this.sensitive = sensitive;
        this._unique = false;
        this._uniqueIndexer = false;
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
        copy._uniqueIndexer = this._uniqueIndexer;
        copy.sensitive = this.sensitive;
        return copy;
    };
    /**
    * Gets if this item is indexable by mongodb
    * @returns {boolean}
    */
    SchemaItem.prototype.getIndexable = function () { return this._indexable; };
    /**
    * Sets if this item is indexable by mongodb
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.setIndexable = function (val) {
        this._indexable = val;
        return this;
    };
    /**
    * Gets if this item represents a unique value in the database. An example might be a username
    * @returns {boolean}
    */
    SchemaItem.prototype.getUnique = function () { return this._unique; };
    /**
    * Sets if this item represents a unique value in the database. An example might be a username
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.setUnique = function (val) {
        this._unique = val;
        return this;
    };
    /**
    * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
    * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
    * a given project. In this case the project item is set as a uniqueIndexer
    * @returns {boolean}
    */
    SchemaItem.prototype.getUniqueIndexer = function () { return this._uniqueIndexer; };
    /**
    * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
    * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
    * a given project. In this case the project item is set as a uniqueIndexer
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.setUniqueIndexer = function (val) {
        this._uniqueIndexer = val;
        return this;
    };
    /**
    * Gets if this item is sensitive
    * @returns {boolean}
    */
    SchemaItem.prototype.getSensitive = function () {
        return this.sensitive;
    };
    /**
    * Sets if this item is sensitive
    * @returns {SchemaItem<T>}
    */
    SchemaItem.prototype.setSensitive = function (val) {
        this.sensitive = val;
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
