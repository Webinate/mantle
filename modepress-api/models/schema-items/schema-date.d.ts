import { SchemaItem } from './schema-item';
import { IDateOptions } from '../../types/interfaces/i-schema-options';
/**
 * A date scheme item for use in Models
 */
export declare class SchemaDate extends SchemaItem<number> {
    useNow: boolean;
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The date of this item. If none is specified the Date.now() number is used.
     */
    constructor(name: string, val?: number, options?: IDateOptions);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     * @returns
     */
    clone(copy?: SchemaDate): SchemaDate;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
    /**
   * Gets the value of this item
   */
    getValue(): Promise<number>;
}
