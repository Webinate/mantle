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
const schema_foreign_key_1 = require("./schema-foreign-key");
const model_1 = require("../model");
const mongodb_1 = require("mongodb");
const utils_1 = require("../../utils");
/**
 * An ID array scheme item for use in Models. Optionally can be used as a foreign key array
 * and return objects of the specified ids. In order for the array to return objects you must
 * specify the targetCollection property. This tells the schema from which model the ids belong to.
 * Currently we only support Id lookups that exist in the same model - i.e. if the ids are of objects
 * in different models we cannot get the object values.
 */
class SchemaIdArray extends schema_item_1.SchemaItem {
    /**
     * Creates a new schema item that holds an array of id items
     * @param {string} name The name of this item
     * @param {Array<string|ObjectID>} val The array of ids for this schema item
     * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
     * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
     * @param {string} targetCollection [Optional] Specify the model name to which all the ids belong. If set
     * the item can expand objects on retreival.
     */
    constructor(name, val, minItems = 0, maxItems = 10000, targetCollection = "") {
        super(name, val);
        this.maxItems = maxItems;
        this.minItems = minItems;
        this.targetCollection = targetCollection;
        this.curLevel = 1;
    }
    /**
    * Creates a clone of this item
    * @returns {SchemaIdArray} copy A sub class of the copy
    * @returns {SchemaIdArray}
    */
    clone(copy) {
        copy = copy === undefined ? new SchemaIdArray(this.name, this.value) : copy;
        super.clone(copy);
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        copy.targetCollection = this.targetCollection;
        return copy;
    }
    /**
    * Checks the value stored to see if its correct in its current form
    * @returns {Promise<boolean|Error>} Returns true if successful or an error message string if unsuccessful
    */
    validate() {
        return __awaiter(this, void 0, Promise, function* () {
            var transformedValue = this.value;
            for (var i = 0, l = transformedValue.length; i < l; i++) {
                if (typeof this.value[i] == "string") {
                    if (utils_1.Utils.isValidObjectID(this.value[i]))
                        transformedValue[i] = new mongodb_1.ObjectID(this.value[i]);
                    else if (this.value[i].trim() != "")
                        throw new Error(`Please use a valid ID for '${this.name}'`);
                    else
                        throw new Error(`Please use a valid ID for '${this.name}'`);
                }
            }
            if (transformedValue.length < this.minItems)
                throw new Error(`You must select at least ${this.minItems} item${(this.minItems == 1 ? "" : "s")} for ${this.name}`);
            if (transformedValue.length > this.maxItems)
                throw new Error(`You have selected too many items for ${this.name}, please only use up to ${this.maxItems}`);
            // If no collection - then return
            if (this.targetCollection == "")
                return true;
            if (this.value.length == 0)
                return true;
            // If they collection is not empty, then it must exist
            var model = model_1.Model.getByName(this.targetCollection);
            if (!model)
                throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);
            // We can assume the value is object id by this point
            var query = { $or: [] };
            var arr = this.value;
            for (var i = 0, l = arr.length; i < l; i++)
                query.$or.push({ _id: arr[i] });
            var result = yield model.findInstances(query);
            this._targetDocs = result;
            return true;
        });
    }
    /**
     * Called once a schema has been validated and inserted into the database. Useful for
     * doing any post update/insert operations
     * @param {ModelInstance<T extends Modepress.IModelEntry>} instance The model instance that was inserted or updated
     * @param {string} collection The DB collection that the model was inserted into
     */
    postValidation(instance, collection) {
        return __awaiter(this, void 0, Promise, function* () {
            if (!this._targetDocs)
                return;
            // If they key is required then it must exist
            var model = model_1.Model.getByName(this.targetCollection);
            var promises = [];
            for (var i = 0, l = this._targetDocs.length; i < l; i++) {
                let arrDeps = this._targetDocs[i].dbEntry._arrayDependencies || [];
                arrDeps.push({ _id: instance.dbEntry._id, collection: collection, propertyName: this.name });
                promises.push(model.collection.updateOne({ _id: this._targetDocs[i].dbEntry._id }, {
                    $set: { _arrayDependencies: arrDeps }
                }));
            }
            yield Promise.all(promises);
            // Nullify the target doc cache
            this._targetDocs = null;
            return;
        });
    }
    /**
    * Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<Array<string | ObjectID | Modepress.IModelEntry>>}
    */
    getValue(options) {
        return __awaiter(this, void 0, Promise, function* () {
            if (options.expandForeignKeys && options.expandMaxDepth === undefined)
                throw new Error("You cannot set expandForeignKeys and not specify the expandMaxDepth");
            if (!options.expandForeignKeys)
                return this.value;
            if (options.expandSchemaBlacklist && options.expandSchemaBlacklist.indexOf(this.name) != -1)
                return this.value;
            if (this.targetCollection == "")
                return this.value;
            var model = model_1.Model.getByName(this.targetCollection);
            if (!model)
                throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);
            // Make sure the current level is not beyond the max depth
            if (options.expandMaxDepth !== undefined) {
                if (this.curLevel > options.expandMaxDepth)
                    return this.value;
            }
            if (this.value.length == 0)
                return this.value;
            // Create the query for fetching the instances
            var query = { $or: [] };
            for (var i = 0, l = this.value.length; i < l; i++)
                query.$or.push({ _id: this.value[i] });
            var instances = yield model.findInstances(query);
            var instance;
            var toReturn = [];
            var promises = [];
            // Get the models items are increase their level - this ensures we dont go too deep
            for (var i = 0, l = instances.length; i < l; i++) {
                instance = instances[i];
                var items = instance.schema.getItems();
                var nextLevel = this.curLevel + 1;
                for (var ii = 0, il = items.length; ii < il; ii++)
                    if (items[ii] instanceof schema_foreign_key_1.SchemaForeignKey || items[ii] instanceof SchemaIdArray)
                        items[ii].curLevel = nextLevel;
                promises.push(instance.schema.getAsJson(instance.dbEntry._id, options));
            }
            return yield Promise.all(promises);
        });
    }
}
exports.SchemaIdArray = SchemaIdArray;
