import {SchemaItem} from "./schema-item";

/**
* A bool scheme item for use in Models
*/
export class SchemaBool extends SchemaItem<boolean>
{
	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {boolean} val The value of this item
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
	*/
    constructor(name: string, val: boolean, sensitive: boolean = false)
    {
        super(name, val, sensitive);
	}

	/**
	* Creates a clone of this item
	* @returns {SchemaBool} copy A sub class of the copy
	* @returns {SchemaBool}
	*/
    public clone(copy?: SchemaBool): SchemaBool
    {
        copy = copy === undefined ? new SchemaBool(this.name, <boolean>this.value) : copy;
		super.clone(copy);
		return copy;
	}

	/**
	* Always true
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
	{
        var val = super.validate();
        if (!val)
            return false;

        return true;
    }

    /**
	* Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {boolean}
	*/
    public getValue(sanitize: boolean = false): boolean
    {
        if (this.sensitive && sanitize)
            return false;
        else
            return this.value;
    }
}