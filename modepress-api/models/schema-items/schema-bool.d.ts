import { SchemaItem } from './schema-item';
/**
 * A bool scheme item for use in Models
 */
export declare class SchemaBool extends SchemaItem<boolean> {
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The value of this item
     */
    constructor(name: string, val: boolean);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
      */
    clone(copy?: SchemaBool): SchemaBool;
    /**
     * Always true
     */
    validate(): Promise<boolean | Error>;
}
