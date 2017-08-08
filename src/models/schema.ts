import { ISchemaOptions, IModelEntry } from 'modepress';
import { SchemaItem } from './schema-items/schema-item';
import * as mongodb from 'mongodb'
import { ModelInstance } from './model'

/**
 * Gives an overall description of each property in a model
 */
export class Schema {
    private _items: Array<SchemaItem<any>>;

    constructor() {
        this._items = [];
    }

	/**
	 * Creates a copy of the schema
	 */
    public clone(): Schema {
        const items = this._items;
        const copy = new Schema();

        for ( let i = 0, l = items.length; i < l; i++ )
            copy._items.push( items[ i ].clone() );

        return copy;
    }

    /**
	 * Sets a schema value by name
	 * @param data The data object we are setting
     * @param allowReadOnlyValues If true, then readonly values can be overwritten (Usually the case when the item is first created)
	 */
    set( data: any, allowReadOnlyValues: boolean ) {
        const items = this._items,
            l = items.length;

        for ( const i in data ) {
            for ( let ii = 0; ii < l; ii++ )
                if ( items[ ii ].name === i && ( items[ ii ].getReadOnly() === false || allowReadOnlyValues ) )
                    items[ ii ].setValue( data[ i ] );
        }
    }

	/**
	 * Sets a schema value by name
	 * @param name The name of the schema item
	 * @param val The new value of the item
	 */
    setVal( name: string, val: any ) {
        const items = this._items;

        for ( let i = 0, l = items.length; i < l; i++ )
            if ( items[ i ].name === name )
                items[ i ].setValue( val );
    }

	/**
 	 * De-serializes the schema items from the mongodb data entry.
     * I.e. the data is the document from the DB and the schema item sets its values from the document
	 */
    public deserialize( data: any ): any {
        for ( let i in data )
            this.setVal( i, data[ i ] );
    }

	/**
	 * Serializes the schema items into the JSON format for mongodb
	 */
    public serialize(): any {
        const toReturn = {};
        const items = this._items;

        for ( let i = 0, l = items.length; i < l; i++ )
            toReturn[ items[ i ].name ] = items[ i ].getDbValue();

        return toReturn;
    }

    /**
	 * Serializes the schema items into a JSON
     * @param id The models dont store the _id property directly, and so this has to be passed for serialization
     * @param options [Optional] A set of options that can be passed to control how the data must be returned
	 */
    public async getAsJson<T extends IModelEntry>( id: mongodb.ObjectID, options: ISchemaOptions ): Promise<T> {
        const toReturn: T = <T><IModelEntry>{ _id: id };
        const items = this._items;
        const promises: Array<Promise<any>> = [];
        const itemsInUse: SchemaItem<any>[] = [];

        for ( let i = 0, l = items.length; i < l; i++ ) {
            // If this data is sensitive and the request must be sanitized
            // then skip the item
            if ( items[ i ].getSensitive() && options.verbose === false )
                continue;

            itemsInUse.push( items[ i ] );
            promises.push( items[ i ].getValue( options ) );
        }

        // Wait for all the promises to resolve
        const returns = await Promise.all<any>( promises );

        // Assign the promise values
        for ( let i = 0, l = returns.length; i < l; i++ )
            toReturn[ itemsInUse[ i ].name ] = returns[ i ];

        return Promise.resolve( toReturn );
    }

	/**
	 * Checks the values stored in the items to see if they are correct
	 * @param checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
     * @returns Returns true if successful
	 */
    public async validate( checkForRequiredFields: boolean ): Promise<Schema> {
        const items = this._items;
        const promises: Array<Promise<any>> = [];

        for ( let i = 0, l = items.length; i < l; i++ ) {
            if ( checkForRequiredFields && !items[ i ].getModified() && items[ i ].getRequired() )
                throw new Error( `${items[ i ].name} is required` );

            promises.push( items[ i ].validate() );
        }

        await Promise.all( promises );
        return this;
    }

    /**
	 * Called after a model instance and its schema has been validated and inserted/updated into the database. Useful for
     * doing any post update/insert operations
     * @param instance The model instance that was inserted or updated
     * @param collection The DB collection that the model was inserted into
	 */
    public async postUpsert<T extends IModelEntry>( instance: ModelInstance<T>, collection: string ): Promise<Schema> {
        const items = this._items;
        const promises: Array<Promise<any>> = [];

        for ( let i = 0, l = items.length; i < l; i++ )
            promises.push( items[ i ].postUpsert( instance, collection ) );

        await Promise.all( promises );
        return this;
    }

    /**
     * Called after a model instance is deleted. Useful for any schema item cleanups.
     * @param instance The model instance that was deleted
     * @param collection The DB collection that the model was deleted from
     */
    public async postDelete<T extends IModelEntry>( instance: ModelInstance<T>, collection: string ): Promise<Schema> {
        const items = this._items;
        const promises: Array<Promise<any>> = [];

        for ( let i = 0, l = items.length; i < l; i++ )
            promises.push( items[ i ].postUpsert( instance, collection ) );

        await Promise.all( promises );
        return this;
    }

	/**
	 * Gets a schema item from this schema by name
	 * @param val The name of the item
	 */
    public getByName( val: string ): SchemaItem<any> | null {
        const items = this._items;
        for ( let i = 0, l = items.length; i < l; i++ )
            if ( items[ i ].name === val )
                return items[ i ];

        return null;
    }

	/**
	 * Adds a schema item to this schema
	 * @param val The new item to add
	 */
    public add( val: SchemaItem<any> ): SchemaItem<any> {
        if ( val.name === '_id' )
            throw new Error( `You cannot use the schema item name _id as its a reserved keyword` );
        else if ( val.name === '_requiredDependencies' )
            throw new Error( `You cannot use the schema item name _requiredDependencies as its a reserved keyword` );
        else if ( val.name === '_optionalDependencies' )
            throw new Error( `You cannot use the schema item name _optionalDependencies as its a reserved keyword` );
        else if ( this.getByName( val.name ) )
            throw new Error( `An item with the name ${val.name} already exists.` );

        this._items.push( val );
        return val;
    }

	/**
	 * Removes a schema item from this schema
	 * @param val The name of the item or the item itself
	 */
    public remove( val: SchemaItem<any> | string ) {
        const items = this._items;
        let name = '';
        if ( <SchemaItem<any>>val instanceof SchemaItem )
            name = ( <SchemaItem<any>>val ).name;

        for ( let i = 0, l = items.length; i < l; i++ )
            if ( items[ i ].name === name ) {
                items.splice( i, 1 );
                return;
            }
    }

    /**
     * Gets the schema items associated with this schema
     */
    public getItems(): Array<SchemaItem<any>> {
        return this._items;
    }
}