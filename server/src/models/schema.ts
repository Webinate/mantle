import {SchemaItem} from "./schema-items/schema-item";
import {SchemaForeignKey} from "./schema-items/schema-foreign-key";
import * as mongodb from "mongodb"
import {ModelInstance, Model} from "./model"
import {IModelEntry, ISchemaOptions} from "modepress-api";

/**
* Gives an overall description of each property in a model
*/
export class Schema
{
	private _items: Array<SchemaItem<any>>;

	constructor()
	{
		this._items = [];
	}

	/**
	* Creates a copy of the schema
	* @returns {Schema}
	*/
	public clone(): Schema
	{
		var items = this._items;
		var copy = new Schema();

		for (var i = 0, l = items.length; i < l; i++)
			copy._items.push(items[i].clone());

		return copy;
    }

    /**
	* Sets a schema value by name
	* @param {any} data The data object we are setting
	*/
    set(data: any)
    {
        var items = this._items,
            l = items.length;

        for (var i in data)
        {
            for (var ii = 0; ii < l; ii++)
                if (items[ii].name == i)
                    items[ii].setValue( data[i] );
        }
    }

	/**
	* Sets a schema value by name
	* @param {string} name The name of the schema item
	* @param {any} val The new value of the item
	*/
	setVal(name: string, val: any)
	{
		var items = this._items;

		for (var i = 0, l = items.length; i < l; i++)
            if (items[i].name == name)
                items[i].setValue( val );
	}

	/**
	* De-serializes the schema items from the mongodb data entry.
    * I.e. the data is the document from the DB and the schema item sets its values from the document
	* @param {any} data
	*/
	public deserialize(data: any): any
	{
		for (var i in data)
			this.setVal(i, data[i]);
	}

	/**
	* Serializes the schema items into the JSON format for mongodb
	* @returns {any}
	*/
	public serialize(): any
	{
		var toReturn = {};
		var items = this._items;

		for (var i = 0, l = items.length; i < l; i++)
            toReturn[items[i].name] = items[i].getDbValue();

		return toReturn;
    }

    /**
	* Serializes the schema items into a JSON
    * @param {boolean} verbose If true all items will be serialized, if false, only the items that are non-sensitive
    * @param {ObjectID} id The models dont store the _id property directly, and so this has to be passed for serialization
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
	* @returns {Promise<T>}
	*/
    public getAsJson<T>( verbose: boolean, id: mongodb.ObjectID, options? : ISchemaOptions ): Promise<T>
    {
        var that = this;

        return  new Promise<T>(function( resolve, reject ) {

            var toReturn : T = <any>{};
            var items = that._items;
            var fKey : SchemaForeignKey;
            var model : Model;

            var promises: Array<Promise<any>> = [];
            var promiseOrder: Array<string> = [];

            (<IModelEntry>toReturn)._id = id;

            for (var i = 0, l = items.length; i < l; i++)
            {
                // If this data is sensitive and the request must be sanitized
                // then skip the item
                if ( items[i].getSensitive() && verbose == false )
                    continue;

                var itemValue = items[i].getValue(options);

                // If its a promise - then add the promise to the promise array
                if (itemValue instanceof Promise)
                {
                    promises.push(itemValue);

                    // Keep track of the item name in an array so we can fetch it later
                    promiseOrder.push(items[i].name);
                }
                else
                    toReturn[items[i].name] = itemValue;
            }

            // Wait for all the promises to resolve
            Promise.all(promises).then(function(returns) {

                // Assign the promise values
                for ( var i = 0, l = returns.length; i < l; l++ )
                    toReturn[ promiseOrder[i] ] = returns[i];

                resolve(toReturn);

            }).catch(function(err: Error) {

                reject(err);
            });
        });
    }

	/**
	* Checks the values stored in the items to see if they are correct
	* @param {boolean} checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
    * @returns {Promise<bool>} Returns true if successful
	*/
	public validate( checkForRequiredFields: boolean ): Promise<Schema>
	{
		var items = this._items;
        var that = this;

        return new Promise(function( resolve, reject ) {

            var error = "";
            var promises : Array<Promise<any>> = [];

            for (var i = 0, l = items.length; i < l; i++)
            {
                if ( checkForRequiredFields && !items[i].getModified() && items[i].getRequired() )
                    return reject( new Error(`${items[i].name} is required`));

                promises.push(items[i].validate());
            }

            Promise.all(promises).then(function( validations ){
                return resolve(that);
            }).catch(function(err : Error){
                reject(err);
            });
        });
	}

	/**
	* Gets a schema item from this schema by name
	* @param {string} val The name of the item
	* @param {SchemaItem}
	*/
	public getByName(val: string): SchemaItem<any>
	{
		var items = this._items;
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
        if (val.name == "_id" )
			throw new Error(`You cannot use the schema item name _id as its a reserved keyword`);
        else if (val.name == "_requiredDependencies" )
			throw new Error(`You cannot use the schema item name _requiredDependencies as its a reserved keyword`);
        else if (val.name == "_optionalDependencies" )
			throw new Error(`You cannot use the schema item name _optionalDependencies as its a reserved keyword`);
		else if (this.getByName(val.name))
			throw new Error(`An item with the name ${val.name} already exists.`);

        this._items.push(val);
        return val;
	}

	/**
	* Removes a schema item from this schema
	* @param {SchemaItem|string} val The name of the item or the item itself
	*/
    public remove(val: SchemaItem<any>|string)
	{
		var items = this._items;
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

    /**
     * Gets the schema items associated with this schema
     * @returns {Array<SchemaItem<any>>}
     */
    public getItems(): Array<SchemaItem<any>>
    {
        return this._items;
    }
}