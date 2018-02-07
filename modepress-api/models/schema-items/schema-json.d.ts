import { SchemaItem } from './schema-item';
/**
 * A json scheme item for use in Models
 */
export declare class SchemaJSON extends SchemaItem<any> {
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The text of this item
     */
    constructor(name: string, val: any);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     */
    clone(copy?: SchemaJSON): SchemaJSON;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
}
