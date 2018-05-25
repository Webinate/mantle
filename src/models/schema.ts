import { ISchemaOptions } from '../types/misc/i-schema-options';
import { IModelEntry } from '../types/models/i-model-entry';
import { SchemaItem } from './schema-items/schema-item';

/**
 * Gives an overall description of each property in a model
 */
export class Schema<T extends IModelEntry<'server' | 'client'>> {
  private _items: Array<SchemaItem<any, any>>;
  public dbEntry: T;

  constructor() {
    this._items = [];
  }

  /**
   * Creates a copy of the schema
   */
  public clone(): Schema<T> {
    const items = this._items;
    const copy = new Schema();

    for ( let i = 0, l = items.length; i < l; i++ )
      copy._items.push( items[ i ].clone() );

    return copy as Schema<T>;
  }

  /**
   * Sets a schema value by name
   * @param data The data object we are setting
   * @param allowReadOnlyValues If true, then readonly values can be overwritten (Usually the case when the item is first created)
   */
  setClient( data: Partial<IModelEntry<'client'>>, allowReadOnlyValues: boolean ) {
    const items = this._items;

    // this.dbEntry = Object.assign( {}, this.dbEntry, data );

    for ( const i in data ) {
      for ( const item of items )
        if ( item.name === i && ( allowReadOnlyValues || item.getReadOnly() === false ) )
          item.setValue( data[ i as keyof Partial<IModelEntry<'client'>> ] );
    }
  }

  setServer( data: Partial<T>, allowReadOnlyValues: boolean ) {
    const items = this._items;

    this.dbEntry = Object.assign( {}, this.dbEntry, data );

    for ( const i in data ) {
      for ( const item of items )
        if ( item.name === i && ( allowReadOnlyValues || item.getReadOnly() === false ) )
          item.setDbValue( data[ i ] );
    }
  }

  // /**
  //  * Sets a schema value by name
  //  * @param name The name of the schema item
  //  * @param val The new value of the item
  //  */
  // setVal( name: string, val: any ) {
  //   const items = this._items;

  //   for ( let i = 0, l = items.length; i < l; i++ )
  //     if ( items[ i ].name === name )
  //       items[ i ].setValue( val );
  // }

  /**
   * Serializes the schema items into the JSON format for mongodb
   */
  public uploadToken() {
    const toReturn: Partial<IModelEntry<'server'>> = {};
    const items = this._items;

    for ( let i = 0, l = items.length; i < l; i++ )
      toReturn[ items[ i ].name as keyof IModelEntry<'server'> ] = items[ i ].getDbValue();

    return toReturn;
  }

  /**
   * Serializes the schema items into a JSON
   * @param options [Optional] A set of options that can be passed to control how the data must be returned
   */
  public async downloadToken<Y extends IModelEntry<'client'>>( options: ISchemaOptions ): Promise<Y> {
    const toReturn: IModelEntry<'client'> = { _id: this.dbEntry._id!.toString() };
    const items = this._items;
    const promises: Array<Promise<any>> = [];
    const itemsInUse: SchemaItem<any, any>[] = [];

    for ( let i = 0, l = items.length; i < l; i++ ) {
      // If this data is sensitive and the request must be sanitized
      // then skip the item
      if ( items[ i ].getSensitive() && options.verbose === false )
        continue;

      itemsInUse.push( items[ i ] );
      promises.push( items[ i ].getValue( options ) );
    }

    // Wait for all the promises to resolve
    const returns: any[] = await Promise.all<any>( promises );

    // Assign the promise values
    for ( let i = 0, l = returns.length; i < l; i++ )
      toReturn[ itemsInUse[ i ].name as keyof IModelEntry<'client'> ] = returns[ i ];

    return Promise.resolve( toReturn ) as Promise<Y>;
  }

