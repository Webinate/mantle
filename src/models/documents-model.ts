import { Model } from './model';
import { foreignKey, date } from './schema-items/schema-item-factory';
import { IDocument } from '../types/models/i-document';
import { DocumentSchema } from './schemas/document-schema';

/**
 * A model for describing documents
 */
export class DocumentsModel extends Model<IDocument<'server'>, IDocument<'client'>> {
  constructor() {
    super( 'documents', new DocumentSchema() );

    this.schema.addItems( [
      new foreignKey( 'author', 'users', { keyCanBeNull: true } ),
      new foreignKey( 'template', 'templates', { keyCanBeNull: false } ),
      new foreignKey( 'currentDraft', 'drafts', { keyCanBeNull: true } ),
      new foreignKey( 'publishedDraft', 'drafts', { keyCanBeNull: true } ),
      new date( 'createdOn' ).setIndexable( true ),
      new date( 'lastUpdated', { useNow: true } ).setIndexable( true )
    ] );
  }
}