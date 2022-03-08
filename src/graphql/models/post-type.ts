import { ObjectType, Field, InputType, ArgsType, Int } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { Category } from './category-type';
import { IPost, Page } from '../../types';
import { Draft } from './draft-type';
import { File } from './file-type';
import { Document } from './document-type';
import { IsSafeText } from '../../decorators/isSafeText';
import { PaginatedResponse } from './paginated-response';
import { PostVisibility, PostSortType, SortOrder } from '../../core/enums';

@ObjectType({ description: 'Object representing a Post' })
export class Post {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field(type => User, { nullable: true })
  author: User | null;

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

  @Field(type => File, { nullable: true })
  featuredImage: File | null;

  @Field(type => Document)
  document: Document;

  @Field(type => Draft, { nullable: true })
  latestDraft: Draft | null;

  static fromEntity(initialization: Partial<IPost<'server'>>) {
    const toReturn = new Post();
    Object.assign(toReturn, initialization);
    if (initialization.author) toReturn.author = User.fromEntity({ _id: initialization.author });
    if (initialization.document) toReturn.document = Document.fromEntity({ _id: initialization.document });
    toReturn.featuredImage = initialization.featuredImage
      ? File.fromEntity({ _id: initialization.featuredImage })
      : null;
    if (initialization.categories)
      toReturn.categories = initialization.categories.map(cat => Category.fromEntity({ _id: cat }));
    toReturn.latestDraft = initialization.latestDraft ? Draft.fromEntity({ _id: initialization.latestDraft }) : null;
    return toReturn;
  }
}

@InputType()
export class AddPostInput {
  @Field(type => GraphQLObjectId, { nullable: true })
  author: ObjectId | string | null;

  @Field({ nullable: true, defaultValue: '' })
  @IsSafeText()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true, defaultValue: '' })
  brief: string;

  @Field(type => Boolean, { nullable: true, defaultValue: false })
  public: boolean;

  @Field(type => [GraphQLObjectId], { nullable: true, defaultValue: [] })
  categories: (ObjectId | string)[];

  @Field(type => [String], { nullable: true, defaultValue: [] })
  tags: string[];

  @Field(type => GraphQLObjectId, { nullable: true })
  featuredImage: ObjectId | null | string;

  constructor(initialization?: Partial<AddPostInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@InputType()
export class UpdatePostInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field(type => GraphQLObjectId, { nullable: true })
  author: ObjectId | null | string;

  @Field({ nullable: true })
  @IsSafeText()
  title: string;

  @Field({ nullable: true })
  slug: string;

  @Field({ nullable: true })
  brief: string;

  @Field(type => Boolean, { nullable: true })
  public: boolean;

  @Field(type => [GraphQLObjectId], { nullable: true })
  categories: (ObjectId | string)[];

  @Field(type => [String], { nullable: true })
  tags: string[];

  @Field(type => GraphQLObjectId, { nullable: true })
  featuredImage: ObjectId | null | string;

  @Field(type => LongType, { nullable: true })
  createdOn: number;

  constructor(initialization?: Partial<UpdatePostInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@ArgsType()
export class GetPostsArgs {
  constructor(initialization?: Partial<GetPostsArgs>) {
    initialization && Object.assign(this, initialization);
  }

  @Field(type => Int, { defaultValue: 0 })
  index: number = 0;

  @Field(type => Int, { defaultValue: 10 })
  limit: number;

  @Field(type => String, { nullable: true })
  author: string;

  @Field(type => String, { nullable: true })
  keyword: string;

  @Field(type => PostVisibility, { defaultValue: PostVisibility.all })
  visibility: PostVisibility;

  @Field(type => SortOrder, { defaultValue: SortOrder.desc })
  sortOrder: SortOrder;

  @Field(type => PostSortType, { defaultValue: PostSortType.created })
  sortType: PostSortType;

  @Field(type => [GraphQLObjectId], { nullable: true })
  categories: ObjectId[];

  @Field(type => [String], { nullable: true })
  tags: string[];

  @Field(type => [String], { nullable: true })
  requiredTags: string[];
}

@ObjectType({ description: 'A page of wrapper of posts' })
export class PaginatedPostsResponse extends PaginatedResponse(Post) {
  static fromEntity(page: Page<IPost<'server'>>) {
    const toReturn = new PaginatedPostsResponse();
    toReturn.count = page.count;
    toReturn.index = page.index;
    toReturn.limit = page.limit;
    toReturn.data = page.data.map(post => Post.fromEntity(post));
    return toReturn;
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
