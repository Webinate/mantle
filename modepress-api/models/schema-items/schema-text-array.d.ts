import { SchemaItem } from './schema-item';
import { ITextArrOptions } from '../../types/interfaces/i-schema-options';
/**
 * A text scheme item for use in Models
 */
export declare class SchemaTextArray extends SchemaItem<Array<string>> {
    minItems: number;
    maxItems: number;
    minCharacters: number;
    maxCharacters: number;
    /**
     * Creates a new schema item that holds an array of text items
     * @param name The name of this item
     * @param val The text array of this schema item
     */
    constructor(name: string, val: Array<string>, options?: ITextArrOptions);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     * @returns
     */
    clone(copy?: SchemaTextArray): SchemaTextArray;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
}
