import { Model } from './model';
import { text, foreignKey, idArray } from './schema-items/schema-item-factory';
import { ICategory } from '../types/models/i-category';

/**
 * A model for describing post categories
 */
export class CategoriesModel extends Model<ICategory<'client' | 'server'>> {
  constructor() {
    super( 'categories' );

    this.schema.add( new text( 'title', '', { minCharacters: 1 } ) );
    this.schema.add( new text( 'slug', '', { maxCharacters: 20, minCharacters: 1 } ) ).setUnique( true );
    this.schema.add( new text( 'description', '' ) );
    this.schema.add( new foreignKey( 'parent', 'categories', { keyCanBeNull: true, canAdapt: false } ) )
    this.schema.add( new idArray( 'children', 'categories' ) )
  }
}