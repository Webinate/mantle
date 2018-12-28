
import { ISchemaOptions } from '../../types/misc/i-schema-options';
import { IModelEntry } from '../../types/models/i-model-entry';
import { SchemaItem } from './schema-item';
import { SchemaForeignKey } from './schema-foreign-key';
import { ObjectID } from 'mongodb'; // UpdateWriteOpResult
import { isValidObjectID } from '../../utils/utils';
import { IIdArrOptions } from '../../types/interfaces/i-schema-options';
import { Schema } from '../schema';
import Factory from '../../core/model-factory';

export type Client = ( string | IModelEntry<'client'> )[];

/**
 * An ID array scheme item for use in Models. Returns objects of the specified ids from the target collection.
 * Currently we only support Id lookups that exist in the same model - i.e. if the ids are of objects
 * in different models we cannot get the object values.
 */
export class SchemaIdArray extends SchemaItem<ObjectID[], Client> {
  public targetCollection: string;
  public minItems: number;
  public maxItems: number;
  public curLevel: number;
  public namespace: string;

  /**
   * Creates a new schema item that holds an array of id items
   * @param name The name of this item
   * @param val The array of ids for this schema item
   * @param targetCollection Specify the model name to which all the ids belong. If set the item can expand objects on retreival.
   */
  constructor( name: string, targetCollection: string, options?: IIdArrOptions ) {
    super( name, [] );
    options = {
      minItems: 0,
      maxItems: 10000,
      ...options
    };

    this.maxItems = options.maxItems!;
    this.minItems = options.minItems!;
    this.targetCollection = targetCollection;
    this.curLevel = 1;
    this.namespace = name;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone( copy?: SchemaIdArray ) {
    copy = copy === undefined ? new SchemaIdArray( this.name, this.targetCollection ) : copy;
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
  public async validate( val: Client ) {
    const transformedValue = val;
    const toRet: ObjectID[] = [];

    for ( let i = 0, l = transformedValue.length; i < l; i++ ) {
      if ( typeof transformedValue[ i ] === 'string' ) {
        if ( isValidObjectID( transformedValue[ i ] as string ) )
          toRet.push( new ObjectID( transformedValue[ i ] as string ) );
        else if ( ( transformedValue[ i ] as string ).trim() !== '' )
          throw new Error( `Please use a valid ID for '${this.name}'` );
        else
          throw new Error( `Please use a valid ID for '${this.name}'` );
      }
    }

    if ( toRet.length < this.minItems )
      throw new Error( `You must select at least ${this.minItems} item${( this.minItems === 1 ? '' : 's' )} for ${this.name}` );
    if ( toRet.length > this.maxItems )
      throw new Error( `You have selected too many items for ${this.name}, please only use up to ${this.maxItems}` );

    // If no collection - then return
    if ( !this.targetCollection )
      return toRet;

    if ( toRet.length === 0 )
      return toRet;

    // If they collection is not empty, then it must exist
    const model = Factory.get( this.targetCollection );

    if ( !model )
      throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

    // We can assume the value is object id by this point
    const query = { $or: [] as IModelEntry<'server'>[] };


    for ( let i = 0, l = toRet.length; i < l; i++ )
      query.$or.push( <IModelEntry<'server'>>{ _id: toRet[ i ] } );

    const result = await model.findMany( { selector: query } );

    if ( toRet.length !== result.length ) {
      for ( const id of toRet ) {
        if ( !result.find( category => id.equals( category.dbEntry._id ) ) )
          throw new Error( `Could not find resource in '${this.targetCollection}' with the id ${id}` );
      }
    }

    // this._targetDocs = result;

    return toRet;
  }

  // /**
  //  * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
  //  * doing any post update/insert operations
  //  * @param collection The DB collection that the model was inserted into
  //  */
  // public async postUpsert( schema: Schema<IModelEntry<'server'>>, collection: string ): Promise<void> {
  //   if ( !this._targetDocs || this._targetDocs.length === 0 )
  //     return;

  //   // If they key is required then it must exist
  //   const model = Factory.get( this.targetCollection );
  //   const promises: Array<Promise<UpdateWriteOpResult>> = [];

  //   for ( let i = 0, l = this._targetDocs.length; i < l; i++ ) {
  //     let arrDeps = this._targetDocs[ i ].dbEntry._arrayDependencies || [];
  //     arrDeps.push( { _id: schema.dbEntry._id, collection: collection, propertyName: this.name } );
  //     promises.push( model.collection.updateOne( <IModelEntry<'server'>>{ _id: this._targetDocs[ i ].dbEntry._id }, {
  //       $set: <IModelEntry<'server'>>{ _arrayDependencies: arrDeps }
  //     } ) );
  //   }

  //   await Promise.all( promises );

  //   // Nullify the target doc cache
  //   this._targetDocs = null;
  //   return;
  // }

  // /**
  //  * Called after a model instance is deleted. Useful for any schema item cleanups.
  //  * @param instance The model instance that was deleted
  //  */
  // public async postDelete( schema: Schema<IModelEntry<'server'>>, collection: string ): Promise<void> {
  //   if ( !this.targetCollection || this.targetCollection.length === 0 )
  //     return;

  //   // If they key is required then it must exist
  //   const model = Factory.get( this.targetCollection );
  //   if ( !model )
  //     return;

  //   const val = this.getDbValue();

  //   if ( !val || val.length === 0 )
  //     return;

  //   // Get all the instances
  //   const query = { $or: [] as IModelEntry<'server'>[] };

  //   for ( let i = 0, l = val.length; i < l; i++ )
  //     query.$or.push( <IModelEntry<'server'>>{ _id: val[ i ] } );

  //   const results = await model.findMany( { selector: query } );
  //   if ( !results || results.length === 0 )
  //     return;

  //   const pullQueries: Array<Promise<any>> = [];

  //   for ( let i = 0, l = results.length; i < l; i++ )
  //     pullQueries.push( model.collection.updateOne(
  //       <IModelEntry<'server'>>{ _id: results[ i ].dbEntry._id },
  //       { $pull: { _arrayDependencies: { _id: schema.dbEntry._id } } }
  //     ) );

  //   await Promise.all( pullQueries );
  //   return;
  // }

  /**
   * Gets the value of this item
   * @param options [Optional] A set of options that can be passed to control how the data must be returned
   */
  public async getValue( options: ISchemaOptions ): Promise<( string | IModelEntry<'client'> )[]> {
    if ( options.expandForeignKeys && options.expandMaxDepth === undefined )
      throw new Error( 'You cannot set expandForeignKeys and not specify the expandMaxDepth' );

    const val = this.getDbValue();

    if ( !options.expandForeignKeys )
      return val.map( i => i.toString() );

    if ( options.expandSchemaBlacklist )
      for ( const r of options.expandSchemaBlacklist )
        if ( this.namespace.match( r ) )
          return val.map( i => i.toString() );

    if ( !this.targetCollection )
      return val.map( i => i.toString() );

    const model = Factory.get( this.targetCollection );
    if ( !model )
      throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

    // Make sure the current level is not beyond the max depth
    if ( options.expandMaxDepth !== undefined && options.expandMaxDepth !== -1 ) {
      if ( this.curLevel > options.expandMaxDepth )
        return val.map( i => i.toString() );
    }

    if ( val.length === 0 )
      return val as any as string[];

    // Create the query for fetching the instances
    const query = { $or: [] as IModelEntry<'server'>[] };
    for ( let i = 0, l = val.length; i < l; i++ )
      query.$or.push( <IModelEntry<'server'>>{ _id: val[ i ] } );

    const schemas = await model.findMany( { selector: query } );
    let schema: Schema<IModelEntry<'server'>, IModelEntry<'client'>>;
    const promises: Array<Promise<IModelEntry<'client'>>> = [];

    // Get the models items are increase their level - this ensures we dont go too deep
    for ( let i = 0, l = schemas.length; i < l; i++ ) {
      schema = schemas[ i ];
      const items = schema.getItems();
      const nextLevel = this.curLevel + 1;

      for ( const item of items )
        if ( item instanceof SchemaForeignKey || item instanceof SchemaIdArray ) {
          item.curLevel = nextLevel;
          item.namespace = `${this.namespace}.${item.namespace}`;
        }

      promises.push( schema.downloadToken( options ) );
    }

    return await Promise.all( promises );
  }
}