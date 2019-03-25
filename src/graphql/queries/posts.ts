import {
  GraphQLFieldConfigMap,
  GraphQLList,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLEnumType
} from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { PostSortType, PostVisibility } from '../../controllers/posts';
import { SortOrderEnumType } from '../scalars/sort-order';
import { PostType } from '../models/post-type';
import { IAuthReq } from '../../types/tokens/i-auth-request';

import Factory from '../../core/controller-factory';
import { ServerResponse } from 'http';
import { IUserEntry } from '../../types/models/i-user-entry';

async function getAuthUser(req: IAuthReq, res: ServerResponse) {
  const session = await Factory.get('sessions').getSession(req);
  const toRet: { user?: IUserEntry<'server'>; isAdmin?: boolean } = { isAdmin: false };

  if (session) {
    await Factory.get('sessions').setSessionHeader(session, req, res);
    toRet.user = session.user;
    toRet.isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';
  }

  return toRet;
}

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
  posts: {
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
    resolve: async (parent, args, context) => {
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
  }
};
