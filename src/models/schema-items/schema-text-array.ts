import { SchemaItem } from './schema-item';
import * as sanitizeHtml from 'sanitize-html';

/**
 * A text scheme item for use in Models
 */
export class SchemaTextArray extends SchemaItem<Array<string>> {
  public minItems: number;
  public maxItems: number;
  public minCharacters: number;
  public maxCharacters: number;

  /**
   * Creates a new schema item that holds an array of text items
   * @param name The name of this item
   * @param val The text array of this schema item
   * @param minItems [Optional] Specify the minimum number of items that can be allowed
   * @param maxItems [Optional] Specify the maximum number of items that can be allowed
   * @param minCharacters [Optional] Specify the minimum number of characters for each text item
   * @param maxCharacters [Optional] Specify the maximum number of characters for each text item
   */
  constructor( name: string, val: Array<string>, minItems: number = 0, maxItems: number = 10000, minCharacters: number = 0, maxCharacters: number = 10000 ) {
    super( name, val );
    this.maxCharacters = maxCharacters;
    this.minCharacters = minCharacters;
    this.maxItems = maxItems;
    this.minItems = minItems;
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   * @returns
   */
  public clone( copy?: SchemaTextArray ): SchemaTextArray {
    copy = copy === undefined ? new SchemaTextArray( this.name, this.value ) : copy;
    super.clone( copy );

    copy.maxCharacters = this.maxCharacters;
    copy.minCharacters = this.minCharacters;
    copy.maxItems = this.maxItems;
    copy.minItems = this.minItems;
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public validate(): Promise<boolean | Error> {
    const transformedValue = this.value;
    const toRemove: number[] = [];
    for ( let i = 0, l = transformedValue.length; i < l; i++ ) {
      transformedValue[ i ] = sanitizeHtml( transformedValue[ i ].trim(), { allowedTags: [] } );

      if ( transformedValue[ i ].trim() === '' )
        toRemove.push( i );
    }

    // Remove any '' cells
    for ( let i = toRemove.length - 1; i >= 0; i-- )
      transformedValue.splice( toRemove[ i ], 1 );

    const maxCharacters = this.maxCharacters;
    const minCharacters = this.minCharacters;


    if ( transformedValue.length < this.minItems )
      return Promise.reject<Error>( new Error( `You must select at least ${this.minItems} item${( this.minItems === 1 ? '' : 's' )} for ${this.name}` ) );
    if ( transformedValue.length > this.maxItems )
      return Promise.reject<Error>( new Error( `You have selected too many items for ${this.name}, please only use up to ${this.maxItems}` ) );

    for ( let i = 0, l = transformedValue.length; i < l; i++ ) {
      transformedValue[ i ] = transformedValue[ i ].trim();
      if ( transformedValue[ i ].length > maxCharacters )
        return Promise.reject<Error>( new Error( `The character length of '${transformedValue[ i ]}' in ${this.name} is too long, please keep it below ${maxCharacters}` ) );
      else if ( transformedValue[ i ].length < minCharacters )
        return Promise.reject<Error>( new Error( `The character length of '${transformedValue[ i ]}' in ${this.name} is too short, please keep it above ${minCharacters}` ) );
    }

    return Promise.resolve( true );
  }
}