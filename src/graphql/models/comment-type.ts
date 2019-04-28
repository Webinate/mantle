import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLBoolean } from 'graphql';
import { LongType } from '../scalars/long';
import { UserType } from './user-type';
import Controllers from '../../core/controller-factory';
import { IComment } from '../../types/models/i-comment';
import { PostType } from './post-type';

export const CommentType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    _id: { type: GraphQLID },
    author: {
      type: GraphQLString
    },
    user: {
      type: UserType,
      resolve: (parent: IComment<'client'>) => {
        if (typeof parent.user === 'string')
          return Controllers.get('users').getUser({ id: parent.user as string, expandForeignKeys: false });
        else return parent.user;
      }
    },
    post: {
      type: PostType,
      resolve: (parent: IComment<'client'>) => {
        if (typeof parent.post === 'string')
          return Controllers.get('posts').getPost({ id: parent.post as string, expanded: false });
        else return parent.post;
      }
    },
    parent: {
      type: PostType,
      resolve: (parent: IComment<'client'>) => {
        if (typeof parent.parent === 'string')
          return Controllers.get('comments').getOne(parent.parent as string, { expanded: false });
        else return parent.parent;
      }
    },
    public: { type: GraphQLBoolean },
    content: { type: GraphQLString },
    children: {
      type: new GraphQLList(CommentType),
      resolve: (parent: IComment<'client'>) => {
        return Controllers.get('comments').getAll({ parentId: parent._id, expanded: false });
      }
    },
    lastUpdated: { type: LongType },
    createdOn: { type: LongType }
  })
});
