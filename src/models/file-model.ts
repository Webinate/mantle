import { Model } from './model';
import { text, num, date, bool, json, foreignKey, id } from './schema-items/schema-item-factory';
import { IFileEntry } from '../types/models/i-file-entry';

/**
 * A model for describing comments
 */
export class FileModel extends Model<IFileEntry<'client' | 'server'>> {
  constructor() {
    super( 'files' );

    this.schema.addItems( [
      new text( 'name', '', { minCharacters: 3 } ),
      new foreignKey( 'user', 'users', { keyCanBeNull: true } ),
      new text( 'identifier', '', { minCharacters: 6 } ).setReadOnly( true ),
      new id( 'volumeId' ).setReadOnly( true ),
      new text( 'volumeName', '' ).setReadOnly( true ),
      new text( 'publicURL', '' ).setReadOnly( true ),
      new text( 'mimeType', '' ).setReadOnly( true ),
      new foreignKey( 'parentFile', 'files', { keyCanBeNull: true } ),
      new num( 'size', 0, { min: 1 } ).setReadOnly( true ),
      new num( 'numDownloads', 0 ),
      new bool( 'isPublic', true ),
      new json( 'meta', {} ),
      new date( 'created' ).setIndexable( true )
    ] );
  }
}