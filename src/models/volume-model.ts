import { Model } from './model';
import { text, num, date, json, enums } from './schema-items/schema-item-factory';
import { IVolume } from '../types/models/i-volume-entry';

/**
 * A model for describing comments
 */
export class VolumeModel extends Model<IVolume<'client' | 'server'>> {
  constructor() {
    super( 'volumes' );

    this.schema.add( new text( 'name', '' ) ).setIndexable( true );
    this.schema.add( new enums( 'type', 'local', [ 'local', 'google' ] ) );
    this.schema.add( new text( 'identifier', '' ) );
    this.schema.add( new text( 'user', '' ) ).setIndexable( true );
    this.schema.add( new num( 'memoryUsed', 0 ) ).setIndexable( true );
    this.schema.add( new num( 'memoryAllocated', 0 ) );
    this.schema.add( new json( 'meta', {} ) );
    this.schema.add( new date( 'created' ) ).setIndexable( true );
    this.schema.add( new date( 'lastLoggedIn', undefined ) ).setIndexable( true );
  }
}