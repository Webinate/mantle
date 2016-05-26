"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const schema_item_1 = require("./schema-item");
const model_1 = require("../model");
const mongodb_1 = require("mongodb");
const utils_1 = require("../../utils");
const schema_id_array_1 = require("./schema-id-array");
/**
 * Represents a mongodb ObjectID of a document in separate collection.
 * Foreign keys are used as a way of relating models to one another. They can be required or optional.
 * Required keys will mean that the current document cannot exist if the target does not. Optional keys
 * will simply be nullified if the target no longer exists.
 */
class SchemaForeignKey extends schema_item_1.SchemaItem {
    /**
    * Creates a new schema item
    * @param {string} name The name of this item
    * @param {string} val The string representation of the foreign key's _id
    * @param {string} targetCollection The name of the collection to which the target exists
    * @param {boolean} optionalKey If true, then this key will only be nullified if the target is removed
    */
    constructor(name, val, targetCollection, optionalKey = false) {
        super(name, val);
        this.targetCollection = targetCollection;
        this.optionalKey = optionalKey;
        this.curLevel = 1;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaForeignKey} copy A sub class of the copy
    * @returns {SchemaForeignKey}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaForeignKey(this.name, this.value, this.targetCollection) : copy;
        super.clone(copy);
        copy.optionalKey = this.optionalKey;
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>}
    */
    validate() {
        return __awaiter(this, void 0, Promise, function* () {
            var transformedValue = this.value;
            // If they key is required then it must exist
            var model = model_1.Model.getByName(this.targetCollection);
            if (!model)
                throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);
            if (typeof this.value == "string") {
                if (utils_1.Utils.isValidObjectID(this.value))
                    transformedValue = this.value = new mongodb_1.ObjectID(this.value);
                else if (this.value.trim() != "")
                    throw new Error(`Please use a valid ID for '${this.name}'`);
                else
                    transformedValue = null;
            }
            if (!transformedValue)
                this.value = null;
            if (!this.optionalKey && !this.value)
                throw new Error(`${this.name} does not exist`);
            // We can assume the value is object id by this point
            var result = yield model.findOne({ _id: this.value });
            if (!this.optionalKey && !result)
                throw new Error(`${this.name} does not exist`);
            this._targetDoc = result;
            return true;
        });
    }
    /**
     * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param {ModelInstance<T  extends Modepress.IModelEntry>} instance The model instance that was inserted or updated
     * @param {string} collection The DB collection that the model was inserted into
     */
    postUpsert(instance, collection) {
        return __awaiter(this, void 0, Promise, function* () {
            if (!this._targetDoc)
                return;
            // If they key is required then it must exist
            var model = model_1.Model.getByName(this.targetCollection);
            var optionalDeps = this._targetDoc.dbEntry._optionalDependencies;
            var requiredDeps = this._targetDoc.dbEntry._requiredDependencies;
            // Now we need to register the schemas source with the target model
            if (this.optionalKey) {
                if (!optionalDeps)
                    optionalDeps = [];
                optionalDeps.push({ _id: instance.dbEntry._id, collection: collection, propertyName: this.name });
            }
            else {
                if (!requiredDeps)
                    requiredDeps = [];
                requiredDeps.push({ _id: instance.dbEntry._id, collection: collection });
            }
            yield model.collection.updateOne({ _id: this._targetDoc.dbEntry._id }, {
                $set: {
                    _optionalDependencies: optionalDeps,
                    _requiredDependencies: requiredDeps
                }
            });
            // Nullify the target doc cache
            this._targetDoc = null;
            return;
        });
    }
    /**
    * Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<ObjectID | Modepress.IModelEntry>}
    */
    getValue(options) {
        return __awaiter(this, void 0, Promise, function* () {
            if (options.expandForeignKeys && options.expandMaxDepth === undefined)
                throw new Error("You cannot set expandForeignKeys and not specify the expandMaxDepth");
            if (!options.expandForeignKeys)
                return this.value;
            if (options.expandSchemaBlacklist && options.expandSchemaBlacklist.indexOf(this.name) != -1)
                return this.value;
            var model = model_1.Model.getByName(this.targetCollection);
            if (!model)
                throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);
            if (!this.value)
                return null;
            // Make sure the current level is not beyond the max depth
            if (options.expandMaxDepth !== undefined) {
                if (this.curLevel > options.expandMaxDepth)
                    return this.value;
            }
            var result = yield model.findOne({ _id: this.value });
            // Get the models items are increase their level - this ensures we dont go too deep
            var items = result.schema.getItems();
            var nextLevel = this.curLevel + 1;
            for (var i = 0, l = items.length; i < l; i++)
                if (items[i] instanceof SchemaForeignKey || items[i] instanceof schema_id_array_1.SchemaIdArray)
                    items[i].curLevel = nextLevel;
            return yield result.schema.getAsJson(result.dbEntry._id, options);
        });
    }
}
exports.SchemaForeignKey = SchemaForeignKey;
