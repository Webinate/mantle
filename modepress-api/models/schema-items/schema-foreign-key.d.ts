import { ISchemaOptions } from '../../types/misc/i-schema-options';
import { IForeignKeyOptions } from '../../types/interfaces/i-schema-options';
import { IModelEntry } from '../../types/models/i-model-entry';
import { SchemaItem } from './schema-item';
import { ObjectID } from 'mongodb';
import { Schema } from '../schema';
export declare type FKeyValues = ObjectID | string | IModelEntry | null;
/**
 * Represents a mongodb ObjectID of a document in separate collection.
 * Foreign keys are used as a way of relating models to one another. They can be required or optional.
 * Required keys will mean that the current document cannot exist if the target does not. Optional keys
 * will simply be nullified if the target no longer exists.
 */
export declare class SchemaForeignKey extends SchemaItem<FKeyValues> {
    targetCollection: string;
    keyCanBeNull: boolean;
    canAdapt: boolean;
    curLevel: number;
    private _targetDoc;
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The string representation of the foreign key's _id
     * @param targetCollection The name of the collection to which the target exists
     */
    constructor(name: string, val: string, targetCollection: string, options?: IForeignKeyOptions);
    /**
     * Creates a clone of this item
     */
    clone(copy?: SchemaForeignKey): SchemaForeignKey;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
    /**
     * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param instance The model instance that was inserted or updated
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
    getValue(options: ISchemaOptions): Promise<FKeyValues>;
}
