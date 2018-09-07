import { Model } from './model';
import { text, num, date, json, enums, foreignKey } from './schema-items/schema-item-factory';
import { IVolume } from '../types/models/i-volume-entry';

/**
 * A model for describing comments
 */
export class VolumeModel extends Model<IVolume<'client' | 'server'>> {
  constructor() {
    super( 'volumes' );

    this.schema.addItems( [
      new text( 'name', '', { minCharacters: 1 } ).setIndexable( true ),
      new enums( 'type', 'local', [ 'local', 'google' ] ),
      new text( 'identifier', '' ),
      new foreignKey( 'user', 'users', { keyCanBeNull: true, nullifyOnDelete: true } ),
      new num( 'memoryUsed', 0 ).setIndexable( true ),
      new num( 'memoryAllocated', 0 ),
      new json( 'meta', {} ),
      new date( 'created' ).setIndexable( true ),
      new date( 'lastLoggedIn', undefined ).setIndexable( true )
    ] );
  }
}