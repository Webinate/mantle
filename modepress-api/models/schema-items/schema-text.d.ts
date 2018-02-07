import { SchemaItem } from './schema-item';
import { ITextOptions } from '../../types/interfaces/i-schema-options';
/**
 * A text scheme item for use in Models
 */
export declare class SchemaText extends SchemaItem<string> {
    minCharacters: number;
    maxCharacters: number;
    htmlClean: boolean;
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The text of this item
     * @param options Optional params
     */
    constructor(name: string, val: string, options?: ITextOptions);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     * @returns
     */
    clone(copy?: SchemaText): SchemaText;
    /**
     * Checks the value stored to see if its correct in its current form
     */
    validate(): Promise<boolean | Error>;
}
