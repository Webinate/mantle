import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { ILoginToken } from '../../types/tokens/i-login-token';
import { AuthType } from '../models/auth-type';
import { IUserEntry } from '../../types/models/i-user-entry';
import { IAuthenticationResponse } from '../../types/tokens/standard-tokens';

export const authMutation: GraphQLFieldConfigMap<any, any> = {
  login: {
    description: 'Login using your mantle credentials',
    type: AuthType,
    args: {
      username: { type: GraphQLString },
      password: { type: GraphQLString },
      rememberMe: { type: GraphQLBoolean, defaultValue: true }
    },
    async resolve(parent, args: ILoginToken, context) {
      const session = await ControllerFactory.get('users').logIn(
        args.username,
        args.password,
        args.rememberMe,
        context.req,
        context.res
      );
      let user: IUserEntry<'client' | 'expanded'> | null = null;

      if (session) {
        await ControllerFactory.get('sessions').setSessionHeader(session, context.req, context.res);
        user = await ControllerFactory.get('users').getUser({
          username: session.user.username as string,
          verbose: true
        });
      }

      const response: IAuthenticationResponse = {
        message: session ? 'User is authenticated' : 'User is not authenticated',
        authenticated: session ? true : false,
        user: session ? user : null
      };

      return response;
    }
  }
};
