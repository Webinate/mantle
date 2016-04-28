"use strict";
/**
* A definition of each item in the model
*/
var SchemaItem = (function () {
    function SchemaItem(name, value) {
        this.name = name;
        this.value = value;
        this._sensitive = false;
        this._unique = false;
        this._uniqueIndexer = false;
        this._indexable = false;
        this._required = false;
        this._modified = false;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaItem} copy A sub class of the copy
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.clone = function (copy) {
        copy = copy === undefined ? new SchemaItem(this.name, this.value) : copy;
        copy._unique = this._unique;
        copy._uniqueIndexer = this._uniqueIndexer;
        copy._required = this._required;
        copy._sensitive = this._sensitive;
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
    * Gets if this item is required. If true, then validations will fail if they are not specified
    * @returns {boolean}
    */
    SchemaItem.prototype.getRequired = function () { return this._required; };
    /**
    * Sets if this item is required. If true, then validations will fail if they are not specified
    * @returns {SchemaItem}
    */
    SchemaItem.prototype.setRequired = function (val) {
        this._required = val;
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
        return this._sensitive;
    };
    /**
    * Gets if this item has been edited since its creation
    * @returns {boolean}
    */
    SchemaItem.prototype.getModified = function () {
        return this._modified;
    };
    /**
    * Sets if this item is sensitive
    * @returns {SchemaItem<T>}
    */
    SchemaItem.prototype.setSensitive = function (val) {
        this._sensitive = val;
        return this;
    };
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean>}
    */
    SchemaItem.prototype.validate = function () {
        return Promise.resolve(true);
    };
    /**
    * Gets the value of this item in a database safe format
    * @returns {T}
    */
    SchemaItem.prototype.getDbValue = function () {
        return this.value;
    };
    /**
    * Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {T | Promise<T>}
    */
    SchemaItem.prototype.getValue = function (options) {
        return this.value;
    };
    /**
    * Sets the value of this item
    * @param {T} val The value to set
    * @returns {SchemaValue}
    */
    SchemaItem.prototype.setValue = function (val) {
        this._modified = true;
        return this.value = val;
    };
    return SchemaItem;
}());
exports.SchemaItem = SchemaItem;
