import { SchemaItem } from './schema-item';
import { NumType, INumArrOptions } from '../../types/interfaces/i-schema-options';
/**
 * A number array scheme item for use in Models
 */
export declare class SchemaNumArray extends SchemaItem<Array<number>> {
    minItems: number;
    maxItems: number;
    min: number;
    max: number;
    type: NumType;
    decimalPlaces: number;
    /**
     * Creates a new schema item that holds an array of number items
     * @param name The name of this item
     * @param val The number array of this schema item
     */
    constructor(name: string, val: Array<number>, options?: INumArrOptions);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     */
    clone(copy?: SchemaNumArray): SchemaNumArray;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
}
