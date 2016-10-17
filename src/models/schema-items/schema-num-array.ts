import { SchemaItem } from "./schema-item";
import { ISchemaOptions } from "modepress-api";
import { NumberType } from "./schema-number";

/**
* A number array scheme item for use in Models
*/
export class SchemaNumArray extends SchemaItem<Array<number>>
{
    public minItems: number;
    public maxItems: number;
    public min: number;
    public max: number;
    public type: NumberType;
    public decimalPlaces: number;

	/**
	* Creates a new schema item that holds an array of number items
	* @param {string} name The name of this item
	* @param {Array<number>} val The number array of this schema item
    * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
    * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
    * @param {number} min [Optional] Specify the minimum a number can be
	* @param {number} max [Optional] Specify the maximum a number can be
    * @param {NumberType} type [Optional] What type of numbers to expect
    * @param {number} decimalPlaces [Optional] The number of decimal places to use if the type is a Float
	*/
    constructor( name: string, val: Array<number>, minItems: number = 0, maxItems: number = Infinity, min: number = -Infinity, max: number = Infinity, type: NumberType = NumberType.Integer, decimalPlaces: number = 2 ) {
        super( name, val );
        this.max = max;
        this.min = min;
        this.maxItems = maxItems;
        this.minItems = minItems;
        this.type = type;

        if ( decimalPlaces > 20 )
            throw new Error( `Decimal palces for ${name} cannot be more than 20` );

        this.decimalPlaces = decimalPlaces;

    }

	/**
	* Creates a clone of this item
	* @returns {SchemaNumArray} copy A sub class of the copy
	* @returns {SchemaNumArray}
	*/
    public clone( copy?: SchemaNumArray ): SchemaNumArray {
        copy = copy === undefined ? new SchemaNumArray( this.name, this.value ) : copy;
        super.clone( copy );

        copy.max = this.max;
        copy.min = this.min;
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        copy.type = this.type;
        copy.decimalPlaces = this.decimalPlaces;
        return copy;
    }

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {Promise<boolean|Error>}
	*/
    public validate(): Promise<boolean | Error> {
        var transformedValue = this.value;
        var max = this.max;
        var min = this.min;
        var type = this.type;
        var temp: number;
        var decimalPlaces = this.decimalPlaces;

        for ( var i = 0, l = transformedValue.length; i < l; i++ ) {
            if ( type == NumberType.Integer )
                temp = parseInt( transformedValue.toString() );
            else
                temp = parseFloat(( parseFloat( transformedValue.toString() ).toFixed( decimalPlaces ) ) );

            if ( temp < min || temp > max )
                return Promise.reject<Error>( new Error( `The value of ${this.name} is not within the range of ${this.min} and ${this.max}` ) );

            transformedValue[ i ] = temp;
        }

        if ( transformedValue.length < this.minItems )
            return Promise.reject<Error>( new Error( `You must select at least ${this.minItems} item${( this.minItems == 1 ? "" : "s" )} for ${this.name}` ) );
        if ( transformedValue.length > this.maxItems )
            return Promise.reject<Error>( new Error( `You have selected too many items for ${this.name}, please only use up to ${this.maxItems}` ) );

        return Promise.resolve( true );
    }
}