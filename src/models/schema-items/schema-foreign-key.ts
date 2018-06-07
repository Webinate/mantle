import { ISchemaOptions } from '../../types/misc/i-schema-options';
import { IForeignKeyOptions } from '../../types/interfaces/i-schema-options';
import { IModelEntry } from '../../types/models/i-model-entry';
import { SchemaItem } from './schema-item';
import { ObjectID } from 'mongodb';
import { isValidObjectID } from '../../utils/utils';
import { SchemaIdArray } from './schema-id-array';
import Factory from '../../core/model-factory';
import Controllers from '../../core/controller-factory';
import { Schema } from '../schema';

export type Client = string | IModelEntry<'client'> | null;

/**
 * Represents a mongodb ObjectID of a document in separate collection.
 * Foreign keys are used as a way of relating models to one another. They can be required or optional.
 * Required keys will mean that the current document cannot exist if the target does not. Optional keys
 * will simply be nullified if the target no longer exists.
 */
export class SchemaForeignKey extends SchemaItem<ObjectID | null, Client> {
  public targetCollection: string;
  public keyCanBeNull: boolean;
  public nullifyOnDelete: boolean;
  // public canAdapt: boolean;
  public curLevel: number;

  // private _targetDoc: Schema<IModelEntry<'server' | 'client'>> | null;


  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param targetCollection The name of the collection to which the target exists
   */
  constructor( name: string, targetCollection: string, options?: Partial<IForeignKeyOptions> ) {
    super( name, null );

    options = {
      keyCanBeNull: true,
      nullifyOnDelete: true,
      /** canAdapt: true, */
      ...options
    };

    if ( !targetCollection )
      throw new Error( `You must specify a targetCollection property for model option '${name}'` );

    this.targetCollection = targetCollection;
    // this.canAdapt = options.canAdapt!;
    this.curLevel = 1;
    this.keyCanBeNull = options.keyCanBeNull!;
    this.nullifyOnDelete = options.nullifyOnDelete!;
  }

  /**
   * Creates a clone of this item
   */
  public clone( copy?: SchemaForeignKey ): SchemaForeignKey {
    copy = copy === undefined ? new SchemaForeignKey( this.name, this.targetCollection ) : copy;
    super.clone( copy );
    copy.targetCollection = this.targetCollection;
    copy.keyCanBeNull = this.keyCanBeNull;
    copy.nullifyOnDelete = this.nullifyOnDelete;
    // copy.canAdapt = this.canAdapt;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public async validate( val: Client ) {
    let toRet: ObjectID | null = null;

    // If they key is required then it must exist
    const model = Factory.get( this.targetCollection );

    if ( !model )
      throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

    if ( typeof val === 'string' ) {
      if ( isValidObjectID( val ) )
        toRet = new ObjectID( val );
      else if ( val.trim() !== '' )
        throw new Error( `Please use a valid ID for '${this.name}'` );
      else
        toRet = null;
    }
    else if ( val && ( val as IModelEntry<'client'> )._id ) {
      if ( !ObjectID.isValid( ( val as IModelEntry<'client'> )._id ) )
        throw new Error( `${this.name} object._id must be a valid ID string, ObjectId or IModelEntry` );

      toRet = new ObjectID( ( val as IModelEntry<'client'> )._id );
    }
    else if ( val && !ObjectID.isValid( val as any ) ) {
      throw new Error( `${this.name} must be a valid ID string, ObjectId or IModelEntry` );
    }

    if ( !toRet )
      toRet = null;

    if ( !this.keyCanBeNull && !toRet )
      throw new Error( `${this.name} does not exist` );

    // We can assume the value is object id by this point
    const result = await model.findOne( { _id: toRet } );

    if ( !this.keyCanBeNull && !result )
      throw new Error( `${this.name} does not exist` );

    // this._targetDoc = result;

    return toRet;
  }

