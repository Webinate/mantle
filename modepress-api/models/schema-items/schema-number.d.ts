import { SchemaItem } from './schema-item';
import { INumOptions, NumType } from '../../types/interfaces/i-schema-options';
/**
 * A numeric schema item for use in Models
 */
export declare class SchemaNumber extends SchemaItem<number> {
    min: number;
    max: number;
    type: NumType;
    decimalPlaces: number;
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The default value of this item
     */
    constructor(name: string, val: number, options?: INumOptions);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     */
    clone(copy?: SchemaNumber): SchemaNumber;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
}
