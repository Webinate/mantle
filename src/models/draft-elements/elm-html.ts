import { Model } from '../model';
import { foreignKey, text, html } from '../schema-items/schema-item-factory';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';

/**
 * A model for describing generic html elements
 */
export class ElmHtml extends Model<IDraftElement<'server'>, IDraftElement<'client' | 'expanded'>> {
  constructor() {
    super('elements');

    const type: DraftElements = 'elm-html';

    this.schema.addItems([
      new foreignKey('parent', 'documents', { keyCanBeNull: false }),
      new text('type', type),
      new text('zone', 'unassigned'),
      new html('html', '<div></div>', {
        allowedTags: false,
        allowedAttributes: false,
        errorBadHTML: false
      })
    ]);
  }
}
