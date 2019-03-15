import { SchemaItem } from './schema-item';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

/**
 * A bool scheme item for use in Models
 */
export class SchemaBool extends SchemaItem<boolean, boolean | undefined | null> {
  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The value of this item
   */
  constructor(name: string, val: boolean) {
    super(name, val);
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone(copy?: SchemaBool): SchemaBool {
    copy = copy === undefined ? new SchemaBool(this.name, this.getDbValue()) : copy;
    super.clone(copy);
    return copy;
  }

  /**
   * Always true
   */
  public async validate(val: boolean | undefined | null) {
    if (val === undefined) throw new Error(`${this.name} cannot be undefined`);
    if (val === null) throw new Error(`${this.name} cannot be null`);

    return val;
  }

  /**
   * Gets the value of this item
   */
  public async getValue(options?: ISchemaOptions) {
    return this.getDbValue();
  }
}
