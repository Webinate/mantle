import { SchemaItem } from "./schema-item";
import { SchemaForeignKey } from "./schema-foreign-key";
import { Model, ModelInstance } from "../model";
import { ISchemaOptions } from "modepress-api";
import sanitizeHtml = require( "sanitize-html" );
import { ObjectID, UpdateWriteOpResult } from "mongodb";
import { Utils } from "../../utils";

/**
 * An ID array scheme item for use in Models. Optionally can be used as a foreign key array
 * and return objects of the specified ids. In order for the array to return objects you must
 * specify the targetCollection property. This tells the schema from which model the ids belong to.
 * Currently we only support Id lookups that exist in the same model - i.e. if the ids are of objects
 * in different models we cannot get the object values.
 */
export class SchemaIdArray extends SchemaItem<Array<string | ObjectID | Modepress.IModelEntry>>
{
    public targetCollection: string;
    public minItems: number;
    public maxItems: number;
    public curLevel: number;
    private _targetDocs: Array<ModelInstance<Modepress.IModelEntry>>;

	/**
	 * Creates a new schema item that holds an array of id items
	 * @param name The name of this item
	 * @param val The array of ids for this schema item
     * @param minItems [Optional] Specify the minimum number of items that can be allowed
     * @param maxItems [Optional] Specify the maximum number of items that can be allowed
     * @param targetCollection [Optional] Specify the model name to which all the ids belong. If set
     * the item can expand objects on retreival.
	 */
    constructor( name: string, val: Array<string>, minItems: number = 0, maxItems: number = 10000, targetCollection: string = null ) {
        super( name, val );
        this.maxItems = maxItems;
        this.minItems = minItems;
        this.targetCollection = targetCollection;
        this.curLevel = 1;
    }

	/**
	 * Creates a clone of this item
	 * @returns copy A sub class of the copy
	 */
    public clone( copy?: SchemaIdArray ): SchemaIdArray {
        copy = copy === undefined ? new SchemaIdArray( this.name, <Array<string>>this.value ) : copy;
        super.clone( copy );
        copy.maxItems = this.maxItems;
        copy.minItems = this.minItems;
        copy.targetCollection = this.targetCollection;
        return copy;
    }

	/**
	 * Checks the value stored to see if its correct in its current form
	 * @returns Returns true if successful or an error message string if unsuccessful
	 */
    public async validate(): Promise<boolean | Error> {
        var transformedValue = this.value;

        for ( var i = 0, l = transformedValue.length; i < l; i++ ) {
            if ( typeof this.value[ i ] == "string" ) {
                if ( Utils.isValidObjectID( <string>this.value[ i ] ) )
                    transformedValue[ i ] = new ObjectID( <string>this.value[ i ] );
                else if ( ( <string>this.value[ i ] ).trim() != "" )
                    throw new Error( `Please use a valid ID for '${this.name}'` );
                else
                    throw new Error( `Please use a valid ID for '${this.name}'` );
            }
        }

        if ( transformedValue.length < this.minItems )
            throw new Error( `You must select at least ${this.minItems} item${( this.minItems == 1 ? "" : "s" )} for ${this.name}` );
        if ( transformedValue.length > this.maxItems )
            throw new Error( `You have selected too many items for ${this.name}, please only use up to ${this.maxItems}` );

        // If no collection - then return
        if ( !this.targetCollection )
            return true;

        if ( this.value.length == 0 )
            return true;

        // If they collection is not empty, then it must exist
        var model = Model.getByName( this.targetCollection );

        if ( !model )
            throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

        // We can assume the value is object id by this point
        var query = { $or: [] };
        var arr = this.value;

        for ( var i = 0, l = arr.length; i < l; i++ )
            query.$or.push( <Modepress.IModelEntry>{ _id: <ObjectID>arr[ i ] });

        var result = await model.findInstances<Modepress.IModelEntry>( query );
        this._targetDocs = result;

        return true;
    }