  /**
   * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
   * doing any post update/insert operations
   * @param instance The model instance that was inserted or updated
   * @param collection The DB collection that the model was inserted into
   */
  public async postUpsert( schema: Schema<IModelEntry<'server'>>, collection: string ): Promise<void> {
    const dbValue = this.getDbValue();
    if ( dbValue && this.nullifyOnDelete ) {
      const fkeys = Controllers.get( 'foreign-keys' );
      await fkeys.createNullTarget( dbValue, schema.dbEntry._id, this.name, this.targetCollection );
    }
    //   if ( !this._targetDoc )
    //     return;

    //   // If they key is required then it must exist
    //   const model = Factory.get( this.targetCollection );

    //   let optionalDeps = this._targetDoc.dbEntry._optionalDependencies;
    //   let requiredDeps = this._targetDoc.dbEntry._requiredDependencies;

    //   // Now we need to register the schemas source with the target model
    //   if ( this.canAdapt ) {
    //     if ( !optionalDeps )
    //       optionalDeps = [];

    //     optionalDeps.push( { _id: schema.dbEntry._id, collection: collection, propertyName: this.name } );
    //   }
    //   else {
    //     if ( !requiredDeps )
    //       requiredDeps = [];

    //     requiredDeps.push( { _id: schema.dbEntry._id, collection: collection } );
    //   }

    //   await model.collection.updateOne( <IModelEntry<'server'>>{ _id: this._targetDoc.dbEntry._id }, {
    //     $set: <IModelEntry<'server'>>{
    //       _optionalDependencies: optionalDeps,
    //       _requiredDependencies: requiredDeps
    //     }
    //   } );

    //   // Nullify the target doc cache
    //   this._targetDoc = null;
    //   return;
  }

  /**
   * Called after a model instance is deleted. Useful for any schema item cleanups.
   * @param instance The model instance that was deleted
   */
  public async postDelete( schema: Schema<IModelEntry<'server'>>, collection: string ): Promise<void> {
    //   // If they key is required then it must exist
    //   const model = Factory.get( this.targetCollection );
    //   if ( !model )
    //     return;

    //   const val = this.getDbValue();

    //   if ( !val )
    //     return;

    //   // We can assume the value is object id by this point
    //   const result = await model.findOne( { _id: val } );
    //   if ( !result )
    //     return;

    //   let query;

    //   if ( this.canAdapt )
    //     query = { $pull: { _optionalDependencies: { _id: schema.dbEntry._id } } };
    //   else
    //     query = { $pull: { _requiredDependencies: { _id: schema.dbEntry._id } } };

    //   await model.collection.updateOne( <IModelEntry<'server'>>{ _id: this._targetDoc!.dbEntry._id }, query );
    //   return;
  }

  /**
   * Gets the value of this item
   * @param options [Optional] A set of options that can be passed to control how the data must be returned
   */
  public async getValue( options: ISchemaOptions ) {

    if ( options.expandForeignKeys && options.expandMaxDepth === undefined )
      throw new Error( 'You cannot set expandForeignKeys and not specify the expandMaxDepth' );

    const val = this.getDbValue();

    if ( val && !options.expandForeignKeys )
      return val.toString();

    if ( val && options.expandSchemaBlacklist && options.expandSchemaBlacklist.indexOf( this.name ) !== -1 )
      return val.toString();

    const model = Factory.get( this.targetCollection );
    if ( !model )
      throw new Error( `${this.name} references a foreign key '${this.targetCollection}' which doesn't seem to exist` );

    if ( !val )
      return null;

    // Make sure the current level is not beyond the max depth
    if ( options.expandMaxDepth !== undefined && options.expandMaxDepth !== -1 ) {
      if ( this.curLevel > options.expandMaxDepth )
        return val.toString();
    }

    const result = await model.findOne( { _id: val } );

    if ( !result && !this.keyCanBeNull )
      throw new Error( `Could not find an instance for ${this.name}'s in the collection '${this.targetCollection}' with value '${val.toString()}'` );
    else if ( !result && this.keyCanBeNull )
      return null;

    // Get the models items are increase their level - this ensures we dont go too deep
    const items = result!.getItems()!;
    const nextLevel = this.curLevel + 1;

    for ( let i = 0, l = items.length; i < l; i++ )
      if ( items[ i ] instanceof SchemaForeignKey || items[ i ] instanceof SchemaIdArray )
        ( <SchemaForeignKey | SchemaIdArray>items[ i ] ).curLevel = nextLevel;

    return await result!.downloadToken( options ) as Client;
  }
}