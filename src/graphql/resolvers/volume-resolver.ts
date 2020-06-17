import {
  Resolver,
  ResolverInterface,
  Authorized,
  Query,
  Arg,
  Ctx,
  Args,
  Mutation,
  FieldResolver,
  Root
} from 'type-graphql';
import {
  Volume,
  PaginatedVolumeResponse,
  GetVolumesArgs,
  AddVolumeInput,
  UpdateVolumeInput
} from '../models/volume-type';
import { AuthLevel } from '../../core/enums';
import { GraphQLObjectId } from '../scalars/object-id';
import ControllerFactory from '../../core/controller-factory';
import { Error404, Error403 } from '../../utils/errors';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { IVolume } from '../../types/models/i-volume-entry';
import { ObjectID } from 'mongodb';
import { User } from '../models/user-type';

@Resolver(of => Volume)
export class VolumeResolver implements ResolverInterface<Volume> {
  @Authorized<AuthLevel>([AuthLevel.regular])
  @Query(returns => Volume, { nullable: true })
  async volume(@Arg('id', () => GraphQLObjectId) id: ObjectID, @Ctx() ctx: IGQLContext) {
    const volume = await ControllerFactory.get('volumes').get({ id: id });
    if (!volume) throw new Error404('Volume does not exist');
    if (!ctx.isAdmin && !volume.user.equals(ctx.user!._id)) throw new Error403();
    return volume;
  }

  @Query(returns => PaginatedVolumeResponse)
  @Authorized<AuthLevel>([AuthLevel.regular])
  async volumes(@Args() { index, sortOrder, sortType, limit, user, search }: GetVolumesArgs, @Ctx() ctx: IGQLContext) {
    const authUser = ctx.user!;
    const manager = ControllerFactory.get('volumes');
    let searchRegexp: RegExp | undefined;

    if (search) searchRegexp = new RegExp(search, 'i');
    let getAll = false;

    if (ctx.isAdmin === false && user !== undefined) throw new Error403();
    else if (ctx.isAdmin && user === undefined) getAll = true;

    const response = await manager.getMany({
      index: index,
      limit: limit,
      search: searchRegexp,
      user: getAll ? undefined : user ? user : authUser,
      sortOrder,
      sortType
    });

    return PaginatedVolumeResponse.fromEntity(response);
  }

  @Authorized<AuthLevel>([AuthLevel.regular])
  @Mutation(returns => Volume)
  async addVolume(@Arg('token') token: AddVolumeInput, @Ctx() ctx: IGQLContext) {
    const manager = ControllerFactory.get('volumes');

    if (!token.user) token.user = ctx.user!._id;
    else if (!ctx.isAdmin) throw new Error403();

    if (token.memoryAllocated !== undefined && !ctx.isAdmin)
      throw new Error403(`You don't have permission to set the memoryAllocated`);

    const entry = await manager.create(token as IVolume<'server'>);
    return Volume.fromEntity(entry);
  }

  @Authorized<AuthLevel>([AuthLevel.regular])
  @Mutation(returns => Volume)
  async updateVolume(@Arg('token') token: UpdateVolumeInput, @Ctx() ctx: IGQLContext) {
    if (token.memoryAllocated !== undefined && !ctx.isAdmin)
      throw new Error403(`You don't have permission to set the memoryAllocated`);
    if (token.memoryUsed !== undefined && !ctx.isAdmin)
      throw new Error403(`You don't have permission to set the memoryUsed`);

    const volume = await ControllerFactory.get('volumes').get({ id: token._id });

    if (!volume) throw new Error404('Volume does not exist');
    if (!ctx.isAdmin && volume && !volume.user.equals(ctx.user!._id)) throw new Error403();

    const vol = await ControllerFactory.get('volumes').update(token._id, token as IVolume<'server'>);
    return Volume.fromEntity(vol!);
  }

  @FieldResolver(type => User)
  async user(@Root() root: Volume) {
    const volume = await ControllerFactory.get('volumes').get({ id: root._id });
    const user = await ControllerFactory.get('users').getUser({ id: volume!.user });
    return User.fromEntity(user!);
  }

  @Authorized<AuthLevel>([AuthLevel.regular])
  @Mutation(returns => Boolean)
  async removeVolume(@Arg('id', type => GraphQLObjectId) id: ObjectID) {
    await ControllerFactory.get('volumes').remove({ _id: id });
    return true;
  }
}
