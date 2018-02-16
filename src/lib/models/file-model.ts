import { Model } from './model';
import { text, num, date, bool, json, foreignKey, id } from './schema-items/schema-item-factory';
import { IFileEntry } from '../types/models/i-file-entry';

/**
 * A model for describing comments
 */
export class FileModel extends Model<IFileEntry> {
  constructor() {
    super( 'files' );

    this.schema.add( new text( 'name', '', { minCharacters: 3 } ) );
    this.schema.add( new text( 'user', '', { minCharacters: 3 } ) ).setReadOnly( true );
    this.schema.add( new text( 'identifier', '', { minCharacters: 6 } ) ).setReadOnly( true );
    this.schema.add( new id( 'bucketId', '' ) ).setReadOnly( true );
    this.schema.add( new text( 'bucketName', '' ) ).setReadOnly( true );
    this.schema.add( new text( 'publicURL', '' ) ).setReadOnly( true );
    this.schema.add( new text( 'mimeType', '' ) ).setReadOnly( true );
    this.schema.add( new foreignKey( 'parentFile', '', 'files', { keyCanBeNull: true, canAdapt: false } ) );
    this.schema.add( new num( 'size', 0, { min: 1 } ) ).setReadOnly( true );
    this.schema.add( new num( 'numDownloads', 0 ) );
    this.schema.add( new bool( 'isPublic', true ) );
    this.schema.add( new json( 'meta', {} ) );
    this.schema.add( new date( 'created' ) ).setIndexable( true );
    this.schema.add( new date( 'lastLoggedIn', undefined ) ).setIndexable( true );
  }
}