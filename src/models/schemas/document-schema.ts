// import { Schema } from '../schema';
// import { IDocument } from '../../types/models/i-document';
// import { ISchemaOptions } from '../../types/misc/i-schema-options';
// import { IDraftElement } from '../../types/models/i-draft-elements';
// import { ObjectID, Collection } from 'mongodb';
// import ModelFactory from '../../core/model-factory';
// import { Model } from '../model';
// import { buildHtml } from '../../controllers/build-html';

// export class DocumentSchema extends Schema<IDocument<'server'>, IDocument<'client' | 'expanded'>> {
//   private _elementsCollection: Collection<IDraftElement<'server'>>;

//   public async downloadToken(options?: ISchemaOptions) {
//     const toRet = await super.downloadToken(options);
//     await this.populate(toRet);
//     return toRet;
//   }

//   setElementCollection(collection: Collection<IDraftElement<'server'>>) {
//     this._elementsCollection = collection;
//   }

//   clone() {
//     const copy = super.clone(new DocumentSchema()) as DocumentSchema;
//     copy._elementsCollection = this._elementsCollection;
//     return copy;
//   }

//   /**
//    * Populates a draft json with its elements
//    */
//   async populate(doc: IDocument<'client' | 'expanded'>) {
//     const elementsFromDb = await this._elementsCollection
//       .find({ parent: new ObjectID(doc._id) } as IDraftElement<'server'>)
//       .toArray();

//     if (!elementsFromDb || elementsFromDb.length === 0) {
//       doc.elements = [];
//       return;
//     }

//     const elements = doc.elementsOrder.map(elmId => elementsFromDb.find(elm => elm._id.toString() === elmId)!) || [];

//     const jsons = await Promise.all(
//       elements.map(elm => {
//         const model = ModelFactory.get(elm.type) as Model<IDraftElement<'server'>, IDraftElement<'client'>>;
//         const schema = model.schema.clone();

//         schema.setServer(elm as IDraftElement<'server'>, true);

//         return schema.downloadToken({
//           expandMaxDepth: 1,
//           expandForeignKeys: true,
//           verbose: true,
//           expandSchemaBlacklist: [/parent/]
//         });
//       })
//     );

//     const htmlMap: { [zone: string]: string } = {};
//     doc.elements = jsons || [];

//     const htmlElements = await Promise.all(doc.elements.map(elm => buildHtml(elm)));

//     for (let i = 0; i < doc.elements.length; i++) {
//       let elm = doc.elements[i];
//       elm.html = htmlElements[i];

//       if (!htmlMap[elm.zone]) htmlMap[elm.zone] = elm.html;
//       else htmlMap[elm.zone] += elm.html;
//     }

//     doc.html = htmlMap;
//   }
// }
