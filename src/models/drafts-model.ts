import { Model } from './model';
import { foreignKey, date, json } from './schema-items/schema-item-factory';
import { IDraft } from '../types/models/i-draft';

/**
 * A model for describing drafts
 */
export class DraftsModel extends Model<IDraft<'server'>, IDraft<'client' | 'expanded'>> {
  constructor() {
    super( 'drafts' );

    this.schema.addItems( [
      new foreignKey( 'parent', 'documents', { keyCanBeNull: false } ),
      new date( 'lastModified', { useNow: true } ),
      new json( 'html', {} ),
      new date( 'createdOn' ).setIndexable( true ),
      new date( 'lastUpdated', { useNow: true } ).setIndexable( true )
    ] );
  }
}