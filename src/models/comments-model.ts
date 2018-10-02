import { Model } from './model';
import { text, bool, idArray, date, html, foreignKey } from './schema-items/schema-item-factory';
import { IComment } from '../types/models/i-comment';

/**
 * A model for describing comments
 */
export class CommentsModel extends Model<IComment<'server' | 'client'>> {
  constructor() {
    super( 'comments' );

    const allowedTags = [
      'blockquote', 'p', 'a', 'ul', 'ol', 'nl',
      'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'pre'
    ];

    this.schema.addItems( [
      new foreignKey( 'user', 'users', { keyCanBeNull: true } ),
      new text( 'author', '' ).setRequired( true ),
      new foreignKey( 'post', 'posts', { keyCanBeNull: false } ).setRequired( true ),
      new foreignKey( 'parent', 'comments', { keyCanBeNull: true } ),
      new idArray( 'children', 'comments' ),
      new html( 'content', '', { minCharacters: 1, allowedTags: allowedTags, errorBadHTML: true } ),
      new bool( 'public', true ),
      new date( 'createdOn' ).setIndexable( true ),
      new date( 'lastUpdated', { useNow: true } ).setIndexable( true )
    ] );
  }
}