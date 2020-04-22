import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { Post } from './post-type';
import { IComment } from '../../types/models/i-comment';

@ObjectType({ description: 'Object representing a Comment' })
export class Comment {
  @Field(type => GraphQLObjectId)
  _id: ObjectId;

  @Field(type => String)
  author: string;

  @Field(type => User)
  user: User;

  @Field(type => Post)
  post: Post;

  @Field(type => Comment, { nullable: true })
  parent: Comment;

  @Field(type => Boolean)
  public: boolean;

  @Field()
  content: string;

  @Field(type => [Comment])
  children: Comment[];

  @Field(type => LongType)
  createdOn: number;

  @Field(type => LongType)
  lastUpdated: number;

  static fromEntity(category: IComment<'server'>) {
    const toReturn = new Comment();
    Object.assign(toReturn, category);
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
// import { IComment } from '../../types/models/i-comment';
// import { PostType } from './post-type';
// import { GraphQLObjectId } from '../scalars/object-id';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';

// export const CommentType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Comment',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     author: {
//       type: GraphQLString
//     },
//     user: {
//       type: UserType,
//       resolve: (parent: IComment<'client'>, args, context: IGQLContext) => {
//         if (typeof parent.user === 'string')
//           return Controllers.get('users').getUser({
//             id: parent.user as string,
//             verbose: context.verbose,
//             expandForeignKeys: false
//           });
//         else return parent.user;
//       }
//     },
//     post: {
//       type: PostType,
//       resolve: (parent: IComment<'client'>) => {
//         if (typeof parent.post === 'string')
//           return Controllers.get('posts').getPost({ id: parent.post as string, expanded: false });
//         else return parent.post;
//       }
//     },
//     parent: {
//       type: PostType,
//       resolve: (parent: IComment<'client'>) => {
//         if (typeof parent.parent === 'string')
//           return Controllers.get('comments').getOne(parent.parent as string, { expanded: false });
//         else return parent.parent;
//       }
//     },
//     public: { type: GraphQLBoolean },
//     content: { type: GraphQLString },
//     children: {
//       type: new GraphQLList(CommentType),
//       resolve: async (parent: IComment<'client'>) => {
//         const controller = Controllers.get('comments');
//         const children = parent.children as string[];
//         const promises = children.map(c => controller.getOne(c, { verbose: true, expanded: false }));
//         return Promise.all(promises);
//       }
//     },
//     lastUpdated: { type: LongType },
//     createdOn: { type: LongType }
//   })
// });

// export const CommentInputType = new GraphQLInputObjectType({
//   name: 'CommentInput',
//   description: 'Input comment payload',
//   fields: () => ({
//     post: {
//       type: new GraphQLNonNull(GraphQLObjectId)
//     },
//     parent: {
//       type: GraphQLObjectId
//     },
//     public: {
//       type: GraphQLBoolean
//     },
//     content: {
//       type: GraphQLString
//     }
//   })
// });
