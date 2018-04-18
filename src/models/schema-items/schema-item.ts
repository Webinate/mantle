
import { ISchemaOptions } from '../../types/misc/i-schema-options';
import { IModelEntry } from '../../types/models/i-model-entry';
import { Schema } from '../schema';

/**
 * A definition of each item in the model
 */
export class SchemaItem<T> {
  public name: string;
  public value: T;
  private _sensitive: boolean;
  private _unique: boolean;
  private _uniqueIndexer: boolean;
  private _indexable: boolean;
  private _required: boolean;
  private _modified: boolean;
  private _readOnly: boolean;

  constructor( name: string, value: T ) {
    this.name = name;
    this.value = value;
    this._sensitive = false;
    this._unique = false;
    this._uniqueIndexer = false;
    this._indexable = false;
    this._required = false;
    this._modified = false;
    this._readOnly = false;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone( copy?: SchemaItem<T> ) {
    copy = copy === undefined ? new SchemaItem( this.name, this.value ) : copy;
    copy._unique = this._unique;
    copy._uniqueIndexer = this._uniqueIndexer;
    copy._required = this._required;
    copy._sensitive = this._sensitive;
    copy._readOnly = this._readOnly;
    return copy;
  }

  /**
   * Gets if this item is indexable by mongodb
   */
  public getIndexable(): boolean { return this._indexable; }

  /**
   * Sets if this item is indexable by mongodb
   */
  public setIndexable( val: boolean ): SchemaItem<T> {
    this._indexable = val;
    return this;
  }

  /**
   * Gets if this item is required. If true, then validations will fail if they are not specified
   */
  public getRequired(): boolean { return this._required; }

  /**
   * Sets if this item is required. If true, then validations will fail if they are not specified
   */
  public setRequired( val: boolean ): SchemaItem<T> {
    this._required = val;
    return this;
  }

  /**
   * Gets if this item is read only. If true, then the value can only be set when the item is created
   * and any future updates are ignored
   */
  public getReadOnly(): boolean { return this._readOnly; }

  /**
   * Sets if this item is required. If true, then the value can only be set when the item is created
   * and any future updates are ignored
   */
  public setReadOnly( val: boolean ): SchemaItem<T> {
    this._readOnly = val;
    return this;
  }

  /**
 * Gets if this item represents a unique value in the database. An example might be a username
 */
  public getUnique(): boolean { return this._unique; }

  /**
 * Sets if this item represents a unique value in the database. An example might be a username
 */
  public setUnique( val: boolean ): SchemaItem<T> {
    this._unique = val;
    return this;
  }

  /**
   * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
   * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
   * a given project. In this case the project item is set as a uniqueIndexer
   */
  public getUniqueIndexer(): boolean { return this._uniqueIndexer; }

  /**
 * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
   * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
   * a given project. In this case the project item is set as a uniqueIndexer
 */
  public setUniqueIndexer( val: boolean ): SchemaItem<T> {
    this._uniqueIndexer = val;
    return this;
  }

  /**
   * Gets if this item is sensitive
   */
  public getSensitive(): boolean {
    return this._sensitive;
  }

  /**
   * Gets if this item has been edited since its creation
   */
  public getModified(): boolean {
    return this._modified;
  }

  /**
   * Sets if this item is sensitive
   */
  public setSensitive( val: boolean ): SchemaItem<T> {
    this._sensitive = val;
    return this;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public validate(): Promise<boolean | Error> {
    return Promise.resolve( true );
  }

  /**
   * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
   * doing any post update/insert operations
   * @param collection The DB collection that the model was inserted into
   */
  public async postUpsert( schema: Schema<IModelEntry>, collection: string ): Promise<void> {
    collection; // Supress empty param warning
    return Promise.resolve();
  }

  /**
   * Called after a model instance is deleted. Useful for any schema item cleanups.
   * @param collection The DB collection that the model was deleted from
   */
  public async postDelete( schema: Schema<IModelEntry>, collection: string ): Promise<void> {
    collection; // Supress empty param warning
    return Promise.resolve();
  }

  /**
   * Gets the value of this item in a database safe format
   */
  public getDbValue(): T {
    return this.value;
  }

  /**
   * Gets the value of this item
   * @param options [Optional] A set of options that can be passed to control how the data must be returned
   */
  public async getValue( options?: ISchemaOptions ): Promise<T> {
    options;   // Supress empty param warning
    return this.value;
  }

  /**
   * Sets the value of this item
   * @param {T} val The value to set
   */
  public setValue( val: T ): T {
    this._modified = true;
    return this.value = val;
  }
}