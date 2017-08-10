import { SchemaItem } from './schema-item';

/**
 * A date scheme item for use in Models
 */
export class SchemaDate extends SchemaItem<number> {
  public useNow: boolean;

  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The date of this item. If none is specified the Date.now() number is used.
   * @param useNow [Optional] If true, the date will always be updated to use the current date
   */
  constructor( name: string, val: number = 0, useNow: boolean = true ) {
    super( name, val );
    this.useNow = useNow;
  }

	/**
	 * Creates a clone of this item
	 * @returns copy A sub class of the copy
	 * @returns
	 */
  public clone( copy?: SchemaDate ): SchemaDate {
    copy = !copy ? new SchemaDate( this.name, <number>this.value ) : copy;
    copy.useNow = this.useNow;
    super.clone( copy );
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public validate(): Promise<boolean | Error> {
    if ( this.useNow )
      this.value = Date.now();

    return Promise.resolve( true );
  }

  /**
 * Gets the value of this item
 */
  public async getValue(): Promise<number> {
    return ( this.value !== undefined && this.value !== null ? this.value : Date.now() );
  }
}