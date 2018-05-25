import { SchemaItem } from './schema-item';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

/**
 * A json scheme item for use in Models
 */
export class SchemaJSON<TServer, YClient> extends SchemaItem<TServer | null, YClient | null | undefined> {
  /**
   * Creates a new schema item
   * @param name The name of this item
   * @param val The text of this item
   */
  constructor( name: string, val: any ) {
    super( name, val );
  }

  /**
   * Creates a clone of this item
   * @returns copy A sub class of the copy
   */
  public clone( copy?: SchemaJSON<any, any> ): SchemaJSON<any, any> {
    copy = copy === undefined ? new SchemaJSON( this.name, this.getDbValue() ) : copy;
    super.clone( copy );
    return copy;
  }

  /**
   * Checks the value stored to see if its correct in its current form
   */
  public async validate( val: YClient | null | undefined ) {
    if ( val === undefined )
      return null;

    return val as any as TServer;
  }

  /**
   * Gets the value of this item
   */
  public async getValue( options?: ISchemaOptions ) {
    return this.getDbValue() as any as YClient;
  }
}