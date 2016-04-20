import {SchemaItem} from "./schema-item";
import sanitizeHtml = require("sanitize-html");
import {ObjectID} from "mongodb";
import {Utils} from "../../utils"

/**
* A n ID array scheme item for use in Models
*/
export class SchemaIdArray extends SchemaItem<Array<string | ObjectID>>
{
    public minItems: number;
    public maxItems: number;

	/**
	* Creates a new schema item that holds an array of id items
	* @param {string} name The name of this item
	* @param {Array<string|ObjectID>} val The array of ids for this schema item
    * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
    * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
	*/
    constructor(name: string, val: Array<string>, minItems: number = 0, maxItems: number = 10000)
    {
        super(name, val);
        this.maxItems = maxItems;
        this.minItems = minItems;
	}

	/**
	* Creates a clone of this item
	* @returns {SchemaIdArray} copy A sub class of the copy
	* @returns {SchemaIdArray}
	*/
    public clone(copy?: SchemaIdArray): SchemaIdArray
	{
        copy = copy === undefined ? new SchemaIdArray(this.name, <Array<string>>this.value) : copy;
		super.clone(copy);
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
		return copy;
	}

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
    {
        var transformedValue = this.value;

        for (var i = 0, l = transformedValue.length; i < l; i++)
        {
            if (typeof this.value[i] == "string")
            {
                if (Utils.isValidObjectID(<string>this.value[i]))
                    transformedValue[i] = new ObjectID(<string>this.value[i]);
                else if ((<string>this.value[i]).trim() != "")
                    return `Please use a valid ID for '${this.name}'`;
                else
                    return `Please use a valid ID for '${this.name}'`;
            }
        }


        if (transformedValue.length < this.minItems)
            return `You must select at least ${this.minItems} item${(this.minItems == 1 ? "" : "s") } for ${this.name}`;
        if (transformedValue.length > this.maxItems)
            return `You have selected too many items for ${this.name}, please only use up to ${this.maxItems}`;

        return true;
    }

    /**
	* Gets the value of this item
    * @returns {Array<string|ObjectID>}
	*/
    public getValue(): Array<string|ObjectID>
    {
        return this.value;
    }
}