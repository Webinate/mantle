import { GraphQLFieldConfigMap, GraphQLNonNull } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { GraphQLObjectId } from '../scalars/object-id';
import { Error401 } from '../../utils/errors';
import { FileType } from '../models/file-type';

export const filesMutation: GraphQLFieldConfigMap<any, any> = {
  uploadFile: {
    type: FileType,
    args: {
      volumeId: { type: new GraphQLNonNull(GraphQLObjectId) }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      return ControllerFactory.get('files').uploadFilesToVolume(
        context.req as any,
        args.volumeId,
        auth.user._id.toString()
      );
    }
  }
};
