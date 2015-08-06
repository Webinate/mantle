import {SchemaItem} from "./SchemaItem";
import {ObjectID} from "mongodb";

/**
* A mongodb ObjectID scheme item for use in Models
*/
export class SchemaId extends SchemaItem<ObjectID>
{
    private _str: string;

	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {string} val The string representation of the object ID
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
	*/
    constructor(name: string, val: string, sensitive: boolean = false)
    {
        this._str = val;

        if (this.isValidObjectID(val))
            super(name, new ObjectID(val), sensitive);
        else
            super(name, null, sensitive);
    }

    /**
	* Checks a string to see if its a valid mongo id
	* @param {string} str
    * @returns {boolean} True if the string is valid
	*/
    isValidObjectID(str: string): boolean
    {
        // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
        str = str.trim() + '';
        var len = str.length, valid = false;
        if (len == 12 || len == 24)
        {
            valid = /^[0-9a-fA-F]+$/.test(str);
        }

        return valid;
    }

	/**
	* Creates a clone of this item
	* @returns {SchemaId} copy A sub class of the copy
	* @returns {SchemaId}
	*/
    public clone(copy?: SchemaId): SchemaId
    {
        copy = copy === undefined ? new SchemaId(this.name, this._str) : copy;
        super.clone(copy);
		return copy;
	}

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
    {
        var transformedValue = <ObjectID>this.value;

        if (!transformedValue)
            return `Please use a valid ID for '${this.name}'`;
		else
			return true;
    }

    /**
	* Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
	*/
    public getValue(sanitize: boolean = false): ObjectID
    {
        if (this.sensitive && sanitize)
            return new ObjectID();
        else if (!this.value)
            return new ObjectID();
        else
            return this.value;
    }
}