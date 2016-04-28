import {SchemaItem} from "./schema-item";
import {ISchemaOptions} from "modepress-api";

/**
* A date scheme item for use in Models
*/
export class SchemaDate extends SchemaItem<number>
{
    public useNow: boolean;

	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {number} val The date of this item. If none is specified the Date.now() number is used.
    * @param {boolean} useNow [Optional] If true, the date will always be updated to use the current date
	*/
    constructor(name: string, val?: number, useNow: boolean = false)
    {
        super(name, val);
        this.useNow = useNow;
	}

	/**
	* Creates a clone of this item
	* @returns {SchemaText} copy A sub class of the copy
	* @returns {SchemaText}
	*/
    public clone(copy?: SchemaDate): SchemaDate
    {
        copy = copy === undefined ? new SchemaDate(this.name, <number>this.value) : copy;
        copy.useNow = this.useNow;
		super.clone(copy);
		return copy;
	}

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {Promise<boolean>}
	*/
	public validate(): Promise<boolean>
    {
        if (this.useNow)
            this.value = Date.now();

		return Promise.resolve(true);
    }

    /**
	* Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {number}
	*/
    public getValue(options? : ISchemaOptions): number
    {
        return (this.value !== undefined && this.value !== null ? this.value : null );
    }
}