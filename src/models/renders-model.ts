import { Model } from './model';
import { text, date } from './schema-items/schema-item-factory';

/**
 * Describes a model for page renders that can be served to bots or crawlers
 */
export class RendersModel extends Model {
  constructor() {
    super( 'renders' );

    this.defaultSchema.add( new text( 'url', '', { minCharacters: 1, maxCharacters: 1000, htmlClean: false } ) );
    this.defaultSchema.add( new text( 'html', '', { maxCharacters: Number.MAX_VALUE, htmlClean: false } ) );
    this.defaultSchema.add( new date( 'expiration', undefined, { useNow: false } ) );
    this.defaultSchema.add( new date( 'createdOn' ) ).setIndexable( true );
  }
}