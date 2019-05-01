import { GraphQLFieldConfigMap, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { PostType, PostInputType } from '../models/post-type';
import { IPost } from '../../types/models/i-post';
import { GraphQLObjectId } from '../scalars/object-id';

export const postsMutation: GraphQLFieldConfigMap<any, any> = {
  removePost: {
    type: GraphQLBoolean,
    args: {
      id: { type: new GraphQLNonNull(GraphQLObjectId) }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw Error('Authentication error');
      if (auth.user.privileges === 'regular') throw Error('You do not have permission');

      await ControllerFactory.get('posts').removePost(args.id);
      return true;
    }
  },
  createPost: {
    type: PostType,
    args: {
      token: { type: PostInputType }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw Error('Authentication error');
      if (auth.user.privileges === 'regular') throw Error('You do not have permission');

      const token: Partial<IPost<'client'>> = args.token;

      // User is passed from the authentication function
      if (!token.author) token.author = auth.user!._id.toString();

      const post = await ControllerFactory.get('posts').create(token);
      return post;
    }
  }
};
