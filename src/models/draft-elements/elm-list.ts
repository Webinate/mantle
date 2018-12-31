import { Model } from '../model';
import { foreignKey, text, html } from '../schema-items/schema-item-factory';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';
import { SchemaHtml } from '../schema-items/schema-html';

/**
 * A model for describing ul elements
 */
export class ElmList extends Model<IDraftElement<'server'>, IDraftElement<'client' | 'expanded'>> {
  constructor() {
    super( 'elements' );

    const type: DraftElements = 'elm-list';

    this.schema.addItems( [
      new foreignKey( 'parent', 'drafts', { keyCanBeNull: false } ),
      new text( 'type', type ),
      new text( 'zone', 'unassigned' ),
      new html( 'html', '<ul></ul>', {
        allowedTags: SchemaHtml.inlineTags.concat( [ 'ul', 'ol', 'li' ] ),
        errorBadHTML: false
      } )
    ] );
  }
}