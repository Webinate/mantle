import { Model } from './model';
import { text, bool, idArray, date, html, foreignKey } from './schema-items/schema-item-factory';
import { SchemaHtml } from './schema-items/schema-html';
import { IComment } from '../types/models/i-comment';

/**
 * A model for describing comments
 */
export class CommentsModel extends Model<IComment<'server' | 'client'>> {
  constructor() {
    super( 'comments' );

    this.schema.addItems( [
      new text( 'author', '' ).setRequired( true ),
      new foreignKey( 'post', 'posts', { keyCanBeNull: false } ).setRequired( true ),
      new foreignKey( 'parent', 'comments', { keyCanBeNull: true } ),
      new idArray( 'children', 'comments' ),
      new html( 'content', '', { allowedTags: SchemaHtml.defaultTags.concat( 'img' ), errorBadHTML: true } ),
      new bool( 'public', true ),
      new date( 'createdOn' ).setIndexable( true ),
      new date( 'lastUpdated', undefined ).setIndexable( true )
    ] );
  }
}