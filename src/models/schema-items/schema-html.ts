import { SchemaItem } from './schema-item';
import * as sanitizeHtml from 'sanitize-html';
import { IHtmlOptions } from '../../types/interfaces/i-schema-options';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

/**
* An html scheme item for use in Models
*/
export class SchemaHtml extends SchemaItem<string, string> {
  /**
   * The default tags allowed
   * includes: h3, h4, h5, h6, blockquote, p, a, ul, ol,
   *    nl, li, b, i, strong, em, strike, code, hr, br, div,
   *    table, thead, caption, tbody, tr, th, td, pre
   */
  public static defaultTags: Array<string> = [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'iframe',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span' ];

  /**
   * An array of common inline tags
   * includes: a, b, i, strong, em, u, strike, hr, br
   */
  public static inlineTags: Array<string> = [ 'a', 'b', 'i', 'strong', 'em', 'u', 'blockquote', 'strike', 'hr', 'br', 'span' ];

  /**
   * The default allowed attributes for each tag
   */
  public static defaultAllowedAttributes: { [ name: string ]: Array<string> } = {
    a: [ 'href', 'name', 'target' ],
    img: [ 'src', 'style', 'width', 'height', 'id', 'class' ],
    iframe: [ 'src', 'width', 'height', 'frameborder', 'allowfullscreen' ]
  };

  public allowedTags: Array<string> | false;
  public allowedAttributes: { [ name: string ]: Array<string> } | false;
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
    copy = copy === undefined ? new SchemaHtml( this.name, this.getDbValue() ) : copy;
    super.clone( copy );
    copy.allowedTags = !this.allowedTags ? false : this.allowedTags.slice( 0, this.allowedTags.length );
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
  public async validate( val: string ) {
    const maxCharacters = this.maxCharacters;
    const minCharacters = this.minCharacters;
    const transformedValue = val.trim();

    if ( transformedValue.length < minCharacters && minCharacters === 1 )
      throw new Error( `'${this.name}' cannot be empty` );
    else if ( transformedValue.length > maxCharacters )
      throw new Error( `The character length of '${this.name}' is too long, please keep it below ${maxCharacters}` );
    else if ( transformedValue.length < minCharacters )
      throw new Error( `The character length of '${this.name}' is too short, please keep it above ${minCharacters}` );

    const sanitizedHTML = sanitizeHtml( val, { allowedAttributes: this.allowedAttributes, allowedTags: this.allowedTags, } ).trim();
    if ( this.errorBadHTML && transformedValue !== sanitizedHTML )
      throw new Error( `'${this.name}' has html code that is not allowed` );

    return sanitizedHTML;
  }

  /**
   * Gets the value of this item
   */
  public async getValue( options?: ISchemaOptions ) {
    return this.getDbValue();
  }
}