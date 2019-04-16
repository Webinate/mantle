import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { authQuery } from '../graphql/queries/auth';
import { userQuery } from '../graphql/queries/users';
import { fileQuery } from '../graphql/queries/files';
import { templateQuery } from '../graphql/queries/templates';
import { postsQuery } from '../graphql/queries/posts';
import { authMutation } from '../graphql/mutations/auth';
import { userMutation } from '../graphql/mutations/users';

const RootQuery: GraphQLObjectType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    ...userQuery,
    ...fileQuery,
    ...templateQuery,
    ...postsQuery,
    ...authQuery
  }
});

const RootMutationType: GraphQLObjectType = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    ...authMutation,
    ...userMutation
  }
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutationType
});

export default schema;
