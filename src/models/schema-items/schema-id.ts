import { SchemaItem } from './schema-item';
import { ObjectID } from 'mongodb';
import { isValidObjectID } from '../../utils/utils';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

/**
 * A mongodb ObjectID scheme item for use in Models
 */
export class SchemaId extends SchemaItem<ObjectID | null, string | null> {
  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The string representation of the object ID
   */
  constructor(name: string) {
    super(name, null);
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone(copy?: SchemaId): SchemaId {
    copy = copy === undefined ? new SchemaId(this.name) : copy;
    super.clone(copy);
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public async validate(val: string | null) {
    let transformedValue: ObjectID | null = null;

    if (typeof val === 'string') {
      if (isValidObjectID(val)) transformedValue = new ObjectID(val);
      else if (val.trim() !== '') throw new Error(`Please use a valid ID for '${this.name}'`);
      else transformedValue = null;
    }

    if (!transformedValue) return null;

    return transformedValue;
  }

  /**
   * Gets the value of this item
   */
  public async getValue(options?: ISchemaOptions) {
    const val = this.getDbValue();
    return val ? val.toString() : null;
  }
}
