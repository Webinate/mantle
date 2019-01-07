import { Model } from '../model';
import { foreignKey, text, html } from '../schema-items/schema-item-factory';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';
import { SchemaHtml } from '../schema-items/schema-html';

/**
 * A model for describing paragraph elements
 */
export class ElmParagraph extends Model<IDraftElement<'server'>, IDraftElement<'client' | 'expanded'>> {
  constructor() {
    super( 'elements' );

    const type: DraftElements = 'elm-paragraph';

    this.schema.addItems( [
      new foreignKey( 'parent', 'documents', { keyCanBeNull: false } ),
      new text( 'type', type ),
      new text( 'zone', 'unassigned' ),
      new html( 'html', '<p></p>', {
        allowedTags: SchemaHtml.inlineTags.concat( 'p' ),
        errorBadHTML: false
      } )
    ] );
  }
}