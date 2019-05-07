import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { GraphQLObjectId } from '../scalars/object-id';
import { Error401 } from '../../utils/errors';

export const filesMutation: GraphQLFieldConfigMap<any, any> = {
  removeFile: {
    type: GraphQLBoolean,
    args: {
      id: { type: GraphQLObjectId },
      volume: { type: GraphQLObjectId },
      username: { type: GraphQLString }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      await ControllerFactory.get('files').removeFiles({
        fileId: args.id,
        volumeId: args.volume,
        user: auth.isAdmin ? undefined : (auth.user.username as string)
      });

      return true;
    }
  }
};
