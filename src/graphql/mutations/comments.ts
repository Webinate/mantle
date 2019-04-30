import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean, GraphQLNonNull, GraphQLID } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { CommentType } from '../models/comment-type';
import { IComment } from '../../types/models/i-comment';
import { GraphQLObjectId } from '../scalars/object-id';

export const commentsMutation: GraphQLFieldConfigMap<any, any> = {
  removeComment: {
    type: GraphQLBoolean,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw Error('Authentication error');

      const comment = await ControllerFactory.get('comments').getOne(args.id);

      // Only admins & owners are allowed
      if (auth.user!.privileges === 'regular' && auth.user!.username !== comment.author)
        throw new Error('You do not have permission');

      await ControllerFactory.get('comments').remove(args.id);
      return true;
    }
  },
  createComment: {
    type: CommentType,
    args: {
      post: { type: GraphQLObjectId },
      parent: { type: GraphQLObjectId },
      content: { type: new GraphQLNonNull(GraphQLString) },
      public: { type: GraphQLBoolean }
    },
    async resolve(parent, args: Partial<IComment<'client'>>, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw Error('Authentication error');

      // User is passed from the authentication function
      args.user = auth.user._id.toString();
      args.author = auth.user.username as string;

      const response = await ControllerFactory.get('comments').create(args, {
        verbose: true,
        expandForeignKeys: false
      });
      return response;
    }
  }
};
