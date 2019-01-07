import { Model } from './model';
import { foreignKey, date, json, bool } from './schema-items/schema-item-factory';
import { IDraft } from '../types/models/i-draft';

/**
 * A model for describing drafts
 */
export class DraftsModel extends Model<IDraft<'server'>, IDraft<'client' | 'expanded'>> {
  constructor() {
    super( 'drafts' );

    this.schema.addItems( [
      new foreignKey( 'parent', 'documents', { keyCanBeNull: false } ),
      new json( 'html', {} ),
      new bool( 'published', false ).setIndexable( true ),
      new date( 'createdOn' ).setIndexable( true )
    ] );
  }
}