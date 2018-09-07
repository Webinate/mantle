import { Model } from './model';
import { text, date } from './schema-items/schema-item-factory';
import { IRender } from '../types/models/i-render';

/**
 * Describes a model for page renders that can be served to bots or crawlers
 */
export class RendersModel extends Model<IRender<'client' | 'server'>> {
  constructor() {
    super( 'renders' );

    this.schema.addItems( [
      new text( 'url', '', { minCharacters: 1, maxCharacters: 1000, htmlClean: false } ),
      new text( 'html', '', { maxCharacters: Number.MAX_VALUE, htmlClean: false } ),
      new date( 'expiration', { useNow: false } ),
      new date( 'createdOn' ).setIndexable( true )
    ] );
  }
}