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
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { Error404, Error401, Error403 } from '../../utils/errors';

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
  getUser: {
    description: 'Use this to get all users',
    type: UserType,
    args: { username: { type: GraphQLString }, verbose: { type: GraphQLBoolean, defaultValue: false } },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();
      if (auth.user.privileges === 'regular' && auth.user.username !== args.username) throw new Error403();

      // code to get data from db / other source
      const user = await ControllerFactory.get('users').getUser({
        username: args.username,
        expandForeignKeys: false,
        verbose: true
      });

      if (!user) throw new Error404('No user found');

      return user;
    }
  },
  getUsers: {
    type: UserPageType,
    args: {
      index: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      search: { type: GraphQLString },
      verbose: { type: GraphQLBoolean, defaultValue: false }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

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
