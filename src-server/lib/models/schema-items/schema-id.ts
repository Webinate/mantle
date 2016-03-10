import {SchemaItem} from "./schema-item";
import {ObjectID} from "mongodb";
import {Utils} from "../../utils"

/**
* A mongodb ObjectID scheme item for use in Models
*/
export class SchemaId extends SchemaItem<ObjectID | string>
{
	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {string} val The string representation of the object ID
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
	*/
    constructor(name: string, val: string, sensitive: boolean = false)
    {
        super(name, val, sensitive);
    }

	/**
	* Creates a clone of this item
	* @returns {SchemaId} copy A sub class of the copy
	* @returns {SchemaId}
	*/
    public clone(copy?: SchemaId): SchemaId
    {
        copy = copy === undefined ? new SchemaId(this.name, <string>this.value) : copy;
        super.clone(copy);
		return copy;
	}

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
    {
        var transformedValue = this.value;

        if (typeof this.value == "string")
        {
            if (Utils.isValidObjectID(<string>this.value))
                transformedValue = this.value = new ObjectID(<string>this.value);
            else if ((<string>this.value).trim() != "")
                return `Please use a valid ID for '${this.name}'`;
            else
                transformedValue = null;
        }

        if (!transformedValue)
        {
            this.value = null;
            return true;
        }

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
            return null;
        else if (!this.value)
            return null;
        else
            return <ObjectID>this.value;
    }
}