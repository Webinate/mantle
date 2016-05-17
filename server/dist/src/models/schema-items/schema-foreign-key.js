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
            if (typeof this.value == "string") {
                if (utils_1.Utils.isValidObjectID(this.value))
                    transformedValue = this.value = new mongodb_1.ObjectID(this.value);
                else if (this.value.trim() != "")
                    return Promise.reject(new Error(`Please use a valid ID for '${this.name}'`));
                else
                    transformedValue = null;
            }
            if (!transformedValue) {
                this.value = null;
                return Promise.resolve(true);
            }
            else if (!this.optionalKey) {
                // If they key is required then it must exist
                var model = model_1.Model.getByName(this.targetCollection);
                if (model) {
                    var result = yield model.findOne({ _id: this.value });
                    if (!result)
                        throw new Error(`${this.name} does not exist`);
                }
                else
                    throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);
            }
            return true;
        });
    }
    /**
    * Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<ObjectID | Modepress.IModelEntry>}
    */
    getValue(options) {
        return __awaiter(this, void 0, Promise, function* () {
            if (!options.expandForeignKeys)
                return this.value;
            else {
                var model = model_1.Model.getByName(this.targetCollection);
                if (model) {
                    var result = yield model.findOne({ _id: this.value });
                    return yield result.schema.getAsJson(result.dbEntry._id, options);
                }
                else
                    throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);
            }
        });
    }
}
exports.SchemaForeignKey = SchemaForeignKey;
