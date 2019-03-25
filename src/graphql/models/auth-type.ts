import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
import { UserType } from './user-type';

export const AuthType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Auth',
  fields: () => ({
    message: { type: GraphQLString },
    authenticated: { type: GraphQLBoolean },
    user: { type: UserType }
  })
});
