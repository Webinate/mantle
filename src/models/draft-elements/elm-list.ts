// import { Model } from '../model';
// import { foreignKey, text, html } from '../schema-items/schema-item-factory';
// import { IDraftElement } from '../../types/models/i-draft-elements';
// import { SchemaHtml } from '../schema-items/schema-html';
// import { ElementType } from '../../core/enums';

// /**
//  * A model for describing ul elements
//  */
// export class ElmList extends Model<IDraftElement<'server'>, IDraftElement<'client' | 'expanded'>> {
//   constructor() {
//     super('elements');

//     const type = ElementType['elm-list'];

//     this.schema.addItems([
//       new foreignKey('parent', 'documents', { keyCanBeNull: false }),
//       new text('type', type),
//       new text('zone', 'unassigned'),
//       new html('html', '<ul></ul>', {
//         allowedTags: SchemaHtml.inlineTags.concat(['ul', 'ol', 'li']),
//         errorBadHTML: false
//       })
//     ]);
//   }
// }
