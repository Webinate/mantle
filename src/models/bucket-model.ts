import { Model } from './model';
import { text, num, date, json } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class BucketModel extends Model {
    constructor() {
        super( 'buckets' );

        this.defaultSchema.add( new text( 'name', '' ) );
        this.defaultSchema.add( new text( 'identifier', '' ) );
        this.defaultSchema.add( new text( 'user', '' ) );
        this.defaultSchema.add( new num( 'memoryUsed', 0 ) );
        this.defaultSchema.add( new json( 'meta', {} ) );
        this.defaultSchema.add( new date( 'created' ) ).setIndexable( true );
        this.defaultSchema.add( new date( 'lastLoggedIn', undefined, true ) ).setIndexable( true );
    }
}