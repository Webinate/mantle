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
