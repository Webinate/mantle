import { SchemaItem } from './schema-item';
import { IDateOptions } from '../../types/interfaces/i-schema-options';

/**
 * A date scheme item for use in Models
 */
export class SchemaDate extends SchemaItem<number, number> {
  public useNow: boolean;

  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The date of this item. If none is specified the Date.now() number is used.
   */
  constructor( name: string, val: number = 0, options?: IDateOptions ) {
    super( name, val );
    options = { useNow: true, ...options };
    this.useNow = options.useNow!;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   * @returns
   */
  public clone( copy?: SchemaDate ): SchemaDate {
    copy = !copy ? new SchemaDate( this.name, this.getDbValue() ) : copy;
    copy.useNow = this.useNow;
    super.clone( copy );

    if ( this.useNow && this.getDbValue() === 0 )
      copy.setDbValue( Date.now() )

    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public async validate( val: number ) {
    if ( this.useNow )
      return Date.now();
    else
      return this.getDbValue();
  }

  /**
   * Gets the value of this item
   */
  public async getValue() {
    return this.getDbValue();
  }
}