    /**
	 * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param instance The model instance that was inserted or updated
     * @param collection The DB collection that the model was inserted into
	 */
    public async postUpsert<T extends Modepress.IModelEntry>( instance: ModelInstance<T>, collection: string ): Promise<void> {
        if ( !this._targetDocs )
            return;

        // If they key is required then it must exist
        var model = Model.getByName( this.targetCollection );
        var promises: Array<Promise<UpdateWriteOpResult>> = [];

        for ( var i = 0, l = this._targetDocs.length; i < l; i++ ) {
            let arrDeps = this._targetDocs[ i ].dbEntry._arrayDependencies || [];
            arrDeps.push( { _id: instance.dbEntry._id, collection: collection, propertyName: this.name });
            promises.push( model.collection.updateOne( <Modepress.IModelEntry>{ _id: this._targetDocs[ i ].dbEntry._id }, {
                $set: <Modepress.IModelEntry>{ _arrayDependencies: arrDeps }
            }) );
        }

        await Promise.all( promises );

        // Nullify the target doc cache
        this._targetDocs = null;
        return;
    }

    /**
     * Called after a model instance is deleted. Useful for any schema item cleanups.
     * @param instance The model instance that was deleted
     */
    public async postDelete<T extends Modepress.IModelEntry>( instance: ModelInstance<T> ): Promise<void> {
        if ( !this.targetCollection )
            return;

        // If they key is required then it must exist
        var model = Model.getByName( this.targetCollection );
        if ( !model )
            return;

        if ( !this.value || this.value.length == 0 )
            return;

        // Get all the instances
        var promises: Array<Promise<UpdateWriteOpResult>> = [];
        var query = { $or: [] };
        var arr = this.value;

        for ( var i = 0, l = arr.length; i < l; i++ )
            query.$or.push( <Modepress.IModelEntry>{ _id: <ObjectID>arr[ i ] });

        var results = await model.findInstances<Modepress.IModelEntry>( query );
        if ( !results || results.length == 0 )
            return;

        var pullQueries: Array<Promise<any>> = [];

        for ( var i = 0, l = results.length; i < l; i++ )
            pullQueries.push( model.collection.updateOne(
                <Modepress.IModelEntry>{ _id: results[ i ].dbEntry._id },
                { $pull: { _arrayDependencies: { _id: instance.dbEntry._id } } }
            ) );

        await Promise.all( pullQueries );
        return;
    }

    /**
	 * Gets the value of this item
     * @param options [Optional] A set of options that can be passed to control how the data must be returned
	 */
    public async getValue( options?: ISchemaOptions ): Promise<Array<string | ObjectID | Modepress.IModelEntry>> {
        if ( options.expandForeignKeys && options.expandMaxDepth === undefined )
            throw new Error( "You cannot set expandForeignKeys and not specify the expandMaxDepth" );

        if ( !options.expandForeignKeys )
            return this.value;

        if ( options.expandSchemaBlacklist && options.expandSchemaBlacklist.indexOf( this.name ) != -1 )
            return this.value;

        if ( !this.targetCollection )
            return this.value;

        var model = Model.getByName( this.targetCollection );
        if ( !model )
            throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

        // Make sure the current level is not beyond the max depth
        if ( options.expandMaxDepth !== undefined ) {
            if ( this.curLevel > options.expandMaxDepth )
                return this.value;
        }

        if ( this.value.length == 0 )
            return this.value;

        // Create the query for fetching the instances
        var query = { $or: [] };
        for ( var i = 0, l = this.value.length; i < l; i++ )
            query.$or.push( <Modepress.IModelEntry>{ _id: this.value[ i ] });

        var instances = await model.findInstances<Modepress.IModelEntry>( query );
        var instance: ModelInstance<Modepress.IModelEntry>;

        var toReturn: Array<Modepress.IModelEntry> = [];
        var promises: Array<Promise<Modepress.IModelEntry>> = [];

        // Get the models items are increase their level - this ensures we dont go too deep
        for ( var i = 0, l = instances.length; i < l; i++ ) {
            instance = instances[ i ];
            var items = instance.schema.getItems();
            var nextLevel = this.curLevel + 1;

            for ( var ii = 0, il = items.length; ii < il; ii++ )
                if ( items[ ii ] instanceof SchemaForeignKey || items[ ii ] instanceof SchemaIdArray )
                    ( <SchemaForeignKey | SchemaIdArray>items[ ii ] ).curLevel = nextLevel;

            promises.push( instance.schema.getAsJson<Modepress.IModelEntry>( instance.dbEntry._id, options ) );
        }

        return await Promise.all( promises );
    }
}