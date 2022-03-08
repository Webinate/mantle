import { Resolver, Arg, Mutation, Authorized, Ctx, Query } from 'type-graphql';
import ControllerFactory from '../../core/controller-factory';
import { AuthLevel } from '../../core/enums';
import { AuthResponse, LoginInput, RegisterInput } from '../models/auth-type';
import { User } from '../models/user-type';
import { IGQLContext, IUserEntry } from '../../types';
import { Error403 } from '../../utils/errors';

@Resolver(of => AuthResponse)
export class AuthResolver {
  @Mutation(returns => AuthResponse)
  async login(@Arg('token') { password, remember, username }: LoginInput, @Ctx() ctx: IGQLContext) {
    const session = await ControllerFactory.get('users').logIn(username, password, remember, ctx, ctx.res);

    let user: IUserEntry<'server'> | null = null;

    if (session) {
      await ControllerFactory.get('sessions').setSessionHeader(session, ctx, ctx.res);
      user = await ControllerFactory.get('users').getUser({ username: session.user.username as string });
    }

    return new AuthResponse({
      authenticated: session ? true : false,
      user: user ? User.fromEntity(user) : null,
      message: session ? 'User is authenticated' : 'User is not authenticated'
    });
  }

  @Mutation(returns => AuthResponse)
  async register(@Arg('token') { password, activationUrl, email, username }: RegisterInput, @Ctx() ctx: IGQLContext) {
    const user = await ControllerFactory.get('users').register(username, password, email, activationUrl, {}, ctx);

    return new AuthResponse({
      authenticated: true,
      user: User.fromEntity(user),
      message: 'Please activate your account with the link sent to your email address'
    });
  }

  @Authorized<AuthLevel>([AuthLevel.regular])
  @Mutation(returns => Boolean)
  async approveActivation(@Arg('username') username: string, @Ctx() ctx: IGQLContext) {
    if (ctx.user!.privileges === 'regular' && ctx.user!.username !== username) throw new Error403();
    await ControllerFactory.get('users').approveActivation(username);
    return true;
  }

  @Mutation(returns => Boolean)
  async resendActivation(
    @Arg('username') username: string,
    @Arg('activationPath', { defaultValue: '/activate' }) activationPath: string,
    @Ctx() ctx: IGQLContext
  ) {
    const origin = encodeURIComponent((ctx.headers['origin'] as string) || (ctx.headers['referer'] as string));
    await ControllerFactory.get('users').resendActivation(username, activationPath, origin);
    return true;
  }

  @Query(returns => AuthResponse)
  async authenticated(@Ctx() ctx: IGQLContext) {
    const session = await ControllerFactory.get('sessions').getSession(ctx);
    let user: IUserEntry<'server'> | null = null;

    if (session) {
      await ControllerFactory.get('sessions').setSessionHeader(session, ctx, ctx.res);
      user = await ControllerFactory.get('users').getUser({ username: session.user.username as string });
    }

    return new AuthResponse({
      message: session ? 'User is authenticated' : 'User is not authenticated',
      authenticated: session ? true : false,
      user: user ? User.fromEntity(user) : null
    });
  }

  @Mutation(returns => Boolean)
  async requestPasswordReset(
    @Arg('username') username: string,
    @Arg('accountRedirectURL', { defaultValue: '/', nullable: true }) accountRedirectURL: string,
    @Ctx() ctx: IGQLContext
  ) {
    const origin = encodeURIComponent((ctx.headers['origin'] as string) || (ctx.headers['referer'] as string));
    await ControllerFactory.get('users').requestPasswordReset(username, accountRedirectURL, origin);
    return true;
  }

  @Mutation(returns => Boolean)
  async passwordReset(
    @Arg('username') username: string,
    @Arg('key') key: string,
    @Arg('password') password: string,
    @Ctx() ctx: IGQLContext
  ) {
    await ControllerFactory.get('users').resetPassword(username, key, password);
    return true;
  }

  @Mutation(returns => Boolean)
  async logout(@Ctx() ctx: IGQLContext) {
    await ControllerFactory.get('users').logOut(ctx, ctx.res);
    return true;
  }
}
