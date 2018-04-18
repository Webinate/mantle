import { Model } from './model';
import { text, num, date, json } from './schema-items/schema-item-factory';
import { IBucketEntry } from '../types/models/i-bucket-entry';

/**
 * A model for describing comments
 */
export class BucketModel extends Model<IBucketEntry> {
  constructor() {
    super( 'buckets' );

    this.schema.add( new text( 'name', '' ) ).setIndexable( true );
    this.schema.add( new text( 'identifier', '' ) );
    this.schema.add( new text( 'user', '' ) ).setIndexable( true );
    this.schema.add( new num( 'memoryUsed', 0 ) ).setIndexable( true );
    this.schema.add( new json( 'meta', {} ) );
    this.schema.add( new date( 'created' ) ).setIndexable( true );
    this.schema.add( new date( 'lastLoggedIn', undefined ) ).setIndexable( true );
  }
}