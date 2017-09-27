import { Model } from './model';
import { text, bool, idArray, date, html, foreignKey } from './schema-items/schema-item-factory';
import { SchemaHtml } from './schema-items/schema-html';

/**
 * A model for describing comments
 */
export class CommentsModel extends Model {
  constructor() {
    super( 'comments' );

    this.defaultSchema.add( new text( 'author', '' ) ).setRequired( true )
    this.defaultSchema.add( new foreignKey( 'post', '', 'posts', { keyCanBeNull: false, canAdapt: false } ) ).setRequired( true )
    this.defaultSchema.add( new foreignKey( 'parent', '', 'comments', { keyCanBeNull: true, canAdapt: false } ) )
    this.defaultSchema.add( new idArray( 'children', [], 'comments' ) )
    this.defaultSchema.add( new html( 'content', '', { allowedTags: SchemaHtml.defaultTags.concat( 'img' ), errorBadHTML: true } ) );
    this.defaultSchema.add( new bool( 'public', true ) );
    this.defaultSchema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.defaultSchema.add( new date( 'lastUpdated', undefined, ) ).setIndexable( true );
  }
}