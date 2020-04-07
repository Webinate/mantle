import {
  Resolver,
  Query,
  Arg,
  ResolverInterface,
  Ctx,
  Root,
  FieldResolver,
  Args,
  Authorized,
  Mutation
} from 'type-graphql';
import ControllerFactory from '../../core/controller-factory';
import { User, PaginatedUserResponse, GetUsersArgs, AddUserInput, UpdateUserInput } from '../models/user-type';
import { File } from '../models/file-type';
import { Error403, Error400, Error404 } from '../../utils/errors';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { UserPrivilege } from '../../core/enums';
import { IUserEntry } from '../../types/models/i-user-entry';

@Resolver(of => User)
export class UserResolver implements ResolverInterface<User> {
  @Authorized<UserPrivilege>([UserPrivilege.regular])
  @Query(returns => User, { nullable: true })
  async user(@Arg('user') user: string, @Ctx() ctx: IGQLContext) {
    if (ctx.user!.privileges === UserPrivilege.regular && ctx.user!.username !== user) {
      throw new Error403();
    }

    const response = await ControllerFactory.get('users').getUser({ username: user });
    if (!response) return null;

    return User.fromEntity(response);
  }

  @Query(returns => PaginatedUserResponse)
  @Authorized<UserPrivilege>([UserPrivilege.regular])
  async users(@Args() { index, limit, search }: GetUsersArgs) {
    const response = await ControllerFactory.get('users').getUsers({
      index: index,
      limit: limit,
      search: search ? new RegExp(search) : undefined
    });

    return PaginatedUserResponse.fromEntity(response);
  }

  @FieldResolver(type => String, { nullable: true })
  @Authorized<UserPrivilege>([UserPrivilege.regular])
  email(@Root() root: User, @Ctx() ctx: IGQLContext) {
    if (ctx.user!.username === root.username) return root.datebaseEmail;
    if (ctx.isAdmin) return root.datebaseEmail;
    return null;
  }

  @FieldResolver(type => File, { nullable: true })
  async avatarFile(@Root() root: User) {
    const user = await ControllerFactory.get('users').getUser({ id: root._id });
    if (!user?.avatarFile) return null;

    const file = await ControllerFactory.get('files').getFile(user?.avatarFile);
    if (!file) return null;

    return File.fromEntity(file);
  }

  @Authorized<UserPrivilege>([UserPrivilege.admin])
  @Mutation(returns => User)
  async addUser(@Arg('token') token: AddUserInput) {
    if (token.privileges === UserPrivilege.super)
      throw new Error('You cannot create a user with super admin permissions');

    const user = await ControllerFactory.get('users').createUser(token as IUserEntry<'server'>, true, true);
    return User.fromEntity(user);
  }

  @Authorized<UserPrivilege>([UserPrivilege.regular])
  @Mutation(returns => Boolean)
  async removeUser(@Arg('username') username: string, @Ctx() ctx: IGQLContext) {
    if (ctx.user!.username !== username && ctx.user!.privileges === 'regular') throw new Error403();
    await ControllerFactory.get('users').removeUser(username);
    return true;
  }

  @Authorized<UserPrivilege>([UserPrivilege.regular])
  @Mutation(returns => User)
  async updateUser(@Arg('token') token: UpdateUserInput, @Ctx() ctx: IGQLContext) {
    const user = await ControllerFactory.get('users').getUser({ id: token._id });

    if (!user) throw new Error404('User does not exist');

    if (ctx.user!.privileges === UserPrivilege.regular && ctx.user!.username !== user.username) throw new Error403();

    if (user.privileges === 'super' && token.privileges !== undefined && token.privileges !== UserPrivilege.super)
      throw new Error400('You cannot set a super admin level to less than super admin');

    const response = await ControllerFactory.get('users').update(
      token._id,
      token as IUserEntry<'server'>,
      ctx.user!.privileges === UserPrivilege.regular ? true : false
    );
    return response ? User.fromEntity(response) : null;
  }
}
