import {SchemaItem} from "./schema-item";
import {ISchemaOptions} from "modepress-api";

/**
* A bool scheme item for use in Models
*/
export class SchemaBool extends SchemaItem<boolean>
{
	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {boolean} val The value of this item
	*/
    constructor(name: string, val: boolean)
    {
        super(name, val);
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
	* @returns {Promise<boolean>}
	*/
	public validate(): Promise<boolean>
	{
        var val = this.value;
        if (val === undefined)
            return Promise.reject( new Error(`${this.name} cannot be undefined` ) );
        if (val === null)
            return Promise.reject( new Error(`${this.name} cannot be null`));

        return Promise.resolve(true);
    }
}