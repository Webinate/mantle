import { Resolver, Authorized, Mutation, Arg, Ctx } from 'type-graphql';
import { File } from '../models/file-type';
import { UserPrivilege } from '../../core/enums';
import ControllerFactory from '../../core/controller-factory';
import { GraphQLObjectId } from '../scalars/object-id';
import { ObjectID } from 'mongodb';
import { IGQLContext } from '../../types/interfaces/i-gql-context';

@Resolver(of => File)
export class FileResolver {
  @Authorized<UserPrivilege>([UserPrivilege.regular])
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
}
