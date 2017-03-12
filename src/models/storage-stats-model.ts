import { Model } from './model';
import { text, num, date } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class StorageStatsModel extends Model {
    constructor() {
        super( 'storage-stats' );

        this.defaultSchema.add( new text( 'user', '' ) );
        this.defaultSchema.add( new num( 'memoryUsed', 0 ) );
        this.defaultSchema.add( new num( 'memoryAllocated', 0 ) );
        this.defaultSchema.add( new num( 'apiCallsUsed', 0 ) );
        this.defaultSchema.add( new num( 'apiCallsAllocated', 0 ) );
        this.defaultSchema.add( new date( 'created' ) ).setIndexable( true );
        this.defaultSchema.add( new date( 'lastLoggedIn', undefined, true ) ).setIndexable( true );
    }
}