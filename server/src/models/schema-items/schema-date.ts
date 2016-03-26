import {SchemaItem} from "./schema-item";

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
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
    * @param {boolean} useNow [Optional] If true, the date will always be updated to use the current date
	*/
    constructor(name: string, val?: number, sensitive: boolean = false, useNow: boolean = false)
    {
        super(name, val, sensitive);
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
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
    {
        if (this.useNow)
            this.value = Date.now();

		return true;
    }

    /**
	* Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
	*/
    public getValue(sanitize: boolean = false): number
    {
        if (this.sensitive && sanitize)
            return 0;
        else
            return (this.value !== undefined && this.value !== null ? this.value : Date.now() );
    }
}