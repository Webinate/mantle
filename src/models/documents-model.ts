import { Model } from './model';
import { foreignKey, date, textArray } from './schema-items/schema-item-factory';
import { IDocument } from '../types/models/i-document';
import { DocumentSchema } from './schemas/document-schema';
import { Collection, Db } from 'mongodb';

/**
 * A model for describing documents
 */
export class DocumentsModel extends Model<IDocument<'server'>, IDocument<'client' | 'expanded'>> {
  constructor() {
    super( 'documents', new DocumentSchema() );

    this.schema.addItems( [
      new foreignKey( 'author', 'users', { keyCanBeNull: true } ),
      new foreignKey( 'currentDraft', 'drafts', { keyCanBeNull: true } ),
      new textArray( 'elementsOrder', [] ),
      new foreignKey( 'template', 'templates', { keyCanBeNull: false } ),
      new date( 'createdOn' ).setIndexable( true ),
      new date( 'lastUpdated', { useNow: true } ).setIndexable( true )
    ] );
  }

  async initialize( collection: Collection, db: Db ) {
    const elmCollection = await db.collection( 'elements' );
    ( this.schema as DocumentSchema ).setElementCollection( elmCollection );
    return super.initialize( collection, db );
  }
}