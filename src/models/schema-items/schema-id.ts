import { SchemaItem } from "./schema-item";
import { ISchemaOptions } from "modepress-api";
import { ObjectID } from "mongodb";
import { Utils } from "../../utils"

/**
* A mongodb ObjectID scheme item for use in Models
*/
export class SchemaId extends SchemaItem<ObjectID | string>
{
	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {string} val The string representation of the object ID
	*/
    constructor( name: string, val: string ) {
        super( name, val );
    }

	/**
	* Creates a clone of this item
	* @returns {SchemaId} copy A sub class of the copy
	* @returns {SchemaId}
	*/
    public clone( copy?: SchemaId ): SchemaId {
        copy = copy === undefined ? new SchemaId( this.name, <string>this.value ) : copy;
        super.clone( copy );
        return copy;
    }

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {Promise<boolean|Error>}
	*/
    public validate(): Promise<boolean | Error> {
        var transformedValue = this.value;

        if ( typeof this.value == "string" ) {
            if ( Utils.isValidObjectID( <string>this.value ) )
                transformedValue = this.value = new ObjectID( <string>this.value );
            else if ( ( <string>this.value ).trim() != "" )
                return Promise.reject<Error>( new Error( `Please use a valid ID for '${this.name}'` ) );
            else
                transformedValue = null;
        }

        if ( !transformedValue ) {
            this.value = null;
            return Promise.resolve( true );
        }

        return Promise.resolve( true );
    }
}