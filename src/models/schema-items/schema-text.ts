import { SchemaItem } from "./schema-item";
import { ISchemaOptions } from "modepress-api";
import sanitizeHtml = require( "sanitize-html" );

/**
 * A text scheme item for use in Models
 */
export class SchemaText extends SchemaItem<string>
{
    public minCharacters: number;
    public maxCharacters: number;
    public htmlClean: boolean;

	/**
	 * Creates a new schema item
	 * @param name The name of this item
	 * @param val The text of this item
     * @param minCharacters [Optional] Specify the minimum number of characters for use with this text item
	 * @param maxCharacters [Optional] Specify the maximum number of characters for use with this text item
     * @param htmlClean [Optional] If true, the text is cleaned of HTML before insertion. The default is true
	 */
    constructor( name: string, val: string, minCharacters: number = 0, maxCharacters: number = 10000, htmlClean: boolean = true ) {
        super( name, val );
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
        this.htmlClean = htmlClean;
    }

	/**
	 * Creates a clone of this item
	 * @returns copy A sub class of the copy
	 * @returns
	 */
    public clone( copy?: SchemaText ): SchemaText {
        copy = copy === undefined ? new SchemaText( this.name, <string>this.value ) : copy;
        super.clone( copy );

        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
        copy.htmlClean = this.htmlClean;
        return copy;
    }

	/**
	 * Checks the value stored to see if its correct in its current form
	 */
    public validate(): Promise<boolean | Error> {
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        this.value = this.value || "";
        var transformedValue = "";

        if ( this.htmlClean )
            transformedValue = sanitizeHtml( this.value.trim(), { allowedTags: [] });
        else
            transformedValue = this.value.trim();

        this.value = transformedValue;

        if ( transformedValue.length < minCharacters && minCharacters == 1 )
            return Promise.reject<Error>( new Error( `${this.name} cannot be empty` ) );
        if ( transformedValue.length > maxCharacters )
            return Promise.reject<Error>( new Error( `The character length of ${this.name} is too long, please keep it below ${maxCharacters}` ) );
        else if ( transformedValue.length < minCharacters )
            return Promise.reject<Error>( new Error( `The character length of ${this.name} is too short, please keep it above ${minCharacters}` ) );
        else
            return Promise.resolve( true );
    }
}