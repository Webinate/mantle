import {SchemaItem} from "./schema-item";
import {ISchemaOptions} from "modepress-api";
import {Model, ModelInstance} from "../model";
import {ObjectID} from "mongodb";
import {Utils} from "../../utils"

/**
 * Represents a mongodb ObjectID of a document in separate collection.
 * Foreign keys are used as a way of relating models to one another. They can be required or optional.
 * Required keys will mean that the current document cannot exist if the target does not. Optional keys
 * will simply be nullified if the target no longer exists.
 */
export class SchemaForeignKey extends SchemaItem<ObjectID | string | Modepress.IModelEntry>
{
    public targetCollection : string;
    public optionalKey : boolean;

    private _targetDoc : ModelInstance<Modepress.IModelEntry>;

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
	* @returns {Promise<boolean|Error>}
	*/
	public async validate(): Promise<boolean|Error>
    {
        var transformedValue = this.value;

        // If they key is required then it must exist
        var model = Model.getByName(this.targetCollection);

        if (!model)
            throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);

        if (typeof this.value == "string")
        {
            if (Utils.isValidObjectID(<string>this.value))
                transformedValue = this.value = new ObjectID(<string>this.value);
            else if ((<string>this.value).trim() != "")
                throw new Error( `Please use a valid ID for '${this.name}'`);
            else
                transformedValue = null;
        }

        if (!transformedValue)
            this.value = null;

        if (!this.optionalKey && !this.value)
            throw new Error(`${this.name} does not exist`);

        // We can assume the value is object id by this point
        var result = await model.findOne<Modepress.IModelEntry>( { _id : <ObjectID>this.value } );

        if (!this.optionalKey && !result)
            throw new Error(`${this.name} does not exist`);

        this._targetDoc = result;

        return true;
    }

     /**
	 * Called once a schema has been validated and inserted into the database. Useful for
     * doing any post update/insert operations
     * @param {ModelInstance<T extends Modepress.IModelEntry>} instance The model instance that was inserted or updated
     * @param {string} collection The DB collection that the model was inserted into
	 */
	public async postValidation<T extends Modepress.IModelEntry>( instance: ModelInstance<T>, collection : string ): Promise<void>
	{
        if (!this._targetDoc)
            return;

        // If they key is required then it must exist
        var model = Model.getByName(this.targetCollection);

        var optionalDeps = this._targetDoc.dbEntry._optionalDependencies;
        var requiredDeps = this._targetDoc.dbEntry._requiredDependencies;

        // Now we need to register the schemas source with the target model
        if (this.optionalKey)
        {
            if ( !optionalDeps )
                optionalDeps = [];

            optionalDeps.push( { _id : instance.dbEntry._id, collection: collection, propertyName: this.name } );
        }
        else
        {
            if ( !requiredDeps )
                requiredDeps = [];

            requiredDeps.push( { _id : instance.dbEntry._id, collection: collection } )
        }

        await model.collection.updateOne( <Modepress.IModelEntry>{ _id : this._targetDoc.dbEntry._id  }, {
            $set : <Modepress.IModelEntry>{
                _optionalDependencies : optionalDeps,
                _requiredDependencies : requiredDeps
             }
        });

        // Nullify the target doc cache
        this._targetDoc = null;
        return;
    }

    /**
	* Gets the value of this item
    * @param {ISchemaOptions} options [Optional] A set of options that can be passed to control how the data must be returned
    * @returns {Promise<ObjectID | Modepress.IModelEntry>}
	*/
    public async getValue(options? : ISchemaOptions): Promise<ObjectID | Modepress.IModelEntry>
    {
        if (!options.expandForeignKeys)
            return <ObjectID>this.value;
        else
        {
            var model = Model.getByName(this.targetCollection);
            if (model)
            {
                var result = await model.findOne<Modepress.IModelEntry>( { _id : <ObjectID>this.value } );
                return await result.schema.getAsJson<Modepress.IModelEntry>( result.dbEntry._id, options);
            }
            else
                throw new Error(`${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist`);
        }
    }
}