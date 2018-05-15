import { Model } from './model';
import { IStorageStats } from '../types/models/i-storage-stats';
import { text, num, date } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class StorageStatsModel extends Model<IStorageStats<'client' | 'server'>> {
  constructor() {
    super( 'storage-stats' );

    this.schema.add( new text( 'user', '' ) );
    this.schema.add( new num( 'memoryUsed', 0 ) );
    this.schema.add( new num( 'memoryAllocated', 0 ) );
    this.schema.add( new num( 'apiCallsUsed', 0 ) );
    this.schema.add( new num( 'apiCallsAllocated', 0 ) );
    this.schema.add( new date( 'created' ) ).setIndexable( true );
    this.schema.add( new date( 'lastLoggedIn', undefined ) ).setIndexable( true );
  }
}