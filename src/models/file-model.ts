import { Model } from './model';
import { text, num, date, bool, json } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class FileModel extends Model {
  constructor() {
    super( 'buckets' );

    this.defaultSchema.add( new text( 'name', '' ) );
    this.defaultSchema.add( new text( 'user', '' ) );
    this.defaultSchema.add( new text( 'identifier', '' ) );
    this.defaultSchema.add( new text( 'bucketId', '' ) );
    this.defaultSchema.add( new text( 'bucketName', '' ) );
    this.defaultSchema.add( new text( 'publicURL', '' ) );
    this.defaultSchema.add( new text( 'mimeType', '' ) );
    this.defaultSchema.add( new text( 'parentFile', '' ) );
    this.defaultSchema.add( new num( 'size', 0 ) );
    this.defaultSchema.add( new num( 'numDownloads', 0 ) );
    this.defaultSchema.add( new bool( 'isPublic', true ) );
    this.defaultSchema.add( new json( 'meta', {} ) );
    this.defaultSchema.add( new date( 'created' ) ).setIndexable( true );
    this.defaultSchema.add( new date( 'lastLoggedIn', undefined, true ) ).setIndexable( true );
  }
}