import { SchemaItem } from './schema-item';
import * as sanitizeHtml from 'sanitize-html';
import { IHtmlOptions } from '../../types/interfaces/i-schema-options';

/**
* An html scheme item for use in Models
*/
export class SchemaHtml extends SchemaItem<string> {
  /**
   * The default tags allowed
   * includes: h3, h4, h5, h6, blockquote, p, a, ul, ol,
   *    nl, li, b, i, strong, em, strike, code, hr, br, div,
   *    table, thead, caption, tbody, tr, th, td, pre
   */
  public static defaultTags: Array<string> = [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'iframe',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre' ];

  /**
   * The default allowed attributes for each tag
   */
  public static defaultAllowedAttributes: { [ name: string ]: Array<string> } = {
    a: [ 'href', 'name', 'target' ],
    img: [ 'src', 'style', 'width', 'height', 'id', 'class' ],
    iframe: [ 'src', 'width', 'height', 'frameborder', 'allowfullscreen' ]
  };

  public allowedTags: Array<string>;
  public allowedAttributes: { [ name: string ]: Array<string> };
  public errorBadHTML: boolean;
  public minCharacters: number;
  public maxCharacters: number;

  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The text of this item
   */
  constructor( name: string, val: string, options?: IHtmlOptions ) {
    super( name, val );

    options = {
      allowedTags: SchemaHtml.defaultTags,
      allowedAttributes: SchemaHtml.defaultAllowedAttributes,
      errorBadHTML: true,
      minCharacters: 0,
      maxCharacters: 10000,
      ...options
    };

    this.errorBadHTML = options.errorBadHTML!;
    this.allowedAttributes = options.allowedAttributes!;
    this.allowedTags = options.allowedTags!;
    this.maxCharacters = options.maxCharacters!;
    this.minCharacters = options.minCharacters!;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone( copy?: SchemaHtml ): SchemaHtml {
    copy = copy === undefined ? new SchemaHtml( this.name, <string>this.value ) : copy;
    super.clone( copy );
    copy.allowedTags = this.allowedTags.slice( 0, this.allowedTags.length );
    copy.allowedAttributes = this.allowedAttributes;
    copy.errorBadHTML = this.errorBadHTML;
    copy.maxCharacters = this.maxCharacters;
    copy.minCharacters = this.minCharacters;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   * @returns Returns true if successful or an error message string if unsuccessful
   */
  public validate(): Promise<boolean | Error> {
    const maxCharacters = this.maxCharacters;
    const minCharacters = this.minCharacters;
    const transformedValue = this.value.trim();

    if ( transformedValue.length < minCharacters && minCharacters === 1 )
      return Promise.reject<Error>( new Error( `'${this.name}' cannot be empty` ) );
    else if ( transformedValue.length > maxCharacters )
      return Promise.reject<Error>( new Error( `The character length of '${this.name}' is too long, please keep it below ${maxCharacters}` ) );
    else if ( transformedValue.length < minCharacters )
      return Promise.reject<Error>( new Error( `The character length of '${this.name}' is too short, please keep it above ${minCharacters}` ) );

    const sanitizedHTML = sanitizeHtml( this.value, { allowedAttributes: this.allowedAttributes, allowedTags: this.allowedTags } ).trim();
    if ( this.errorBadHTML && transformedValue !== sanitizedHTML )
      return Promise.reject<Error>( new Error( `'${this.name}' has html code that is not allowed` ) );

    this.value = sanitizedHTML;
    return Promise.resolve( true );
  }
}