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

    this.schema.add( new foreignKey( 'author', 'posts', { keyCanBeNull: true, nullifyOnDelete: true } ) );
    this.schema.add( new text( 'title', '', { minCharacters: 1 } ) );
    this.schema.add( new text( 'slug', '', { maxCharacters: 512, minCharacters: 1 } ) ).setUnique( true ).setRequired( true );
    this.schema.add( new text( 'brief', '' ) );
    this.schema.add( new text( 'featuredImage', '' ) );
    this.schema.add( new html( 'content', '', { allowedTags: SchemaHtml.defaultTags.concat( 'img' ), errorBadHTML: false } ) );
    this.schema.add( new bool( 'public', true ) );
    this.schema.add( new textArray( 'categories', [] ) );
    this.schema.add( new textArray( 'tags', [] ) );
    this.schema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.schema.add( new date( 'lastUpdated', undefined ) ).setIndexable( true );
  }
}