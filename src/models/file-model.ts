import { Model } from './model';
import { text, num, date, bool, json } from './schema-items/schema-item-factory';
import { IFileEntry } from 'modepress';

/**
 * A model for describing comments
 */
export class FileModel extends Model<IFileEntry> {
  constructor() {
    super( 'buckets' );

    this.schema.add( new text( 'name', '' ) );
    this.schema.add( new text( 'user', '' ) );
    this.schema.add( new text( 'identifier', '' ) );
    this.schema.add( new text( 'bucketId', '' ) );
    this.schema.add( new text( 'bucketName', '' ) );
    this.schema.add( new text( 'publicURL', '' ) );
    this.schema.add( new text( 'mimeType', '' ) );
    this.schema.add( new text( 'parentFile', '' ) );
    this.schema.add( new num( 'size', 0 ) );
    this.schema.add( new num( 'numDownloads', 0 ) );
    this.schema.add( new bool( 'isPublic', true ) );
    this.schema.add( new json( 'meta', {} ) );
    this.schema.add( new date( 'created' ) ).setIndexable( true );
    this.schema.add( new date( 'lastLoggedIn', undefined ) ).setIndexable( true );
  }
}