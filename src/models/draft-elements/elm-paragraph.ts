import { Model } from '../model';
import { foreignKey, text, html } from '../schema-items/schema-item-factory';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';
import { SchemaHtml } from '../schema-items/schema-html';

/**
 * A model for describing paragraph elements
 */
export class ElmParagraph extends Model<IDraftElement<'client' | 'server'>> {
  constructor() {
    super( 'elements' );

    const type: DraftElements = 'elm-paragraph';

    this.schema.addItems( [
      new foreignKey( 'parent', 'drafts', { keyCanBeNull: false } ),
      new text( 'type', type ),
      new html( 'html', '', { allowedTags: SchemaHtml.inlineTags.concat( 'p' ) } )
    ] );
  }
}