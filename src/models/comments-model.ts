import { Model } from './model';
import { text, bool, idArray, date, html, foreignKey } from './schema-items/schema-item-factory';
import { SchemaHtml } from './schema-items/schema-html';
import { IComment } from 'modepress';

/**
 * A model for describing comments
 */
export class CommentsModel extends Model<IComment> {
  constructor() {
    super( 'comments' );

    this.schema.add( new text( 'author', '' ) ).setRequired( true )
    this.schema.add( new foreignKey( 'post', '', 'posts', { keyCanBeNull: false, canAdapt: false } ) ).setRequired( true )
    this.schema.add( new foreignKey( 'parent', '', 'comments', { keyCanBeNull: true, canAdapt: false } ) )
    this.schema.add( new idArray( 'children', [], 'comments' ) )
    this.schema.add( new html( 'content', '', { allowedTags: SchemaHtml.defaultTags.concat( 'img' ), errorBadHTML: true } ) );
    this.schema.add( new bool( 'public', true ) );
    this.schema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.schema.add( new date( 'lastUpdated', undefined, ) ).setIndexable( true );
  }
}