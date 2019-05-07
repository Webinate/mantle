import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { authQuery } from '../graphql/queries/auth';
import { userQuery } from '../graphql/queries/users';
import { commentsQuery } from '../graphql/queries/comments';
import { categoriesQuery } from '../graphql/queries/categories';
import { fileQuery } from '../graphql/queries/files';
import { templateQuery } from '../graphql/queries/templates';
import { documentQuery } from '../graphql/queries/documents';
import { postsQuery } from '../graphql/queries/posts';
import { authMutation } from '../graphql/mutations/auth';
import { userMutation } from '../graphql/mutations/users';
import { postsMutation } from '../graphql/mutations/posts';
import { commentsMutation } from '../graphql/mutations/comments';
import { categoriesMutation } from '../graphql/mutations/categories';
import { filesMutation } from '../graphql/mutations/files';
import { documentsMutation } from '../graphql/mutations/documents';

const RootQuery: GraphQLObjectType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    ...userQuery,
    ...fileQuery,
    ...categoriesQuery,
    ...templateQuery,
    ...postsQuery,
    ...authQuery,
    ...commentsQuery,
    ...documentQuery
  }
});

const RootMutationType: GraphQLObjectType = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    ...authMutation,
    ...userMutation,
    ...commentsMutation,
    ...postsMutation,
    ...categoriesMutation,
    ...filesMutation,
    ...documentsMutation
  }
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutationType
});

export default schema;
