import {SchemaItem} from "./SchemaItem";

/**
* A text scheme item for use in Models
*/
export class SchemaTextArray extends SchemaItem<Array<string>>
{
    public minCharacters: number;
    public maxCharacters: number;

	/**
	* Creates a new schema item that holds an array of text items
	* @param {string} name The name of this item
	* @param {Array<string>} val The text array of this schema item
    * @param {number} minCharacters [Optional] Specify the minimum number of characters for each text item
	* @param {number} maxCharacters [Optional] Specify the maximum number of characters for each text item
    * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
	*/
    constructor(name: string, val: Array<string>, minCharacters: number = 0, maxCharacters: number = 10000, sensitive: boolean = false)
    {
        super(name, val, sensitive);
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
	}

	/**
	* Creates a clone of this item
	* @returns {SchemaTextArray} copy A sub class of the copy
	* @returns {SchemaTextArray}
	*/
    public clone(copy?: SchemaTextArray): SchemaTextArray
	{
        copy = copy === undefined ? new SchemaTextArray(this.name, this.value) : copy;
		super.clone(copy);

        copy.maxCharacters = this.maxCharacters;
        copy.minCharacters = this.minCharacters;
		return copy;
	}

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
	{
        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;
        var transformedValue = this.value;

        for (var i = 0, l = transformedValue.length; i < l; i++)
        {
            if (transformedValue[i].length > maxCharacters)
                return `The character length of '${transformedValue[i]}' in ${this.name} is too long, please keep it below ${maxCharacters}`;
            else if (transformedValue[i].length < minCharacters)
                return `The character length of '${transformedValue[i]}' in ${this.name} is too short, please keep it above ${minCharacters}`;
        }

        return true;
    }

    /**
	* Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
	*/
    public getValue(sanitize: boolean = false): Array<string>
    {
        if (this.sensitive && sanitize)
            return [];
        else
            return this.value;
    }
}