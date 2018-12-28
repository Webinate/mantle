import { Model } from './model';
import { text, foreignKey, idArray } from './schema-items/schema-item-factory';
import { ICategory } from '../types/models/i-category';

/**
 * A model for describing post categories
 */
export class CategoriesModel extends Model<ICategory<'server'>, ICategory<'client'>> {
  constructor() {
    super( 'categories' );

    this.schema.addItems( [
      new text( 'title', '', { minCharacters: 1 } ),
      new text( 'slug', '', { maxCharacters: 20, minCharacters: 1 } ).setUnique( true ),
      new text( 'description', '' ),
      new foreignKey( 'parent', 'categories', { keyCanBeNull: true } ),
      new idArray( 'children', 'categories' )
    ] );
  }
}