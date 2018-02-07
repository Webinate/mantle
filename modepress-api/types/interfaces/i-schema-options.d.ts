export declare type ITextOptions = {
    /** Specify the minimum number of characters for use with this text item */
    minCharacters?: number;
    /** Specify the maximum number of characters for use with this text item */
    maxCharacters?: number;
    /** If true, the text is cleaned of HTML before insertion. The default is true */
    htmlClean?: boolean;
};
export declare type ITextArrOptions = {
    /** Specify the minimum number of items that can be allowed */
    minItems?: number;
    /** Specify the maximum number of items that can be allowed */
    maxItems?: number;
    /** Specify the minimum number of characters for each text item */
    minCharacters?: number;
    /** Specify the maximum number of characters for each text item */
    maxCharacters?: number;
};
export declare type NumType = 'Int' | 'Float';
export declare type INumOptions = {
    /** The minimum value the value can be */
    min?: number;
    /** The maximum value the value can be */
    max?: number;
    /** The type of number the schema represents */
    type?: NumType;
    /** The number of decimal places to use if the type is a Float */
    decimalPlaces?: number;
};
export declare type INumArrOptions = {
    /** Specify the minimum number of items that can be allowed */
    minItems?: number;
    /** Specify the maximum number of items that can be allowed */
    maxItems?: number;
    /** Specify the minimum a number can be */
    min?: number;
    /** Specify the maximum a number can be */
    max?: number;
    /** What type of numbers to expect */
    type?: 'Int' | 'Float';
    /** The number of decimal places to use if the type is a Float */
    decimalPlaces?: number;
};
export declare type IIdArrOptions = {
    /** Specify the minimum number of items that can be allowed */
    minItems?: number;
    /** Specify the maximum number of items that can be allowed */
    maxItems?: number;
};
export declare type IHtmlOptions = {
    /** The tags allowed by the html parser */
    allowedTags?: string[];
    /** The attributes allowed by each attribute */
    allowedAttributes?: {
        [name: string]: Array<string>;
    };
    /** If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you */
    errorBadHTML?: boolean;
    /** Specify the minimum number of characters for use with this text item */
    minCharacters?: number;
    /** Specify the maximum number of characters for use with this text item */
    maxCharacters?: number;
};
export declare type IForeignKeyOptions = {
    /** If true, then the key is allowed to be null */
    keyCanBeNull?: boolean;
    /**
     * Determines if the model can adapt to this item not being present.
     * If true, then item will be nullified if the target is removed.
     * If false, then the model instance will be removed as it cannot exist without the target item.
     */
    canAdapt?: boolean;
};
export declare type IDateOptions = {
    /** If true, the date will always be updated to use the current date */
    useNow?: boolean;
};
