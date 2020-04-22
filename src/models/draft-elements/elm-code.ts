// import { Model } from '../model';
// import { foreignKey, text, html } from '../schema-items/schema-item-factory';
// import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';
// import { SchemaHtml } from '../schema-items/schema-html';

// /**
//  * A model for describing code elements
//  */
// export class ElmCode extends Model<IDraftElement<'server'>, IDraftElement<'client' | 'expanded'>> {
//   constructor() {
//     super('elements');

//     const type: DraftElements = 'elm-code';

//     this.schema.addItems([
//       new foreignKey('parent', 'documents', { keyCanBeNull: false }),
//       new text('type', type),
//       new text('zone', 'unassigned'),
//       new html('html', '<pre></pre>', {
//         allowedTags: SchemaHtml.inlineTags.concat(['pre']),
//         errorBadHTML: false
//       })
//     ]);
//   }
// }
