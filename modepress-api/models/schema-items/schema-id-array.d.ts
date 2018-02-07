import { ISchemaOptions } from '../../types/misc/i-schema-options';
import { IModelEntry } from '../../types/models/i-model-entry';
import { SchemaItem } from './schema-item';
import { ObjectID } from 'mongodb';
import { IIdArrOptions } from '../../types/interfaces/i-schema-options';
import { Schema } from '../schema';
export declare type IdTypes = string | ObjectID | IModelEntry;
/**
 * An ID array scheme item for use in Models. Optionally can be used as a foreign key array
 * and return objects of the specified ids. In order for the array to return objects you must
 * specify the targetCollection property. This tells the schema from which model the ids belong to.
 * Currently we only support Id lookups that exist in the same model - i.e. if the ids are of objects
 * in different models we cannot get the object values.
 */
export declare class SchemaIdArray extends SchemaItem<IdTypes[]> {
    targetCollection: string;
    minItems: number;
    maxItems: number;
    curLevel: number;
    private _targetDocs;
    /**
     * Creates a new schema item that holds an array of id items
     * @param name The name of this item
     * @param val The array of ids for this schema item
     * @param targetCollection Specify the model name to which all the ids belong. If set the item can expand objects on retreival.
     */
    constructor(name: string, val: Array<string>, targetCollection: string, options?: IIdArrOptions);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     */
    clone(copy?: SchemaIdArray): SchemaIdArray;
    /**
     * Checks the value stored to see if its correct in its current form
     * @returns Returns true if successful or an error message string if unsuccessful
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
     * @param instance The model instance that was deleted
     */
    postDelete(schema: Schema<IModelEntry>, collection: string): Promise<void>;
    /**
     * Gets the value of this item
     * @param options [Optional] A set of options that can be passed to control how the data must be returned
     */
    getValue(options: ISchemaOptions): Promise<Array<string | ObjectID | IModelEntry>>;
}
