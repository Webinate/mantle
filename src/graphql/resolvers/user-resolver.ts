import { Resolver, Query, Arg, ResolverInterface, Ctx, Root, FieldResolver } from 'type-graphql';
import ControllerFactory from '../../core/controller-factory';
import { User } from '../models/user-type';
import { File } from '../models/file-type';
import { Error403, Error404 } from '../../utils/errors';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { UserPrivilege } from '../../core/enums';

@Resolver(of => User)
export class UserResolver implements ResolverInterface<User> {
  @Query(returns => User, { nullable: true })
  async category(@Arg('user') user: string, @Ctx() ctx: IGQLContext) {
    if (ctx.user!.privileges === UserPrivilege.Regular && ctx.user!.username !== user) {
      throw new Error403();
    }

    const response = await ControllerFactory.get('users').getUser({ username: user });
    if (!response) throw new Error404();
    return User.fromEntity(response);
  }

  @FieldResolver(type => File, { nullable: true })
  async avatarFile(@Root() root: User) {

    const user = await ControllerFactory.get('users').getUser({ id: root._id });
    const file = await ControllerFactory.get('files').getFile(user?.avatarFile!);
    if (!file) return null;

    return File.fromEntity(file);
  }
}
