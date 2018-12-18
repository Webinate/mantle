import { Model } from '../model';
import { foreignKey, text, html } from '../schema-items/schema-item-factory';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';
import { SchemaHtml } from '../schema-items/schema-html';

/**
 * A model for describing image elements
 */
export class ElmImg extends Model<IDraftElement<'client' | 'server'>> {
  constructor() {
    super( 'elements' );

    const type: DraftElements = 'elm-image';

    this.schema.addItems( [
      new foreignKey( 'parent', 'drafts', { keyCanBeNull: false } ),
      new text( 'type', type ),
      new text( 'zone', 'unassigned' ),
      new html( 'html', '<figure></figure>', {
        allowedTags: SchemaHtml.inlineTags.concat( [ 'img', 'figure' ] ),
        errorBadHTML: false
      } )
    ] );
  }
}