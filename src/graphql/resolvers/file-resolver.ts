import { Resolver, Authorized, Mutation, Arg, Ctx, Query, Args, FieldResolver, Root } from 'type-graphql';
import { File, PaginatedFilesResponse, GetFilesArgs, UpdateFileInput } from '../models/file-type';
import { AuthLevel, UserPrivilege } from '../../core/enums';
import ControllerFactory from '../../core/controller-factory';
import { GraphQLObjectId } from '../scalars/object-id';
import { ObjectID } from 'mongodb';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { Error403, Error400 } from '../../utils/errors';
import { User } from '../models/user-type';
import { Volume } from '../models/volume-type';
import { IFileEntry } from '../../types/models/i-file-entry';

@Resolver(of => File)
export class FileResolver {
  @Authorized<AuthLevel>([AuthLevel.regular])
  @Mutation(returns => Boolean)
  async removeFile(
    @Arg('id', type => GraphQLObjectId) id: ObjectID,
    @Arg('volumeId', type => GraphQLObjectId, { nullable: true }) volumeId: ObjectID,
    @Ctx() ctx: IGQLContext
  ) {
    await ControllerFactory.get('files').removeFiles({
      fileId: id,
      volumeId: volumeId,
      user: ctx.isAdmin ? undefined : (ctx.user!.username as string)
    });

    return true;
  }

  @Authorized<AuthLevel>([AuthLevel.regular])
  @Query(returns => File, { nullable: true })
  async file(@Arg('id', type => GraphQLObjectId) id: ObjectID, @Ctx() ctx: IGQLContext) {
    const file = await ControllerFactory.get('files').getFile(id);
    if (!file) return null;

    return File.fromEntity(file);
  }

  @Authorized<AuthLevel>([AuthLevel.regular])
  @Mutation(returns => File)
  async patchFile(@Arg('token') token: UpdateFileInput, @Ctx() ctx: IGQLContext) {
    let file = await ControllerFactory.get('files').getFile(token._id);
    if (!file) throw new Error400();
    if (!file.user.equals(ctx.user!._id) && ctx.user?.privileges === UserPrivilege.regular) throw new Error403();

    file = await ControllerFactory.get('files').update(token._id, token as Partial<IFileEntry<'server'>>);
    if (!file) return null;

    return File.fromEntity(file);
  }

  @Authorized<AuthLevel>([AuthLevel.regular])
  @Query(returns => PaginatedFilesResponse, { description: 'Gets a paginated list of files' })
  async files(
    @Args(type => GetFilesArgs)
    { index, limit, user, search, sortOrder, sortType, volumeId }: Partial<GetFilesArgs>,
    @Ctx() ctx: IGQLContext
  ) {
    if (volumeId) {
      const volume = await ControllerFactory.get('volumes').get({ id: volumeId });
      if (volume && !volume.user.equals(ctx.user!._id) && ctx.user?.privileges === UserPrivilege.regular)
        throw new Error403();
    }

    const toReturn = await ControllerFactory.get('files').getFiles({
      index: index,
      limit: limit,
      search: search,
      volumeId: volumeId,
      user: user,
      sortType,
      sortOrder
    });

    return PaginatedFilesResponse.fromEntity(toReturn);
  }

  @FieldResolver(type => User, { nullable: true })
  async user(@Root() root: File) {
    const file = await ControllerFactory.get('files').getFile(root._id);
    if (!file!.user) return null;

    const user = await ControllerFactory.get('users').getUser({ id: file!.user });
    return User.fromEntity(user!);
  }

  @FieldResolver(type => Volume, { nullable: true })
  async volume(@Root() root: File) {
    const file = await ControllerFactory.get('files').getFile(root._id);
    if (!file!.user) return null;

    const volume = await ControllerFactory.get('volumes').get({ id: file!.volumeId });
    return Volume.fromEntity(volume!);
  }
}
