import { SchemaItem } from './schema-item';
import { ObjectID } from 'mongodb';
import { isValidObjectID } from '../../utils/utils'

/**
 * A mongodb ObjectID scheme item for use in Models
 */
export class SchemaId extends SchemaItem<ObjectID | string | null> {
	/**
	 * Creates a new schema item
	 * @param name The name of this item
	 * @param val The string representation of the object ID
	 */
    constructor( name: string, val: string ) {
        super( name, val );
    }

	/**
	* Creates a clone of this item
	* @returns copy A sub class of the copy
	*/
    public clone( copy?: SchemaId ): SchemaId {
        copy = copy === undefined ? new SchemaId( this.name, <string>this.value ) : copy;
        super.clone( copy );
        return copy;
    }

	/**
	 * Checks the value stored to see if its correct in its current form
	 */
    public validate(): Promise<boolean | Error> {
        let transformedValue: string | ObjectID | null = this.value;

        if ( typeof this.value === 'string' ) {
            if ( isValidObjectID( <string>this.value ) )
                transformedValue = this.value = new ObjectID( <string>this.value );
            else if ( ( <string>this.value ).trim() !== '' )
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