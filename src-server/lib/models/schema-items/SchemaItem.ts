/**
* A definition of each item in the model
*/
export class SchemaItem<T>
{
	public name: string;
    public value: T;
    public sensitive: boolean;
    private _unique: boolean;

    constructor(name: string, value: T, sensitive: boolean)
	{
		this.name = name;
        this.value = value;
        this.sensitive = sensitive;
        this._unique = false;
	}

	/**
	* Creates a clone of this item
	* @returns {SchemaItem} copy A sub class of the copy
	* @returns {SchemaItem}
	*/
    public clone(copy?: SchemaItem<T>): SchemaItem<T>
    {
        copy = copy === undefined ? new SchemaItem(this.name, this.value, this.sensitive) : copy;
        copy._unique = this._unique;
		return copy;
    }

    /**
	* Gets or sets if this item represents a unique value in the database. An example might be a username
	* @returns {boolean}
	*/
    public unique(val?: boolean): boolean
    {
        if (val === undefined)
            return this._unique;

        this._unique = val;
        return val;
    }

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
	public validate(): boolean | string
	{
		return true;
    }

    /**
	* Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
	*/
    public getValue(sanitize: boolean = false): T
    {
        return this.value;
    }
}