import { Model } from '../model';
import { foreignKey, text, json } from '../schema-items/schema-item-factory';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';

/**
 * A model for describing image elements
 */
export class ElmImg extends Model<IDraftElement<'server'>, IDraftElement<'client' | 'expanded'>> {
  constructor() {
    super('elements');

    const type: DraftElements = 'elm-image';

    this.schema.addItems([
      new foreignKey('parent', 'documents', { keyCanBeNull: false }),
      new text('type', type),
      new text('zone', 'unassigned'),
      new foreignKey('image', 'files', { keyCanBeNull: true }),
      new json('style', {})
    ]);
  }
}
