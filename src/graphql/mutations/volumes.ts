import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { Error401, Error403, Error404 } from '../../utils/errors';
import { IVolume } from '../../types/models/i-volume-entry';
import { IUserEntry } from '../../types/models/i-user-entry';
import { GraphQLObjectId } from '../scalars/object-id';
import { VolumeUpdateType, VolumeType } from '../models/volume-type';

export const volumesMutation: GraphQLFieldConfigMap<any, any> = {
  createVolume: {
    type: VolumeType,
    args: {
      token: { type: VolumeUpdateType }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      const token: IVolume<'client'> = args.token;
      const manager = ControllerFactory.get('volumes');

      if (!token.user) token.user = auth.user!._id.toString();
      else if (!auth.isAdmin) throw new Error403();

      if (token.memoryAllocated !== undefined && !auth.isAdmin)
        throw new Error403(`You don't have permission to set the memoryAllocated`);
      if (token.memoryUsed !== undefined && !auth.isAdmin)
        throw new Error403(`You don't have permission to set the memoryUsed`);

      const entry = (await manager.create(token)) as IVolume<'client'>;
      return entry;
    }
  },
  updateVolume: {
    type: VolumeType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLObjectId) },
      token: { type: VolumeUpdateType }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      const token: IVolume<'client'> = args.token;

      if (token.memoryAllocated !== undefined && !auth.isAdmin)
        throw new Error403(`You don't have permission to set the memoryAllocated`);
      if (token.memoryUsed !== undefined && !auth.isAdmin)
        throw new Error403(`You don't have permission to set the memoryUsed`);

      const volume = await ControllerFactory.get('volumes').get({ id: args.id });

      if (!volume) throw new Error404('Volume does not exist');

      if (!auth.isAdmin && volume && (volume.user as IUserEntry<'client'>).username !== auth.user.username)
        throw new Error403();

      const vol = await ControllerFactory.get('volumes').update(args.id, token);
      return vol;
    }
  },
  removeVolume: {
    type: GraphQLBoolean,
    args: {
      id: { type: new GraphQLNonNull(GraphQLObjectId) }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      await ControllerFactory.get('volumes').remove({ _id: args.id as string });
      return true;
    }
  }
};
