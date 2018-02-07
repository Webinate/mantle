import { SchemaItem } from './schema-item';
import { IHtmlOptions } from '../../types/interfaces/i-schema-options';
/**
* An html scheme item for use in Models
*/
export declare class SchemaHtml extends SchemaItem<string> {
    /**
     * The default tags allowed
     * includes: h3, h4, h5, h6, blockquote, p, a, ul, ol,
     *    nl, li, b, i, strong, em, strike, code, hr, br, div,
     *    table, thead, caption, tbody, tr, th, td, pre
     */
    static defaultTags: Array<string>;
    /**
     * The default allowed attributes for each tag
     */
    static defaultAllowedAttributes: {
        [name: string]: Array<string>;
    };
    allowedTags: Array<string>;
    allowedAttributes: {
        [name: string]: Array<string>;
    };
    errorBadHTML: boolean;
    minCharacters: number;
    maxCharacters: number;
    /**
     * Creates a new schema item
     * @param name The name of this item
     * @param val The text of this item
     */
    constructor(name: string, val: string, options?: IHtmlOptions);
    /**
     * Creates a clone of this item
     * @returns copy A sub class of the copy
     */
    clone(copy?: SchemaHtml): SchemaHtml;
    /**
     * Checks the value stored to see if its correct in its current form
     * @returns Returns true if successful or an error message string if unsuccessful
     */
    validate(): Promise<boolean | Error>;
}
