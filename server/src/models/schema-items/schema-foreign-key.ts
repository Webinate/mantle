import {SchemaItem} from "./schema-item";
import {ISchemaOptions} from "modepress-api";
import {Model} from "../Model";
import {ObjectID} from "mongodb";
import {Utils} from "../../utils"

/**
 * Represents a mongodb ObjectID of a document in separate collection.
 * Foreign keys are used as a way of relating models to one another. They can be required or optional.
 * Required keys will mean that the current document cannot exist if the target does not. Optional keys
 * will simply be nullified if the target no longer exists.
 */
export class SchemaForeignKey extends SchemaItem<ObjectID | string | Promise<any>>
{
    public targetCollection : string;
    public optionalKey : boolean;

	/**
	* Creates a new schema item
	* @param {string} name The name of this item
	* @param {string} val The string representation of the foreign key's _id
    * @param {string} targetCollection The name of the collection to which the target exists
    * @param {boolean} optionalKey If true, then this key will only be nullified if the target is removed
	*/
    constructor(name: string, val: string, targetCollection : string, optionalKey: boolean = false )
    {
        super(name, val);
        this.targetCollection = targetCollection;
        this.optionalKey = optionalKey;
    }

	/**
	* Creates a clone of this item
	* @returns {SchemaForeignKey} copy A sub class of the copy
	* @returns {SchemaForeignKey}
	*/
    public clone(copy?: SchemaForeignKey): SchemaForeignKey
    {
        copy = copy === undefined ? new SchemaForeignKey(this.name, <string>this.value, this.targetCollection) : copy;
        super.clone(copy);
        copy.optionalKey = this.optionalKey;
		return copy;
	}

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {Promise<boolean>}
	*/
	public validate(): Promise<boolean>
    {
        var transformedValue = this.value;

        if (typeof this.value == "string")
        {
            if (Utils.isValidObjectID(<string>this.value))
                transformedValue = this.value = new ObjectID(<string>this.value);
            else if ((<string>this.value).trim() != "")
                return Promise.reject( new Error( `Please use a valid ID for '${this.name}'`));
            else
                transformedValue = null;
        }

        if (!transformedValue)
        {
            this.value = null;
            return Promise.resolve(true);
        }

        return Promise.resolve(true);
    }

    /**
	* Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<any>}
	*/
    public getValue(options? : ISchemaOptions): ObjectID | Promise<any>
    {
        var that = this;

        if (!options.expandForeignKeys)
            return <ObjectID>this.value;
        else
        {
            return new Promise(function( resolve, reject )
            {
                var model = Model.getByName(that.targetCollection);
                if (model)
                {
                    model.collection.find({ _id : <ObjectID>that.value }).limit(1).next().then(function( result ) {
                        model.createInstance(result).then(function( instance ){

                            resolve(instance);

                        }).catch(function( err : Error ) {
                            reject(`An error occurred fetching the foreign key for ${that.name} : '${err.message}'`);
                        })
                    });
                }
                else
                    reject(new Error(`${that.name} references a foreign key '${that.targetCollection}' which doesn't seem to exist`));
            });
        }
    }
}