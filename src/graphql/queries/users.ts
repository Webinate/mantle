import { GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLObjectType, GraphQLList } from 'graphql';
import { UserType } from '../models/user-type';
import ControllerFactory from '../../core/controller-factory';

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
    args: { username: { type: GraphQLString } },
    resolve(parent, args) {
      // code to get data from db / other source
      return ControllerFactory.get('users').getUser({
        username: args.username,
        expandForeignKeys: false
      });
    }
  },
  users: {
    type: UserPageType,
    args: {
      index: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      search: { type: GraphQLString }
    },
    resolve(parent, args) {
      // code to get data from db / other source
      return ControllerFactory.get('users').getUsers({
        index: args.index,
        limit: args.limit,
        search: args.search,
        verbose: true,
        expandForeignKeys: false
      });
    }
  }
};
