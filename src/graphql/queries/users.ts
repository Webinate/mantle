import {
  GraphQLFieldConfigMap,
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean
} from 'graphql';
import { UserType } from '../models/user-type';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';

export const UserPageType = new GraphQLObjectType({
  name: 'UserPageType',
  fields: {
    data: { type: new GraphQLList(UserType) },
    limit: { type: GraphQLInt },
    index: { type: GraphQLInt },
    count: { type: GraphQLInt }
  }
});

export const userQuery: GraphQLFieldConfigMap<any, any> = {
  user: {
    description: 'Use this to get all users',
    type: UserType,
    args: { username: { type: GraphQLString }, verbose: { type: GraphQLBoolean, defaultValue: false } },
    async resolve(parent, args, context) {
      const auth = await getAuthUser(context.req, context.res);

      // code to get data from db / other source
      const user = await ControllerFactory.get('users').getUser({
        username: args.username,
        expandForeignKeys: false,
        verbose: auth.user && auth.user.privileges !== 'regular' && args.verbose ? true : false
      });

      return user;
    }
  },
  users: {
    type: UserPageType,
    args: {
      index: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      search: { type: GraphQLString },
      verbose: { type: GraphQLBoolean, defaultValue: false }
    },
    async resolve(parent, args, context) {
      const auth = await getAuthUser(context.req, context.res);

      // code to get data from db / other source
      return ControllerFactory.get('users').getUsers({
        index: args.index,
        limit: args.limit,
        search: args.search,
        verbose: auth.user && auth.user.privileges !== 'regular' && args.verbose ? true : false,
        expandForeignKeys: false
      });
    }
  }
};
