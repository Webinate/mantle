import { Model } from './model';
import { foreignKey, date, json, textArray } from './schema-items/schema-item-factory';
import { IDraft } from '../types/models/i-draft';

/**
 * A model for describing drafts
 */
export class DraftsModel extends Model<IDraft<'client' | 'server'>> {
  constructor() {
    super( 'drafts' );

    this.schema.addItems( [
      new foreignKey( 'parent', 'documents', { keyCanBeNull: false } ),
      new foreignKey( 'template', 'templates', { keyCanBeNull: false } ),
      new json( 'templateMap', {} ),
      new date( 'lastModified', { useNow: true } ),
      new textArray( 'elementsOrder', [] ),
      new date( 'createdOn' ).setIndexable( true ),
      new date( 'lastUpdated', { useNow: true } ).setIndexable( true )
    ] );
  }
}