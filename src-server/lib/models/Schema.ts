import {SchemaItem} from "./schema-items/SchemaItem";

/**
* Gives an overall description of each property in a model
*/
export class Schema
{
	public items: Array<SchemaItem<any>>;
	public error: string;

	constructor()
	{
		this.items = [];
		this.error = "";
	}
	
	/**
	* Creates a copy of the schema
	* @returns {Schema}
	*/
	public clone(): Schema
	{
		var items = this.items;
		var copy = new Schema();

		for (var i = 0, l = items.length; i < l; i++)
			copy.items.push(items[i].clone());

		return copy;
	}

	/**
	* Sets a schema value by name
	* @param {string} name The name of the schema item
	* @param {any} val The new value of the item
	*/
	set(name: string, val: any)
	{
		var items = this.items;
		
		for (var i = 0, l = items.length; i < l; i++)
			if (items[i].name == name)
				items[i].value = val;
	}

	/**
	* De-serializes the schema items from the mongodb data entry
	* @param {any} data
	*/
	public deserialize(data: any): any
	{
		for (var i in data)
			this.set(i, data[i]);
	}

	/**
	* Serializes the schema items into the JSON format for mongodb
	* @returns {any}
	*/
	public serialize(): any
	{
		var toReturn = {};
		var items = this.items;
		
		for (var i = 0, l = items.length; i < l; i++)
            toReturn[items[i].name] = items[i].getValue();

		return toReturn;
    }

    /**
	* Serializes the schema items into the JSON format for mongodb
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
	* @returns {any}
	*/
    public generateCleanData(sanitize: boolean): any
    {
        var toReturn = {};
        var items = this.items;

        for (var i = 0, l = items.length; i < l; i++)
            toReturn[items[i].name] = items[i].getValue(sanitize);

        return toReturn;
    }

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean} Returns true if successful
	*/
	public validate(): boolean
	{
		var items = this.items;
		this.error = "";

		for (var i = 0, l = items.length; i < l; i++)
		{
			var validated = items[i].validate();
			if (validated !== true)
			{
				this.error = <string>validated;
				return false;
			}
		}

		return true;
	}

	/**
	* Gets a schema item from this schema by name
	* @param {string} val The name of the item
	* @param {SchemaItem}
	*/
	public getByName(val: string): SchemaItem<any>
	{
		var items = this.items;
		for (var i = 0, l = items.length; i < l; i++)
			if (items[i].name == val)
				return items[i];

		return null;
	}

	/**
	* Adds a schema item to this schema
	* @param {SchemaItem} val The new item to add
    * @returns {SchemaItem}
	*/
    public add(val: SchemaItem<any>): SchemaItem<any>
	{
		if (this.getByName(val.name))
			throw new Error(`An item with the name ${val.name} already exists.`);

        this.items.push(val);
        return val;
	}

	/**
	* Removes a schema item from this schema
	* @param {SchemaItem|string} val The name of the item or the item itself
	*/
    public remove(val: SchemaItem<any>|string)
	{
		var items = this.items;
		var name = "";
        if (<SchemaItem<any>>val instanceof SchemaItem)
            name = (<SchemaItem<any>>val).name;

		for (var i = 0, l = items.length; i < l; i++)
			if (items[i].name == name)
			{
				items.splice(i, 1);
				return;
			}
	}
}