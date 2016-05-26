"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
* A definition of each item in the model
*/
class SchemaItem {
    constructor(name, value) {
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
    clone(copy) {
        copy = copy === undefined ? new SchemaItem(this.name, this.value) : copy;
        copy._unique = this._unique;
        copy._uniqueIndexer = this._uniqueIndexer;
        copy._required = this._required;
        copy._sensitive = this._sensitive;
        return copy;
    }
    /**
    * Gets if this item is indexable by mongodb
    * @returns {boolean}
    */
    getIndexable() { return this._indexable; }
    /**
    * Sets if this item is indexable by mongodb
    * @returns {SchemaItem}
    */
    setIndexable(val) {
        this._indexable = val;
        return this;
    }
    /**
    * Gets if this item is required. If true, then validations will fail if they are not specified
    * @returns {boolean}
    */
    getRequired() { return this._required; }
    /**
    * Sets if this item is required. If true, then validations will fail if they are not specified
    * @returns {SchemaItem}
    */
    setRequired(val) {
        this._required = val;
        return this;
    }
    /**
    * Gets if this item represents a unique value in the database. An example might be a username
    * @returns {boolean}
    */
    getUnique() { return this._unique; }
    /**
    * Sets if this item represents a unique value in the database. An example might be a username
    * @returns {SchemaItem}
    */
    setUnique(val) {
        this._unique = val;
        return this;
    }
    /**
    * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
    * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
    * a given project. In this case the project item is set as a uniqueIndexer
    * @returns {boolean}
    */
    getUniqueIndexer() { return this._uniqueIndexer; }
    /**
    * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
    * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
    * a given project. In this case the project item is set as a uniqueIndexer
    * @returns {SchemaItem}
    */
    setUniqueIndexer(val) {
        this._uniqueIndexer = val;
        return this;
    }
    /**
    * Gets if this item is sensitive
    * @returns {boolean}
    */
    getSensitive() {
        return this._sensitive;
    }
    /**
    * Gets if this item has been edited since its creation
    * @returns {boolean}
    */
    getModified() {
        return this._modified;
    }
    /**
    * Sets if this item is sensitive
    * @returns {SchemaItem<T>}
    */
    setSensitive(val) {
        this._sensitive = val;
        return this;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>}
    */
    validate() {
        return Promise.resolve(true);
    }
    /**
     * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param {ModelInstance<T  extends Modepress.IModelEntry>} instance The model instance that was inserted or updated
     * @param {string} collection The DB collection that the model was inserted into
     */
    postUpsert(instance, collection) {
        return __awaiter(this, void 0, Promise, function* () {
            return Promise.resolve();
        });
    }
    /**
    * Called after a model instance is deleted. Useful for any schema item cleanups.
    * @param {ModelInstance<T>} instance The model instance that was deleted
    * @param {string} collection The DB collection that the model was deleted from
    */
    postDelete(instance, collection) {
        return __awaiter(this, void 0, Promise, function* () {
            return Promise.resolve();
        });
    }
    /**
    * Gets the value of this item in a database safe format
    * @returns {T}
    */
    getDbValue() {
        return this.value;
    }
    /**
    * Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<T>}
    */
    getValue(options) {
        return __awaiter(this, void 0, Promise, function* () {
            return this.value;
        });
    }
    /**
    * Sets the value of this item
    * @param {T} val The value to set
    * @returns {SchemaValue}
    */
    setValue(val) {
        this._modified = true;
        return this.value = val;
    }
}
exports.SchemaItem = SchemaItem;
