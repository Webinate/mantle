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
    this.defaultSchema.add( new foreignKey( 'post', '', 'posts', false, false ) ).setRequired( true )
    this.defaultSchema.add( new foreignKey( 'parent', '', 'comments', true, false ) )
    this.defaultSchema.add( new idArray( 'children', [], 0, undefined, 'comments' ) )
    this.defaultSchema.add( new html( 'content', '', SchemaHtml.defaultTags.concat( 'img' ), undefined, true ) );
    this.defaultSchema.add( new bool( 'public', true ) );
    this.defaultSchema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.defaultSchema.add( new date( 'lastUpdated', undefined, true ) ).setIndexable( true );
  }
}