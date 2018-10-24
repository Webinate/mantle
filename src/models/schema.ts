import { ISchemaOptions } from '../types/misc/i-schema-options';
import { IModelEntry } from '../types/models/i-model-entry';
import { SchemaItem } from './schema-items/schema-item';

/**
 * Gives an overall description of each property in a model
 */
export class Schema<T extends IModelEntry<'server' | 'client'>> {
  private _items: SchemaItem<any, any>[];
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

    for ( const i in data ) {
      for ( const item of items )
        if ( item.name === i && ( allowReadOnlyValues || item.getReadOnly() === false ) ) {
          item.setValue( data[ i as keyof Partial<IModelEntry<'client'>> ] );
          break;
        }
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
  public async downloadToken<Y extends IModelEntry<'client'>>( options?: ISchemaOptions ): Promise<Y> {
    options = options ? options : { expandForeignKeys: true, expandMaxDepth: -1, verbose: true };
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

      const clientVal = items[ i ].getClientValue();
      const dbVal = items[ i ].getDbValue();
      const defaultVal = items[ i ].getDefaultValue();

      if ( items[ i ].autoValidate )
        promises.push( items[ i ].validate( clientVal || dbVal || defaultVal ) );
      else if ( clientVal !== undefined )
        promises.push( items[ i ].validate( clientVal ) );
      else if ( dbVal || dbVal === false )
        promises.push( dbVal );
      else
        promises.push( items[ i ].validate( defaultVal ) );
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
   * Gets a schema item from this schema by name. Throws an exception if one does
   * not exist.
   * @param val The name of the item
   */
  public getByName<K extends keyof T>( val: K ): SchemaItem<T[ K ], T[ K ]> {
    const item = this.find( val );
    if ( item === null )
      throw new Error( `Could not find '${val}'` );

    return item;
  }

  /**
   * Finds a schema item from this schema by name. Returns null if none exists
   * @param val The name of the item
   */
  public find<K extends keyof T>( val: K ): SchemaItem<T[ K ], T[ K ]> | null {
    const items = this._items;
    for ( const item of items )
      if ( item.name === val )
        return item;

    return null;
  }

  /**
   * Adds an array of schema items
   * @param val The new items to add
   */
  public addItems( items: SchemaItem<any, any>[] ): SchemaItem<any, any>[] {
    for ( const val of items ) {
      if ( val.name === '_id' )
        throw new Error( `You cannot use the schema item name _id as its a reserved keyword` );
      else if ( val.name === '_requiredDependencies' )
        throw new Error( `You cannot use the schema item name _requiredDependencies as its a reserved keyword` );
      else if ( val.name === '_optionalDependencies' )
        throw new Error( `You cannot use the schema item name _optionalDependencies as its a reserved keyword` );
      else if ( this.find( val.name as keyof IModelEntry<'server' | 'client'> ) )
        throw new Error( `An item with the name ${val.name} already exists.` );

      this._items.push( val );
    }

    return items;
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