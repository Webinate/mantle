import { Model } from './model';
import { text, bool, textArray, date, html } from './schema-items/schema-item-factory';
import { SchemaHtml } from './schema-items/schema-html';

/**
 * A model for describing posts
 */
export class PostsModel extends Model {
  constructor() {
    super( 'posts' );

    this.defaultSchema.add( new text( 'author', '', { minCharacters: 1 } ) );
    this.defaultSchema.add( new text( 'title', '', { minCharacters: 1 } ) );
    this.defaultSchema.add( new text( 'slug', '', { maxCharacters: 512, minCharacters: 1 } ) ).setUnique( true ).setRequired( true );
    this.defaultSchema.add( new text( 'brief', '' ) );
    this.defaultSchema.add( new text( 'featuredImage', '' ) );
    this.defaultSchema.add( new html( 'content', '', { allowedTags: SchemaHtml.defaultTags.concat( 'img' ), errorBadHTML: false } ) );
    this.defaultSchema.add( new bool( 'public', true ) );
    this.defaultSchema.add( new textArray( 'categories', [] ) );
    this.defaultSchema.add( new textArray( 'tags', [] ) );
    this.defaultSchema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.defaultSchema.add( new date( 'lastUpdated', undefined ) ).setIndexable( true );
  }
}