import {
  GraphQLFieldConfigMap,
  GraphQLList,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLEnumType,
  GraphQLID
} from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { PostSortType, PostVisibility } from '../../controllers/posts';
import { SortOrderEnumType } from '../scalars/sort-order';
import { PostType } from '../models/post-type';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { GraphQLObjectId } from '../scalars/object-id';
import { Error401, Error403 } from '../../utils/errors';
import { DraftType } from '../models/draft-type';

const values: { [key in PostSortType]: { value: PostSortType } } = {
  created: { value: 'created' },
  modified: { value: 'modified' },
  title: { value: 'title' }
};

const visibilityValues: { [type: string]: { value: PostVisibility } } = {
  ALL: { value: 'all' },
  PRIVATE: { value: 'private' },
  PUBLIC: { value: 'public' }
};

export const PostSortTypeEnum = new GraphQLEnumType({
  name: 'PostSortTypeEnum',
  values: values
});

export const PostVisibilityTypeEnum = new GraphQLEnumType({
  name: 'POST_VISIBILITY',
  values: visibilityValues
});

export const postsQuery: GraphQLFieldConfigMap<any, any> = {
  getPosts: {
    type: new GraphQLObjectType({
      name: 'PostsPage',
      fields: {
        data: { type: new GraphQLList(PostType) },
        limit: { type: GraphQLInt },
        index: { type: GraphQLInt },
        count: { type: GraphQLInt }
      }
    }),
    args: {
      index: { type: GraphQLInt, defaultValue: 0 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      author: { type: GraphQLString },
      keyword: { type: GraphQLString },
      sort: { type: PostSortTypeEnum },
      visibility: { type: PostVisibilityTypeEnum, defaultValue: 'ALL' },
      categories: { type: new GraphQLList(GraphQLString) },
      tags: { type: new GraphQLList(GraphQLString) },
      requiredTags: { type: new GraphQLList(GraphQLString) },
      sortOrder: {
        type: SortOrderEnumType
      }
    },
    resolve: async (parent, args, context: IGQLContext) => {
      const auth = await getAuthUser(context.req, context.res);
      let visibility: PostVisibility | undefined;
      const user = auth.user;

      // Check for visibility
      if (args.visibility) visibility = args.visibility;

      // If no user we only allow public
      if (!user) visibility = 'public';
      // If an admin - we do not need visibility
      else if (user.privileges === 'regular') visibility = 'public';
      // Regular users only see public
      else {
        visibility = args.visibility;
      }

      return ControllerFactory.get('posts').getPosts({
        index: args.index,
        limit: args.limit,
        author: args.author,
        visibility: visibility,
        sort: args.sort,
        categories: args.categories,
        keyword: args.keyword,
        tags: args.tags,
        requiredTags: args.requiredTags
      });
    }
  },
  getPost: {
    type: PostType,
    args: { id: { type: GraphQLID }, slug: { type: GraphQLString } },
    resolve: async (parent, args, context: IGQLContext) => {
      const auth = await getAuthUser(context.req, context.res);
      const post = await ControllerFactory.get('posts').getPost({
        id: args.id,
        slug: args.slug,
        verbose: true
      })!;

      // Only admins are allowed to see private posts
      if (!post.public && (!auth.user || (auth.user && auth.user.privileges === 'regular')))
        throw new Error('That post is marked private');

      return post;
    }
  },
  getDraft: {
    type: DraftType,
    args: { id: { type: GraphQLObjectId } },
    resolve: async (parent, args, context: IGQLContext) => {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();
      if (auth.user.privileges !== 'regular') throw new Error403();

      const draft = await ControllerFactory.get('posts').getDraft(args.id);
      return draft;
    }
  },
  getPostDrafts: {
    type: new GraphQLList(DraftType),
    args: { id: { type: GraphQLObjectId } },
    resolve: async (parent, args, context: IGQLContext) => {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      const response = await ControllerFactory.get('posts').getDrafts(args.id);
      if (auth.isAdmin || auth.user._id.toString() === response.post.author) return response.drafts;
      else throw new Error403();
    }
  }
};
