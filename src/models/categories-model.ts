import { Model } from './model';
import { text } from './schema-items/schema-item-factory';

export class CategoriesModel extends Model {
    constructor() {
        super( 'categories' );

        this.defaultSchema.add( new text( 'title', '', 1 ) );
        this.defaultSchema.add( new text( 'slug', '', 1, 20 ) ).setUnique( true );
        this.defaultSchema.add( new text( 'description', '' ) );
        this.defaultSchema.add( new text( 'parent', '' ) );
    }
}