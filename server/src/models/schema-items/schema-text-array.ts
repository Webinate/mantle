import {SchemaItem} from "./schema-item";
import sanitizeHtml = require("sanitize-html");

/**
* A text scheme item for use in Models
*/
export class SchemaTextArray extends SchemaItem<Array<string>>
{
    public minItems: number;
    public maxItems: number;
    public minCharacters: number;
    public maxCharacters: number;

	/**
	* Creates a new schema item that holds an array of text items
	* @param {string} name The name of this item
	* @param {Array<string>} val The text array of this schema item
    * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
    * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
    * @param {number} minCharacters [Optional] Specify the minimum number of characters for each text item
	* @param {number} maxCharacters [Optional] Specify the maximum number of characters for each text item
	*/
    constructor(name: string, val: Array<string>, minItems: number = 0, maxItems: number = 10000, minCharacters: number = 0, maxCharacters: number = 10000)
    {
        super(name, val);
        this.maxCharacters = maxCharacters;
        this.minCharacters = minCharacters;
        this.maxItems = maxItems;
        this.minItems = minItems;
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
        var toRemove = [];
        for (var i = 0, l = transformedValue.length; i < l; i++)
        {
            transformedValue[i] = sanitizeHtml(transformedValue[i].trim(), { allowedTags: [] });

            if (transformedValue[i].trim() == "")
                toRemove.push(i);
        }

        // Remove any "" cells
        for (var i = toRemove.length - 1; i >= 0; i--)
            transformedValue.splice(toRemove[i], 1);

        var maxCharacters = this.maxCharacters;
        var minCharacters = this.minCharacters;


        if (transformedValue.length < this.minItems)
            return `You must select at least ${this.minItems} item${(this.minItems == 1 ? "" : "s") } for ${this.name}`;
        if (transformedValue.length > this.maxItems)
            return `You have selected too many items for ${this.name}, please only use up to ${this.maxItems}`;

        for (var i = 0, l = transformedValue.length; i < l; i++)
        {
            transformedValue[i] = transformedValue[i].trim();
            if (transformedValue[i].length > maxCharacters)
                return `The character length of '${transformedValue[i]}' in ${this.name} is too long, please keep it below ${maxCharacters}`;
            else if (transformedValue[i].length < minCharacters)
                return `The character length of '${transformedValue[i]}' in ${this.name} is too short, please keep it above ${minCharacters}`;
        }

        return true;
    }

    /**
	* Gets the value of this item
    * @returns {Array<string>}
	*/
    public getValue(): Array<string>
    {
        return this.value;
    }
}