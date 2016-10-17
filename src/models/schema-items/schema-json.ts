import { SchemaItem } from "./schema-item";
import { ISchemaOptions } from "modepress-api";
import sanitizeHtml = require( "sanitize-html" );

/**
 * A json scheme item for use in Models
 */
export class SchemaJSON extends SchemaItem<any>
{
	/**
	 * Creates a new schema item
	 * @param name The name of this item
	 * @param val The text of this item
	 */
    constructor( name: string, val: any ) {
        super( name, val );
    }

	/**
	 * Creates a clone of this item
	 * @returns copy A sub class of the copy
	 */
    public clone( copy?: SchemaJSON ): SchemaJSON {
        copy = copy === undefined ? new SchemaJSON( this.name, this.value ) : copy;
        super.clone( copy );
        return copy;
    }

	/**
	 * Checks the value stored to see if its correct in its current form
	 */
    public validate(): Promise<boolean | Error> {
        if ( this.value === undefined )
            this.value = null;

        return Promise.resolve( true );
    }
}