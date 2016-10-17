import { SchemaItem } from "./schema-item";
import { ISchemaOptions } from "modepress-api";
import sanitizeHtml = require( "sanitize-html" );

/**
* An html scheme item for use in Models
*/
export class SchemaHtml extends SchemaItem<string>
{
    /**
     * The default tags allowed
     * includes: h3, h4, h5, h6, blockquote, p, a, ul, ol,
     *    nl, li, b, i, strong, em, strike, code, hr, br, div,
     *    table, thead, caption, tbody, tr, th, td, pre
     */
    public static defaultTags: Array<string> = [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'iframe',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre' ];

    /**
     * The default allowed attributes for each tag
     */
    public static defaultAllowedAttributes: { [ name: string ]: Array<string> } = {
        a: [ 'href', 'name', 'target' ],
        img: [ 'src' ]
    };

    public allowedTags: Array<string>;
    public allowedAttributes: { [ name: string ]: Array<string> };
    public errorBadHTML: boolean;
    public minCharacters: number;
    public maxCharacters: number;

	/**
 	 * Creates a new schema item
 	 * @param name The name of this item
	 * @param val The text of this item
     * @param allowedTags The tags allowed by the html parser
     * @param allowedAttributes The attributes allowed by each attribute
     * @param errorBadHTML If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you
     * @param minCharacters [Optional] Specify the minimum number of characters for use with this text item
	 * @param maxCharacters [Optional] Specify the maximum number of characters for use with this text item
	 */
    constructor( name: string, val: string, allowedTags: Array<string> = SchemaHtml.defaultTags,
        allowedAttributes: { [ name: string ]: Array<string> } = SchemaHtml.defaultAllowedAttributes,
        errorBadHTML: boolean = true, minCharacters: number = 0, maxCharacters: number = 10000 ) {
        super( name, val );

        this.errorBadHTML = errorBadHTML;
        this.allowedAttributes = allowedAttributes;
        this.allowedTags = allowedTags;
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
    }

	/**
	 * Creates a clone of this item
	 * @returns copy A sub class of the copy
	 */
    public clone( copy?: SchemaHtml ): SchemaHtml {
        copy = copy === undefined ? new SchemaHtml( this.name, <string>this.value ) : copy;
        super.clone( copy );
        copy.allowedTags = this.allowedTags.slice( 0, this.allowedTags.length );
        copy.allowedAttributes = this.allowedAttributes;
        copy.errorBadHTML = this.errorBadHTML;
        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
        return copy;
    }

	/**
	 * Checks the value stored to see if its correct in its current form
	 * @returns Returns true if successful or an error message string if unsuccessful
	 */
    public validate(): Promise<boolean | Error> {
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        var transformedValue = this.value.trim();

        if ( transformedValue.length < minCharacters && minCharacters == 1 )
            return Promise.reject<Error>( new Error( `'${this.name}' cannot be empty` ) );
        else if ( transformedValue.length > maxCharacters )
            return Promise.reject<Error>( new Error( `The character length of '${this.name}' is too long, please keep it below ${maxCharacters}` ) );
        else if ( transformedValue.length < minCharacters )
            return Promise.reject<Error>( new Error( `The character length of '${this.name}' is too short, please keep it above ${minCharacters}` ) );

        var sanitizedHTML = sanitizeHtml( this.value, { allowedAttributes: this.allowedAttributes, allowedTags: this.allowedTags }).trim();
        if ( this.errorBadHTML && transformedValue != sanitizedHTML )
            return Promise.reject<Error>( new Error( `'${this.name}' has html code that is not allowed` ) );

        this.value = sanitizedHTML;
        return Promise.resolve( true );
    }
}