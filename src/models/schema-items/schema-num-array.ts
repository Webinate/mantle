import { SchemaItem } from './schema-item';
import { NumType, INumArrOptions } from '../../types/interfaces/i-schema-options';

/**
 * A number array scheme item for use in Models
 */
export class SchemaNumArray extends SchemaItem<Array<number>> {
  public minItems: number;
  public maxItems: number;
  public min: number;
  public max: number;
  public type: NumType;
  public decimalPlaces: number;

  /**
   * Creates a new schema item that holds an array of number items
   * @param name The name of this item
   * @param val The number array of this schema item
   */
  constructor( name: string, val: Array<number>, options?: INumArrOptions ) {
    super( name, val );
    options = {
      minItems: 0,
      maxItems: Infinity,
      min: -Infinity,
      max: Infinity,
      type: 'Int',
      decimalPlaces: 2,
      ...options
    };

    this.max = options.max!;
    this.min = options.min!;
    this.maxItems = options.maxItems!;
    this.minItems = options.minItems!;
    this.type = options.type!;

    if ( options.decimalPlaces! > 20 )
      throw new Error( `Decimal palces for ${name} cannot be more than 20` );

    this.decimalPlaces = options.decimalPlaces!;

  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone( copy?: SchemaNumArray ): SchemaNumArray {
    copy = copy === undefined ? new SchemaNumArray( this.name, this.value ) : copy;
    super.clone( copy );

    copy.max = this.max;
    copy.min = this.min;
    copy.maxItems = this.maxItems;
    copy.minItems = this.minItems;
    copy.type = this.type;
    copy.decimalPlaces = this.decimalPlaces;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public validate(): Promise<boolean | Error> {
    const transformedValue = this.value;
    const max = this.max;
    const min = this.min;
    const type = this.type;
    let temp: number;
    const decimalPlaces = this.decimalPlaces;

    for ( let i = 0, l = transformedValue.length; i < l; i++ ) {
      if ( type === 'Int' )
        temp = parseInt( transformedValue.toString() );
      else
        temp = parseFloat( ( parseFloat( transformedValue.toString() ).toFixed( decimalPlaces ) ) );

      if ( temp < min || temp > max )
        return Promise.reject<Error>( new Error( `The value of ${this.name} is not within the range of ${this.min} and ${this.max}` ) );

      transformedValue[ i ] = temp;
    }

    if ( transformedValue.length < this.minItems )
      return Promise.reject<Error>( new Error( `You must select at least ${this.minItems} item${( this.minItems === 1 ? '' : 's' )} for ${this.name}` ) );
    if ( transformedValue.length > this.maxItems )
      return Promise.reject<Error>( new Error( `You have selected too many items for ${this.name}, please only use up to ${this.maxItems}` ) );

    return Promise.resolve( true );
  }
}