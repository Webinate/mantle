import { ISchemaOptions } from '../types/misc/i-schema-options';
import { IModelEntry } from '../types/models/i-model-entry';
import { SchemaItem } from './schema-items/schema-item';
/**
 * Gives an overall description of each property in a model
 */
export declare class Schema<T extends IModelEntry> {
    private _items;
    dbEntry: T;
    constructor();
    /**
     * Creates a copy of the schema
     */
    clone(): Schema<T>;
    /**
     * Sets a schema value by name
     * @param data The data object we are setting
     * @param allowReadOnlyValues If true, then readonly values can be overwritten (Usually the case when the item is first created)
     */
    set(data: Partial<T>, allowReadOnlyValues: boolean): void;
    /**
     * Sets a schema value by name
     * @param name The name of the schema item
     * @param val The new value of the item
     */
    setVal(name: string, val: any): void;
    /**
      * De-serializes the schema items from the mongodb data entry.
       * I.e. the data is the document from the DB and the schema item sets its values from the document
     */
    deserialize(data: any): any;
    /**
     * Serializes the schema items into the JSON format for mongodb
     */
    serialize(): any;
    /**
     * Serializes the schema items into a JSON
     * @param options [Optional] A set of options that can be passed to control how the data must be returned
     */
    getAsJson(options: ISchemaOptions): Promise<T>;
    /**
     * Checks the values stored in the items to see if they are correct
     * @param checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
     */
    validate(checkForRequiredFields: boolean): Promise<this>;
    /**
     * Called after a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param collection The DB collection that the model was inserted into
     */
    postUpsert(collection: string): Promise<this>;
    /**
     * Called after a model instance is deleted. Useful for any schema item cleanups.
     * @param collection The DB collection that the model was deleted from
     */
    postDelete(collection: string): Promise<this>;
    /**
     * Gets a schema item from this schema by name
     * @param val The name of the item
     */
    getByName(val: string): SchemaItem<any> | null;
    /**
     * Adds a schema item to this schema
     * @param val The new item to add
     */
    add(val: SchemaItem<any>): SchemaItem<any>;
    /**
     * Removes a schema item from this schema
     * @param val The name of the item or the item itself
     */
    remove(val: SchemaItem<any> | string): void;
    /**
     * Gets the schema items associated with this schema
     */
    getItems(): Array<SchemaItem<any>>;
    /**
     * Gets a string representation of all fields that are unique
     */
    uniqueFieldNames(): string;
}
