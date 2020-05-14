import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { Document } from './document-type';
import { LongType } from '../scalars/long';
import { JsonType } from '../scalars/json';
import { IDraft } from '../../types/models/i-draft';

@ObjectType({ description: 'Object representing a Draft' })
export class Draft {
  @Field(type => GraphQLObjectId)
  _id: ObjectId;

  @Field(type => JsonType)
  html: any;

  @Field(type => LongType)
  createdOn: number;

  @Field(type => Document)
  parent: Document;

  static fromEntity(category: Partial<IDraft<'server'>>) {
    const toReturn = new Draft();
    Object.assign(toReturn, category);
    return toReturn;
  }
}

// import { GraphQLObjectType, GraphQLID } from 'graphql';
// import { LongType } from '../scalars/long';
// import Controllers from '../../core/controller-factory';
// import { IDraft } from '../../types/models/i-draft';
// import { DocumentType } from './document-type';
// import { JsonType } from '../scalars/json';

// export const DraftType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Draft',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     html: { type: JsonType },
//     createdOn: { type: LongType },
//     parent: {
//       type: DocumentType,
//       resolve: (parent: IDraft<'client'>) => {
//         return Controllers.get('documents').get({ id: parent.parent as string, expandForeignKeys: false });
//       }
//     }
//   })
// });
