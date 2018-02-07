import { SchemaItem } from './schema-item';
import { ObjectID } from 'mongodb';
/**
 * A mongodb ObjectID scheme item for use in Models
 */
export declare class SchemaId extends SchemaItem<ObjectID | string | null> {
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The string representation of the object ID
     */
    constructor(name: string, val: string);
    /**
    * Creates a clone of this item
    * @returns copy A sub class of the copy
    */
    clone(copy?: SchemaId): SchemaId;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
}
