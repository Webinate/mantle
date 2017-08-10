import { Model } from './model';
import { text, date } from './schema-items/schema-item-factory';

/**
 * Describes a model for page renders that can be served to bots or crawlers
 */
export class RendersModel extends Model {
  constructor() {
    super( 'renders' );

    this.defaultSchema.add( new text( 'url', '', 1, 1000, false ) );
    this.defaultSchema.add( new text( 'html', '', 0, Number.MAX_VALUE, false ) );
    this.defaultSchema.add( new date( 'expiration', undefined, false ) );
    this.defaultSchema.add( new date( 'createdOn' ) ).setIndexable( true );
  }
}