  /**
   * Checks the values stored in the items to see if they are correct
   * @param checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
   */
  public async validate( checkForRequiredFields: boolean ) {
    const items = this._items;
    const promises: Array<Promise<any>> = [];

    for ( let i = 0, l = items.length; i < l; i++ ) {
      if ( checkForRequiredFields && !items[ i ].getModified() && items[ i ].getRequired() )
        throw new Error( `${items[ i ].name} is required` );

      const clientVal = items[ i ].getClientValue()
      const dbVal = items[ i ].getDbValue();
      if ( clientVal !== undefined )
        promises.push( items[ i ].validate( clientVal ) );
      else if ( dbVal )
        promises.push( dbVal );
      else
        promises.push( items[ i ].validate( items[ i ].getDefaultValue() ) );
    }

    const serverValues: any[] = await Promise.all( promises );
    for ( let i = 0, l = serverValues.length; i < l; i++ ) {
      items[ i ].setDbValue( serverValues[ i ] );

      if ( this.dbEntry )
        this.dbEntry[ items[ i ].name as keyof IModelEntry<'server'> ] = serverValues[ i ];
    }

    return this;
  }

  /**
   * Called after a model instance and its schema has been validated and inserted/updated into the database. Useful for
   * doing any post update/insert operations
   * @param collection The DB collection that the model was inserted into
   */
  public async postUpsert( collection: string ) {
    const items = this._items;
    const promises: Array<Promise<any>> = [];

    for ( let i = 0, l = items.length; i < l; i++ )
      promises.push( items[ i ].postUpsert( this, collection ) );

    await Promise.all( promises );
    return this;
  }

  /**
   * Called after a model instance is deleted. Useful for any schema item cleanups.
   * @param collection The DB collection that the model was deleted from
   */
  public async postDelete( collection: string ) {
    const items = this._items;
    const promises: Array<Promise<any>> = [];

    for ( let i = 0, l = items.length; i < l; i++ )
      promises.push( items[ i ].postUpsert( this, collection ) );

    await Promise.all( promises );
    return this;
  }

  /**
   * Gets a schema item from this schema by name
   * @param val The name of the item
   */
  public getByName<K extends keyof T>( val: K ): SchemaItem<T[ K ], T[ K ]> | null {
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
  public add( val: SchemaItem<any, any> ): SchemaItem<any, any> {
    if ( val.name === '_id' )
      throw new Error( `You cannot use the schema item name _id as its a reserved keyword` );
    else if ( val.name === '_requiredDependencies' )
      throw new Error( `You cannot use the schema item name _requiredDependencies as its a reserved keyword` );
    else if ( val.name === '_optionalDependencies' )
      throw new Error( `You cannot use the schema item name _optionalDependencies as its a reserved keyword` );
    else if ( this.getByName( val.name as keyof IModelEntry<'server' | 'client'> ) )
      throw new Error( `An item with the name ${val.name} already exists.` );

    this._items.push( val );
    return val;
  }

  /**
   * Removes a schema item from this schema
   * @param val The name of the item or the item itself
   */
  public remove( val: SchemaItem<any, any> | string ) {
    const items = this._items;
    let name = '';
    if ( <SchemaItem<any, any>>val instanceof SchemaItem )
      name = ( <SchemaItem<any, any>>val ).name;

    for ( let i = 0, l = items.length; i < l; i++ )
      if ( items[ i ].name === name ) {
        items.splice( i, 1 );
        return;
      }
  }

  /**
   * Gets the schema items associated with this schema
   */
  public getItems(): Array<SchemaItem<any, any>> {
    return this._items;
  }

  /**
   * Gets a string representation of all fields that are unique
   */
  uniqueFieldNames(): string {
    let uniqueNames = '';
    const items = this._items;

    for ( let i = 0, l = items.length; i < l; i++ )
      if ( items[ i ].getUnique() )
        uniqueNames += items[ i ].name + ', ';

    if ( uniqueNames !== '' )
      uniqueNames = uniqueNames.slice( 0, uniqueNames.length - 2 );

    return uniqueNames;
  }
}