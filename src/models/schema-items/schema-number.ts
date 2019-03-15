import { SchemaItem } from './schema-item';
import { INumOptions, NumType } from '../../types/interfaces/i-schema-options';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

/**
 * A numeric schema item for use in Models
 */
export class SchemaNumber extends SchemaItem<number, number> {
  public min: number;
  public max: number;
  public type: NumType;
  public decimalPlaces: number;

  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The default value of this item
   */
  constructor(name: string, val: number, options?: INumOptions) {
    super(name, val);
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

    if (options.decimalPlaces! > 20) throw new Error(`Decimal palces for ${name} cannot be more than 20`);

    this.decimalPlaces = options.decimalPlaces!;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone(copy?: SchemaNumber): SchemaNumber {
    copy = copy === undefined ? new SchemaNumber(this.name, this.getDbValue()) : copy;
    super.clone(copy);

    copy.min = this.min;
    copy.max = this.max;
    copy.type = this.type;
    copy.decimalPlaces = this.decimalPlaces;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public async validate(val: number) {
    const type = this.type;
    const decimalPlaces = this.decimalPlaces;
    let transformedValue: number = val;

    if (type === 'Int') transformedValue = parseInt(transformedValue.toString());
    else transformedValue = parseFloat(parseFloat(transformedValue.toString()).toFixed(decimalPlaces));

    if (transformedValue <= this.max && transformedValue >= this.min) return transformedValue;
    else throw new Error(`The value of ${this.name} is not within the range of  ${this.min} and ${this.max}`);
  }

  /**
   * Gets the value of this item
   */
  public async getValue(options?: ISchemaOptions) {
    return this.getDbValue();
  }
}
