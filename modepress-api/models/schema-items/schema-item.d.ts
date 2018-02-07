import { ISchemaOptions } from '../../types/misc/i-schema-options';
import { IModelEntry } from '../../types/models/i-model-entry';
import { Schema } from '../schema';
/**
 * A definition of each item in the model
 */
export declare class SchemaItem<T> {
    name: string;
    value: T;
    private _sensitive;
    private _unique;
    private _uniqueIndexer;
    private _indexable;
    private _required;
    private _modified;
    private _readOnly;
    constructor(name: string, value: T);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     */
    clone(copy?: SchemaItem<T>): SchemaItem<T>;
    /**
     * Gets if this item is indexable by mongodb
     */
    getIndexable(): boolean;
    /**
     * Sets if this item is indexable by mongodb
     */
    setIndexable(val: boolean): SchemaItem<T>;
    /**
     * Gets if this item is required. If true, then validations will fail if they are not specified
     */
    getRequired(): boolean;
    /**
     * Sets if this item is required. If true, then validations will fail if they are not specified
     */
    setRequired(val: boolean): SchemaItem<T>;
    /**
     * Gets if this item is read only. If true, then the value can only be set when the item is created
     * and any future updates are ignored
     */
    getReadOnly(): boolean;
    /**
     * Sets if this item is required. If true, then the value can only be set when the item is created
     * and any future updates are ignored
     */
    setReadOnly(val: boolean): SchemaItem<T>;
    /**
   * Gets if this item represents a unique value in the database. An example might be a username
   */
    getUnique(): boolean;
    /**
   * Sets if this item represents a unique value in the database. An example might be a username
   */
    setUnique(val: boolean): SchemaItem<T>;
    /**
     * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
     * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
     * a given project. In this case the project item is set as a uniqueIndexer
     */
    getUniqueIndexer(): boolean;
    /**
   * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
     * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
     * a given project. In this case the project item is set as a uniqueIndexer
   */
    setUniqueIndexer(val: boolean): SchemaItem<T>;
    /**
     * Gets if this item is sensitive
     */
    getSensitive(): boolean;
    /**
     * Gets if this item has been edited since its creation
     */
    getModified(): boolean;
    /**
     * Sets if this item is sensitive
     */
    setSensitive(val: boolean): SchemaItem<T>;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
    /**
     * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param collection The DB collection that the model was inserted into
     */
    postUpsert(schema: Schema<IModelEntry>, collection: string): Promise<void>;
    /**
     * Called after a model instance is deleted. Useful for any schema item cleanups.
     * @param collection The DB collection that the model was deleted from
     */
    postDelete(schema: Schema<IModelEntry>, collection: string): Promise<void>;
    /**
     * Gets the value of this item in a database safe format
     */
    getDbValue(): T;
    /**
     * Gets the value of this item
     * @param options [Optional] A set of options that can be passed to control how the data must be returned
     */
    getValue(options?: ISchemaOptions): Promise<T>;
    /**
     * Sets the value of this item
     * @param {T} val The value to set
     */
    setValue(val: T): T;
}
