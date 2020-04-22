import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { User } from './user-type';
import { Element } from './element-type';
import { LongType } from '../scalars/long';
import { Template } from './template-type';
import { JsonType } from '../scalars/json';
import { IDocument } from '../../types/models/i-document';

@ObjectType({ description: 'Object representing a Document' })
export class Document {
  @Field(type => GraphQLObjectId)
  _id: ObjectId;

  @Field(type => User)
  author: User;

  @Field(type => Template)
  template: Template;

  @Field(type => LongType)
  createdOn: number;

  @Field(type => LongType)
  lastUpdated: number;

  @Field(type => [String])
  elementsOrder: string[];

  @Field(type => [Element])
  elements: Element[];

  @Field(type => JsonType)
  html: any;

  static fromEntity(category: IDocument<'server'>) {
    const toReturn = new Document();
    Object.assign(toReturn, category);
    return toReturn;
  }
}

// import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';
// import { LongType } from '../scalars/long';
// import { UserType } from './user-type';
// import { IDocument } from '../../types/models/i-document';
// import Controllers from '../../core/controller-factory';
// import { TemplateType } from './template-type';
// import { ElementType } from './element-type';
// import { JsonType } from '../scalars/json';

// export const DocumentType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Document',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     author: {
//       type: UserType,
//       resolve: (parent: IDocument<'client'>) => {
//         if (typeof parent.author === 'string')
//           return Controllers.get('users').getUser({ id: parent.author as string, expandForeignKeys: false });
//         else return parent.author;
//       }
//     },
//     template: {
//       type: TemplateType,
//       resolve: (parent: IDocument<'client'>) => {
//         if (typeof parent.template === 'string') return Controllers.get('templates').get(parent.template as string);
//         else return parent.template;
//       }
//     },
//     lastUpdated: { type: LongType },
//     createdOn: { type: LongType },
//     elementsOrder: { type: new GraphQLList(GraphQLString) },
//     elements: { type: new GraphQLList(ElementType) },
//     html: { type: JsonType }
//   })
// });
