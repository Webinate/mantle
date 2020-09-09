import { ObjectType, Field, InputType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { File } from './file-type';
import { JsonType } from '../scalars/json';
import { ElementType } from '../../core/enums';
import { IImageElement } from '../../types/models/i-draft-elements';

@ObjectType({ description: 'Object representing a Element' })
export class Element {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field(type => GraphQLObjectId)
  parent: ObjectId | string;

  @Field(type => ElementType)
  type: ElementType;

  @Field()
  html: string;

  @Field()
  zone: string;

  @Field(type => File, { nullable: true })
  image: File | null;

  @Field(type => JsonType, { defaultValue: '' })
  style: any;

  static fromEntity(token: Partial<IImageElement<'server'>>) {
    const toReturn = new Element();
    Object.assign(toReturn, token);
    if (token.image) {
      toReturn.image = File.fromEntity({ _id: token.image });
    }

    return toReturn;
  }
}

@InputType()
export class AddElementInput {
  @Field(type => GraphQLObjectId, { nullable: true })
  parent: ObjectId | string;

  @Field(type => ElementType)
  type: ElementType;

  @Field({ defaultValue: '' })
  html: string;

  @Field({ nullable: true, defaultValue: 'unassigned' })
  zone: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  image: ObjectId | null | string;

  @Field(type => JsonType, { defaultValue: '' })
  style: any;

  constructor(initialization?: Partial<AddElementInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@InputType()
export class UpdateElementInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field(type => GraphQLObjectId, { nullable: true })
  parent: ObjectId;

  @Field({ nullable: true })
  html: string;

  @Field({ nullable: true, defaultValue: 'unassigned' })
  zone: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  image: ObjectId | null | string;

  @Field(type => JsonType, { nullable: true })
  style: any;

  constructor(initialization?: Partial<UpdateElementInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

// import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLEnumType, GraphQLInputObjectType } from 'graphql';
// import Controllers from '../../core/controller-factory';
// import { DocumentType } from './document-type';
// import { IDraftElement, DraftElements, IImageElement } from '../../types/models/i-draft-elements';
// import { FileType } from './file-type';
// import { JsonType } from '../scalars/json';

// const values: { [type: string]: { value: DraftElements } } = {
//   ElmParagraph: { value: 'elm-paragraph' },
//   ElmList: { value: 'elm-list' },
//   ElmImage: { value: 'elm-image' },
//   ElmCode: { value: 'elm-code' },
//   ElmHeader1: { value: 'elm-header-1' },
//   ElmHeader2: { value: 'elm-header-2' },
//   ElmHeader3: { value: 'elm-header-3' },
//   ElmHeader4: { value: 'elm-header-4' },
//   ElmHeader5: { value: 'elm-header-5' },
//   ElmHeader6: { value: 'elm-header-6' },
//   ElmHtml: { value: 'elm-html' }
// };

// export const ElementTypeEnum = new GraphQLEnumType({
//   name: 'ElementTypeEnum',
//   values: values
// });

// export const ElementType = new GraphQLObjectType({
//   name: 'Element',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     parent: {
//       type: DocumentType,
//       resolve: (parent: IDraftElement<'client'>) => {
//         if (typeof parent.parent === 'string')
//           return Controllers.get('documents').get({ id: parent.parent as string, expandForeignKeys: false });
//         else return parent.parent;
//       }
//     },
//     type: { type: GraphQLString },
//     html: { type: GraphQLString },
//     zone: { type: GraphQLString },
//     style: { type: JsonType },
//     image: {
//       type: FileType,
//       resolve(parent: IImageElement<'client'>, args) {
//         if (!parent.image) return null;
//         if (typeof parent.image === 'string') return Controllers.get('files').getFile(parent.image);
//         return parent.image;
//       }
//     }
//   })
// });

// export const ElementInputType = new GraphQLInputObjectType({
//   name: 'ElementInput',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     type: { type: ElementTypeEnum },
//     html: { type: GraphQLString },
//     zone: { type: GraphQLString },
//     image: { type: GraphQLID },
//     style: { type: JsonType }
//   })
// });
