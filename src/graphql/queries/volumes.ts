import {
  GraphQLFieldConfigMap,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLList
} from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { getAuthUser } from '../helpers';
import { Error401, Error403 } from '../../utils/errors';
import { IUserEntry } from '../../types/models/i-user-entry';
import { VolumeType } from '../models/volume-type';
import { GraphQLObjectId } from '../scalars/object-id';
import { SortOrderEnumType } from '../scalars/sort-order';
import { VolumeSortType } from '../../controllers/volumes';

const values: { [key in VolumeSortType]: { value: VolumeSortType } } = {
  created: { value: 'created' },
  memory: { value: 'memory' },
  name: { value: 'name' }
};

export const VolumeSortTypeEnum = new GraphQLEnumType({
  name: 'VolumeSortTypeEnum',
  values: values
});

export const VolumePageType = new GraphQLObjectType({
  name: 'VolumePageType',
  fields: {
    data: { type: new GraphQLList(VolumeType) },
    limit: { type: GraphQLInt },
    index: { type: GraphQLInt },
    count: { type: GraphQLInt }
  }
});

export const volumeQuery: GraphQLFieldConfigMap<any, any> = {
  getVolume: {
    description: 'Get a volume',
    type: VolumeType,
    args: { id: { type: GraphQLObjectId } },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      const volume = await ControllerFactory.get('volumes').get({ id: args.id });
      if (!volume) throw new Error('Volume does not exist');
      if (!auth.isAdmin && (volume.user as IUserEntry<'client'>).username !== auth.user.username) throw new Error403();

      return volume;
    }
  },
  getVolumes: {
    description: 'Gets a list of volumes',
    type: VolumePageType,
    args: {
      user: { type: GraphQLString },
      search: { type: GraphQLString },
      index: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      sortOrder: { type: SortOrderEnumType },
      sort: { type: VolumeSortTypeEnum }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      const authUser = auth.user!;
      const manager = ControllerFactory.get('volumes');
      let search: RegExp | undefined;

      // Check for keywords
      if (args.search) search = new RegExp(args.search, 'i');

      let index: number | undefined = parseInt(args.index);
      let limit: number | undefined = parseInt(args.limit);
      let user: string | undefined = args.user;
      index = isNaN(index) ? undefined : index;
      limit = isNaN(limit) ? undefined : limit;

      let getAll = false;

      if (auth.isAdmin === false && user !== undefined) throw new Error403();
      else if (auth.isAdmin && user === undefined) getAll = true;

      const toRet = await manager.getMany({
        user: getAll ? undefined : user ? user : authUser,
        search: search,
        sort: args.sort ? args.sort : undefined,
        sortOrder: args.sortOrder === 'asc' ? 'asc' : 'desc',
        index: index,
        limit: limit
      });

      return toRet;
    }
  }
};
