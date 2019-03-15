import { SchemaItem } from './schema-item';
import * as sanitizeHtml from 'sanitize-html';
import { ITextArrOptions } from '../../types/interfaces/i-schema-options';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

/**
 * A text scheme item for use in Models
 */
export class SchemaTextArray extends SchemaItem<string[], string[]> {
  public minItems: number;
  public maxItems: number;
  public minCharacters: number;
  public maxCharacters: number;

  /**
   * Creates a new schema item that holds an array of text items
   * @param name The name of this item
   * @param val The text array of this schema item
   */
  constructor(name: string, val: Array<string>, options?: ITextArrOptions) {
    super(name, val);
    options = { minItems: 0, maxItems: 10000, minCharacters: 0, maxCharacters: 10000, ...options };
    this.maxCharacters = options.maxCharacters!;
    this.minCharacters = options.minCharacters!;
    this.maxItems = options.maxItems!;
    this.minItems = options.minItems!;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   * @returns
   */
  public clone(copy?: SchemaTextArray): SchemaTextArray {
    copy = copy === undefined ? new SchemaTextArray(this.name, this.getDbValue()) : copy;
    super.clone(copy);

    copy.maxCharacters = this.maxCharacters;
    copy.minCharacters = this.minCharacters;
    copy.maxItems = this.maxItems;
    copy.minItems = this.minItems;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public async validate(val: string[]) {
    const transformedValue = val;
    const toRemove: number[] = [];
    for (let i = 0, l = transformedValue.length; i < l; i++) {
      transformedValue[i] = sanitizeHtml(transformedValue[i].trim(), { allowedTags: [] });

      if (transformedValue[i].trim() === '') toRemove.push(i);
    }

    // Remove any '' cells
    for (let i = toRemove.length - 1; i >= 0; i--) transformedValue.splice(toRemove[i], 1);

    const maxCharacters = this.maxCharacters;
    const minCharacters = this.minCharacters;

    if (transformedValue.length < this.minItems)
      throw new Error(
        `You must select at least ${this.minItems} item${this.minItems === 1 ? '' : 's'} for ${this.name}`
      );
    if (transformedValue.length > this.maxItems)
      throw new Error(`You have selected too many items for ${this.name}, please only use up to ${this.maxItems}`);

    for (let i = 0, l = transformedValue.length; i < l; i++) {
      transformedValue[i] = transformedValue[i].trim();
      if (transformedValue[i].length > maxCharacters)
        throw new Error(
          `The character length of '${transformedValue[i]}' in ${
            this.name
          } is too long, please keep it below ${maxCharacters}`
        );
      else if (transformedValue[i].length < minCharacters)
        throw new Error(
          `The character length of '${transformedValue[i]}' in ${
            this.name
          } is too short, please keep it above ${minCharacters}`
        );
    }

    return transformedValue;
  }

  /**
   * Gets the value of this item
   */
  public async getValue(options?: ISchemaOptions) {
    return this.getDbValue();
  }
}
