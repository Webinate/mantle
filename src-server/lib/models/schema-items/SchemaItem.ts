/**
* A definition of each item in the model
*/
export class SchemaItem<T>
{
	public name: string;
    public value: T;
    public sensitive: boolean;
    private _unique: boolean;
    private _indexable: boolean;

    constructor(name: string, value: T, sensitive: boolean)
	{
		this.name = name;
        this.value = value;
        this.sensitive = sensitive;
        this._unique = false;
        this._indexable = false;
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
        copy.sensitive = this.sensitive;
		return copy;
    }

    /**
    * Gets if this item is indexable by mongodb
    * @returns {boolean}
    */
    public getIndexable(): boolean { return this._indexable; }

    /**
	* Gets if this item represents a unique value in the database. An example might be a username
	* @returns {boolean}
	*/
    public getUnique(): boolean{  return this._unique; }

    /**
    * Sets if this item is indexable by mongodb
    * @returns {SchemaItem}
    */
    public setIndexable(val?: boolean): SchemaItem<T>
    {
        this._indexable = val;
        return this;
    }

    /**
	* Sets if this item represents a unique value in the database. An example might be a username
	* @returns {SchemaItem}
	*/
    public setUnique(val?: boolean): SchemaItem<T>
    {
        this._unique = val;
        return this;
    }

    /**
    * Gets if this item is sensitive
    * @returns {boolean}
    */
    public getSensitive(): boolean
    {
        return this.sensitive;
    }

    /**
    * Sets if this item is sensitive
    * @returns {SchemaItem<T>}
    */
    public setSensitive(val: boolean): SchemaItem<T>
    {
        this.sensitive = val;
        return this;
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