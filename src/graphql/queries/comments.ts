import {
  GraphQLFieldConfigMap,
  GraphQLList,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLEnumType,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { SortOrderEnumType } from '../scalars/sort-order';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { CommentType } from '../models/comment-type';
import { CommentVisibility, CommentSortType } from '../../controllers/comments';

const values: { [key in CommentSortType]: { value: CommentSortType } } = {
  created: { value: 'created' },
  updated: { value: 'updated' }
};

const visibilityValues: { [type: string]: { value: CommentVisibility } } = {
  ALL: { value: 'all' },
  PRIVATE: { value: 'private' },
  PUBLIC: { value: 'public' }
};

export const CommentSortTypeEnum = new GraphQLEnumType({
  name: 'CommentSortTypeEnum',
  values: values
});

export const CommentVisibilityTypeEnum = new GraphQLEnumType({
  name: 'COMMENT_VISIBILITY',
  values: visibilityValues
});

export const commentsQuery: GraphQLFieldConfigMap<any, any> = {
  getComments: {
    type: new GraphQLObjectType({
      name: 'CommentsPage',
      fields: {
        data: { type: new GraphQLList(CommentType) },
        limit: { type: GraphQLInt },
        index: { type: GraphQLInt },
        count: { type: GraphQLInt }
      }
    }),
    args: {
      index: { type: GraphQLInt, defaultValue: 0 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      visibility: { type: CommentVisibilityTypeEnum, defaultValue: 'ALL' },
      keyword: { type: GraphQLString },
      root: { type: GraphQLBoolean },
      parentId: { type: GraphQLString },
      postId: { type: GraphQLString },
      sortOrder: {
        type: SortOrderEnumType
      },
      sortType: { type: CommentSortTypeEnum },
      user: { type: GraphQLString }
    },
    resolve: async (parent, args, context: IGQLContext) => {
      const auth = await getAuthUser(context.req, context.res);
      let visibility: CommentVisibility | undefined;

      // Check for visibility
      if (args.visibility) {
        if (args.visibility === 'all') visibility = 'all';
        else if (args.visibility === 'private') visibility = 'private';
        else visibility = 'public';
      }

      // If no user we only allow public
      if (!auth.user) visibility = 'public';
      // If an admin - we do not need visibility
      else if (auth.user.privileges === 'admin' || auth.user.privileges === 'super') visibility = undefined;
      // Regular users only see public
      else visibility = 'public';

      let verbose = false;
      if (auth.isAdmin) verbose = true;

      const response = await ControllerFactory.get('comments').getAll({
        index: args.index,
        limit: args.limit,
        keyword: args.keyword,
        root: args.root,
        parentId: args.parentId || null,
        postId: args.postId,
        visibility: visibility,
        verbose,
        sortOrder: args.sortOrder,
        sortType: args.sortType,
        user: args.user
      });

      return response;
    }
  },
  getComment: {
    type: CommentType,
    args: {
      id: { type: GraphQLID },
      slug: { type: GraphQLString }
    },
    resolve: async (parent, args, context: IGQLContext) => {
      const auth = await getAuthUser(context.req, context.res);
      context.verbose = false;
      if (auth.isAdmin) context.verbose = true;

      const comment = await ControllerFactory.get('comments').getOne(args.id, {
        expanded: false,
        verbose: context.verbose
      });

      // Only admins are allowed to see private comments
      if (!comment.public && (!auth.user || auth.user.privileges === 'regular'))
        throw new Error('That comment is marked private');

      return comment;
    }
  }
};
