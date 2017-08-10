import { SchemaItem } from './schema-item';

/**
 * A bool scheme item for use in Models
 */
export class SchemaBool extends SchemaItem<boolean> {
	/**
	 * Creates a new schema item
	 * @param name The name of this item
	 * @param val The value of this item
	 */
  constructor( name: string, val: boolean ) {
    super( name, val );
  }

	/**
	 * Creates a clone of this item
	 * @returns copy A sub class of the copy
 	 */
  public clone( copy?: SchemaBool ): SchemaBool {
    copy = copy === undefined ? new SchemaBool( this.name, <boolean>this.value ) : copy;
    super.clone( copy );
    return copy;
  }

	/**
	 * Always true
	 */
  public validate(): Promise<boolean | Error> {
    const val = this.value;
    if ( val === undefined )
      return Promise.reject<Error>( new Error( `${this.name} cannot be undefined` ) );
    if ( val === null )
      return Promise.reject<Error>( new Error( `${this.name} cannot be null` ) );

    return Promise.resolve( true );
  }
}