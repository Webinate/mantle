import { SchemaItem } from './schema-item';
import { INumOptions, NumType } from 'modepress';

/**
 * A numeric schema item for use in Models
 */
export class SchemaNumber extends SchemaItem<number> {
  public min: number;
  public max: number;
  public type: NumType;
  public decimalPlaces: number;

  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The default value of this item
   */
  constructor( name: string, val: number, options?: INumOptions ) {
    super( name, val );
    options = {
      min: -Infinity,
      max: Infinity,
      type: 'Int',
      decimalPlaces: 2,
      ...options
    };

    this.min = options.min!;
    this.max = options.max!;
    this.type = options.type!;

    if ( options.decimalPlaces! > 20 )
      throw new Error( `Decimal palces for ${name} cannot be more than 20` );

    this.decimalPlaces = options.decimalPlaces!;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone( copy?: SchemaNumber ): SchemaNumber {
    copy = copy === undefined ? new SchemaNumber( this.name, <number>this.value ) : copy;
    super.clone( copy );

    copy.min = this.min;
    copy.max = this.max;
    copy.type = this.type;
    copy.decimalPlaces = this.decimalPlaces;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public validate(): Promise<boolean | Error> {
    const type = this.type;
    const decimalPlaces = this.decimalPlaces;
    let transformedValue: number = <number>this.value;

    if ( type === 'Int' )
      transformedValue = parseInt( transformedValue.toString() );
    else
      transformedValue = parseFloat( ( parseFloat( transformedValue.toString() ).toFixed( decimalPlaces ) ) );

    this.value = transformedValue;

    if ( transformedValue <= this.max && transformedValue >= this.min )
      return Promise.resolve( true );
    else
      return Promise.reject<Error>( new Error( `The value of ${this.name} is not within the range of  ${this.min} and ${this.max}` ) );
  }
}