import { Model } from './model';
import { text, date } from './schema-items/schema-item-factory';
import { IRender } from '../types/models/i-render';

/**
 * Describes a model for page renders that can be served to bots or crawlers
 */
export class RendersModel extends Model<IRender> {
  constructor() {
    super( 'renders' );

    this.schema.add( new text( 'url', '', { minCharacters: 1, maxCharacters: 1000, htmlClean: false } ) );
    this.schema.add( new text( 'html', '', { maxCharacters: Number.MAX_VALUE, htmlClean: false } ) );
    this.schema.add( new date( 'expiration', undefined, { useNow: false } ) );
    this.schema.add( new date( 'createdOn' ) ).setIndexable( true );
  }
}