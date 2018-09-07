import { Model } from './model';
import { text, bool, textArray, date, html, foreignKey } from './schema-items/schema-item-factory';
import { SchemaHtml } from './schema-items/schema-html';
import { IPost } from '../types/models/i-post';

/**
 * A model for describing posts
 */
export class PostsModel extends Model<IPost<'client' | 'server'>> {
  constructor() {
    super( 'posts' );

    this.schema.addItems( [
      new foreignKey( 'author', 'users', { keyCanBeNull: true, nullifyOnDelete: true } ),
      new text( 'title', '', { minCharacters: 1 } ),
      new text( 'slug', '', { maxCharacters: 512, minCharacters: 1 } ).setUnique( true ).setRequired( true ),
      new text( 'brief', '' ),
      new text( 'featuredImage', '' ),
      new html( 'content', '', { allowedTags: SchemaHtml.defaultTags.concat( 'img' ), errorBadHTML: false } ),
      new bool( 'public', true ),
      new textArray( 'categories', [] ),
      new textArray( 'tags', [] ),
      new date( 'createdOn' ).setIndexable( true ),
      new date( 'lastUpdated', undefined ).setIndexable( true )
    ] );
  }
}