import {SchemaItem} from "./schema-item";
import sanitizeHtml = require("sanitize-html");

/**
* A json scheme item for use in Models
*/
export class SchemaJSON extends SchemaItem<any>
{
	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {any} val The text of this item
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
	*/
    constructor(name: string, val: any, sensitive: boolean = false)
    {
        super(name, val, sensitive);
	}

	/**
	* Creates a clone of this item
	* @returns {SchemaJSON} copy A sub class of the copy
	* @returns {SchemaJSON}
	*/
    public clone(copy?: SchemaJSON): SchemaJSON
	{
        copy = copy === undefined ? new SchemaJSON(this.name, this.value) : copy;
		super.clone(copy);
		return copy;
	}

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
    {
        if (this.value === undefined)
            this.value = null;

        return true;
    }

    /**
	* Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
	*/
    public getValue(sanitize: boolean = false): any
    {
        if (this.sensitive && sanitize)
            return {};
        else
            return this.value;
    }
}