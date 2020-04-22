import { ObjectType, Field, InputType } from 'type-graphql';
import { ObjectId, ObjectID } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { Category } from './category-type';
import { IPost } from '../../types/models/i-post';
import { Draft } from './draft-type';
import { File } from './file-type';
import { Document } from './document-type';

@ObjectType({ description: 'Object representing a Post' })
export class Post {
  @Field(type => GraphQLObjectId)
  _id: ObjectId;

  @Field(type => User)
  author: User;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  brief: string;

  @Field(type => Boolean)
  public: boolean;

  @Field(type => [Category])
  categories: Category[];

  @Field(type => [String])
  tags: string[];

  @Field(type => LongType)
  createdOn: number;

  @Field(type => LongType)
  lastUpdated: number;

  @Field(type => File)
  featuredImage: File;

  @Field(type => Document)
  document: Document;

  @Field(type => Draft, { nullable: true })
  latestDraft: Draft | null;

  static fromEntity(initialization: IPost<'server'>) {
    const toReturn = new Post();
    Object.assign(toReturn, initialization);
    toReturn.author = User.fromEntity({ _id: initialization.author! });
    return toReturn;
  }
}

@InputType()
export class AddPostInput {
  @Field(type => GraphQLObjectId, { nullable: true })
  author: ObjectID | null;

  @Field({ nullable: true, defaultValue: '' })
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true, defaultValue: '' })
  brief: string;

  @Field(type => Boolean, { nullable: true, defaultValue: false })
  public: boolean;

  @Field(type => [GraphQLObjectId], { nullable: true, defaultValue: [] })
  categories: ObjectID[];

  @Field(type => [String], { nullable: true, defaultValue: [] })
  tags: string[];

  @Field(type => GraphQLObjectId, { nullable: true })
  featuredImage: File | null;

  constructor(initialization?: Partial<AddPostInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@InputType()
export class UpdatePostInput extends AddPostInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  constructor(initialization?: Partial<UpdatePostInput>) {
    super(initialization);
  }
}

// import {
//   GraphQLObjectType,
//   GraphQLString,
//   GraphQLID,
//   GraphQLList,
//   GraphQLBoolean,
//   GraphQLInputObjectType,
//   GraphQLNonNull
// } from 'graphql';
// import { LongType } from '../scalars/long';
// import { UserType } from './user-type';
// import Controllers from '../../core/controller-factory';
// import { IPost } from '../../types/models/i-post';
// import { FileType } from '../models/file-type';
// import { DraftType } from './draft-type';
// import { DocumentType } from './document-type';
// import { GraphQLObjectId } from '../scalars/object-id';

// export const PostType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Post',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     author: {
//       type: UserType,
//       resolve: (parent: IPost<'client'>) => {
//         if (typeof parent.author === 'string')
//           return Controllers.get('users').getUser({ id: parent.author as string, expandForeignKeys: false });
//         else return parent.author;
//       }
//     },
//     title: { type: GraphQLString },
//     slug: { type: GraphQLString },
//     brief: { type: GraphQLString },
//     public: { type: GraphQLBoolean },
//     categories: { type: new GraphQLList(GraphQLString) },
//     tags: { type: new GraphQLList(GraphQLString) },
//     lastUpdated: { type: LongType },
//     createdOn: { type: LongType },
//     featuredImage: {
//       type: FileType,
//       resolve: (parent: IPost<'client'>) => {
//         if (typeof parent.featuredImage === 'string')
//           return Controllers.get('files').getFile(parent.featuredImage as string, { expandForeignKeys: false });
//         else return parent.featuredImage;
//       }
//     },
//     document: {
//       type: DocumentType,
//       resolve: (parent: IPost<'client'>) => {
//         if (typeof parent.document === 'string')
//           return Controllers.get('documents').get({ id: parent.document as string, expandForeignKeys: false });
//         else return parent.document;
//       }
//     },
//     latestDraft: {
//       type: DraftType,
//       resolve: (parent: IPost<'client'>) => {
//         if (typeof parent.latestDraft === 'string')
//           return Controllers.get('documents').getDraft(parent.latestDraft as string, { expandForeignKeys: false });
//         else return parent.latestDraft;
//       }
//     }
//   })
// });

// export const PostInputType = new GraphQLInputObjectType({
//   name: 'PostInput',
//   description: 'Input post payload',
//   fields: () => ({
//     _id: {
//       type: GraphQLObjectId
//     },
//     title: {
//       type: new GraphQLNonNull(GraphQLString)
//     },
//     slug: {
//       type: new GraphQLNonNull(GraphQLString)
//     },
//     author: {
//       type: GraphQLObjectId
//     },
//     brief: {
//       type: GraphQLString
//     },
//     public: {
//       type: GraphQLBoolean,
//       defaultValue: false
//     },
//     featuredImage: {
//       type: GraphQLObjectId
//     },
//     categories: {
//       type: new GraphQLList(GraphQLString)
//     },
//     tags: {
//       type: new GraphQLList(GraphQLString)
//     }
//   })
// });

// export const PostUpdateType = new GraphQLInputObjectType({
//   name: 'PostUpdate',
//   description: 'Post update payload',
//   fields: () => ({
//     ...PostInputType.getFields(),
//     _id: {
//       type: new GraphQLNonNull(GraphQLObjectId)
//     },
//     title: {
//       type: GraphQLString
//     },
//     slug: {
//       type: GraphQLString
//     }
//   })
// });
