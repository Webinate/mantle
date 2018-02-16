import { SchemaItem } from './schema-item';
import * as sanitizeHtml from 'sanitize-html';
import { ITextOptions } from '../../types/interfaces/i-schema-options';

/**
 * A text scheme item for use in Models
 */
export class SchemaText extends SchemaItem<string> {
  public minCharacters: number;
  public maxCharacters: number;
  public htmlClean: boolean;

  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The text of this item
   * @param options Optional params
   */
  constructor( name: string, val: string, options?: ITextOptions ) {
    super( name, val );
    options = { htmlClean: true, maxCharacters: 10000, minCharacters: 0, ...options };
    this.maxCharacters = options.maxCharacters!;
    this.minCharacters = options.minCharacters!;
    this.htmlClean = options.htmlClean!;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   * @returns
   */
  public clone( copy?: SchemaText ): SchemaText {
    copy = copy === undefined ? new SchemaText( this.name, <string>this.value ) : copy;
    super.clone( copy );

    copy.maxCharacters = this.maxCharacters;
    copy.minCharacters = this.minCharacters;
    copy.htmlClean = this.htmlClean;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public validate(): Promise<boolean | Error> {
    const maxCharacters = this.maxCharacters;
    const minCharacters = this.minCharacters;
    this.value = this.value || '';
    let transformedValue = '';

    if ( this.htmlClean )
      transformedValue = sanitizeHtml( this.value.trim(), { allowedTags: [] } );
    else
      transformedValue = this.value.trim();

    this.value = transformedValue;

    if ( transformedValue.length < minCharacters && minCharacters === 1 )
      return Promise.reject<Error>( new Error( `${this.name} cannot be empty` ) );
    if ( transformedValue.length > maxCharacters )
      return Promise.reject<Error>( new Error( `The character length of ${this.name} is too long, please keep it below ${maxCharacters}` ) );
    else if ( transformedValue.length < minCharacters )
      return Promise.reject<Error>( new Error( `The character length of ${this.name} is too short, please keep it above ${minCharacters}` ) );
    else
      return Promise.resolve( true );
  }
}