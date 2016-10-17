import { SchemaItem } from './schema-item';
import { ISchemaOptions } from 'modepress-api';
import { Model, ModelInstance } from '../model';
import { ObjectID } from 'mongodb';
import { Utils } from '../../utils';
import { SchemaIdArray } from './schema-id-array';

/**
 * Represents a mongodb ObjectID of a document in separate collection.
 * Foreign keys are used as a way of relating models to one another. They can be required or optional.
 * Required keys will mean that the current document cannot exist if the target does not. Optional keys
 * will simply be nullified if the target no longer exists.
 */
export class SchemaForeignKey extends SchemaItem<ObjectID | string | Modepress.IModelEntry | null>
{
    public targetCollection: string;
    public optionalKey: boolean;
    public curLevel: number;

    private _targetDoc: ModelInstance<Modepress.IModelEntry> | null;

	/**
	 * Creates a new schema item
	 * @param name The name of this item
	 * @param val The string representation of the foreign key's _id
     * @param targetCollection The name of the collection to which the target exists
     * @param optionalKey If true, then this key will only be nullified if the target is removed
	 */
    constructor( name: string, val: string, targetCollection: string, optionalKey: boolean = false ) {
        super( name, val );
        this.targetCollection = targetCollection;
        this.optionalKey = optionalKey;
        this.curLevel = 1;
    }

	/**
	 * Creates a clone of this item
	 */
    public clone( copy?: SchemaForeignKey ): SchemaForeignKey {
        copy = copy === undefined ? new SchemaForeignKey( this.name, <string>this.value, this.targetCollection ) : copy;
        super.clone( copy );
        copy.optionalKey = this.optionalKey;
        return copy;
    }

	/**
	 * Checks the value stored to see if its correct in its current form
	 */
    public async validate(): Promise<boolean | Error | null> {
        let transformedValue = this.value;

        // If they key is required then it must exist
        const model = Model.getByName( this.targetCollection );

        if ( !model )
            throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

        if ( typeof this.value == 'string' ) {
            if ( Utils.isValidObjectID( <string>this.value ) )
                transformedValue = this.value = new ObjectID( <string>this.value );
            else if ( ( <string>this.value ).trim() != '' )
                throw new Error( `Please use a valid ID for '${this.name}'` );
            else
                transformedValue = null;
        }

        if ( !transformedValue )
            this.value = null;

        if ( !this.optionalKey && !this.value )
            throw new Error( `${this.name} does not exist` );

        // We can assume the value is object id by this point
        const result = await model.findOne<Modepress.IModelEntry>( { _id: <ObjectID>this.value });

        if ( !this.optionalKey && !result )
            throw new Error( `${this.name} does not exist` );

        this._targetDoc = result!;

        return true;
    }

    /**
	 * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param instance The model instance that was inserted or updated
     * @param collection The DB collection that the model was inserted into
	 */
    public async postUpsert<T extends Modepress.IModelEntry>( instance: ModelInstance<T>, collection: string ): Promise<void> {
        if ( !this._targetDoc )
            return;

        // If they key is required then it must exist
        const model = Model.getByName( this.targetCollection );

        let optionalDeps = this._targetDoc.dbEntry._optionalDependencies;
        let requiredDeps = this._targetDoc.dbEntry._requiredDependencies;

        // Now we need to register the schemas source with the target model
        if ( this.optionalKey ) {
            if ( !optionalDeps )
                optionalDeps = [];

            optionalDeps.push( { _id: instance.dbEntry._id, collection: collection, propertyName: this.name });
        }
        else {
            if ( !requiredDeps )
                requiredDeps = [];

            requiredDeps.push( { _id: instance.dbEntry._id, collection: collection })
        }

        await model.collection.updateOne( <Modepress.IModelEntry>{ _id: this._targetDoc.dbEntry._id }, {
            $set: <Modepress.IModelEntry>{
                _optionalDependencies: optionalDeps,
                _requiredDependencies: requiredDeps
            }
        });

        // Nullify the target doc cache
        this._targetDoc = null;
        return;
    }

    /**
     * Called after a model instance is deleted. Useful for any schema item cleanups.
     * @param instance The model instance that was deleted
     */
    public async postDelete<T extends Modepress.IModelEntry>( instance: ModelInstance<T> ): Promise<void> {
        // If they key is required then it must exist
        const model = Model.getByName( this.targetCollection );
        if ( !model )
            return;

        if ( !this.value || this.value == '' )
            return;

        // We can assume the value is object id by this point
        const result = await model.findOne<Modepress.IModelEntry>( { _id: <ObjectID>this.value });
        if ( !result )
            return;

        let query;

        if ( this.optionalKey )
            query = { $pull: { _optionalDependencies: { _id: instance.dbEntry._id } } };
        else
            query = { $pull: { _requiredDependencies: { _id: instance.dbEntry._id } } };

        await model.collection.updateOne( <Modepress.IModelEntry>{ _id: this._targetDoc!.dbEntry._id }, query );
        return;
    }

    /**
	 * Gets the value of this item
     * @param options [Optional] A set of options that can be passed to control how the data must be returned
	 */
    public async getValue( options: ISchemaOptions ): Promise<ObjectID | Modepress.IModelEntry | null> {

        if ( options.expandForeignKeys && options.expandMaxDepth === undefined )
            throw new Error( 'You cannot set expandForeignKeys and not specify the expandMaxDepth' );

        if ( !options.expandForeignKeys )
            return <ObjectID>this.value;

        if ( options.expandSchemaBlacklist && options.expandSchemaBlacklist.indexOf( this.name ) != -1 )
            return <ObjectID>this.value;

        const model = Model.getByName( this.targetCollection );
        if ( !model )
            throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

        if ( !this.value )
            return null;

        // Make sure the current level is not beyond the max depth
        if ( options.expandMaxDepth !== undefined ) {
            if ( this.curLevel > options.expandMaxDepth )
                return this.value;
        }

        const result = await model.findOne<Modepress.IModelEntry>( { _id: <ObjectID>this.value });

        if ( !result )
            throw new Error( `Could not find instance of ${this.name} references with foreign key '${this.targetCollection}'` );

        // Get the models items are increase their level - this ensures we dont go too deep
        const items = result.schema.getItems() !;
        const nextLevel = this.curLevel + 1;

        for ( let i = 0, l = items.length; i < l; i++ )
            if ( items[ i ] instanceof SchemaForeignKey || items[ i ] instanceof SchemaIdArray )
                ( <SchemaForeignKey | SchemaIdArray>items[ i ] ).curLevel = nextLevel;

        return await result.schema.getAsJson<Modepress.IModelEntry>( result.dbEntry._id, options );
    }
}