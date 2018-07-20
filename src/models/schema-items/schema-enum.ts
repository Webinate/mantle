import { SchemaItem } from './schema-item';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

export type Options = {
  canBeEmpty: boolean;
}

/**
 * A scheme item that allows for a given range of text choices
 */
export class SchemaEnum extends SchemaItem<string, string> {
  public canBeEmpty: boolean;
  public enums: string[];

  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The selected enum
   * @param enums The range of enums allowed
   * @param options Optional params
   */
  constructor( name: string, val: string, enums: string[], options: Options = { canBeEmpty: false } ) {
    super( name, val );
    this.enums = enums;
    this.canBeEmpty = options.canBeEmpty;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   * @returns
   */
  public clone( copy?: SchemaEnum ): SchemaEnum {
    copy = copy === undefined ? new SchemaEnum( this.name, this.getDbValue(), this.enums ) : copy;
    super.clone( copy );
    copy.canBeEmpty = this.canBeEmpty;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public async validate( val: string | undefined ) {
    const enums = this.enums;
    val = val || '';

    if ( !this.canBeEmpty && val!.trim() === '' )
      throw new Error( `${this.name} cannot be ` );
    else if ( this.canBeEmpty && val!.trim() === '' )
      return '';

    if ( !enums.includes( val ) )
      throw new Error( `${this.name} is not a valid entry` );

    return val;
  }

  /**
   * Gets the value of this item
   */
  public async getValue( options?: ISchemaOptions ) {
    return this.getDbValue();
  }
}