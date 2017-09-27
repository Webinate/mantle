import { Model } from './model';
import { text } from './schema-items/schema-item-factory';

/**
 * A model for describing post categories
 */
export class CategoriesModel extends Model {
  constructor() {
    super( 'categories' );

    this.defaultSchema.add( new text( 'title', '', { minCharacters: 1 } ) );
    this.defaultSchema.add( new text( 'slug', '', { maxCharacters: 20, minCharacters: 1 } ) ).setUnique( true );
    this.defaultSchema.add( new text( 'description', '' ) );
    this.defaultSchema.add( new text( 'parent', '' ) );
  }
}