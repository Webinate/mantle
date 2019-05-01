import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { ILoginToken } from '../../types/tokens/i-login-token';
import { AuthType } from '../models/auth-type';
import { IUserEntry } from '../../types/models/i-user-entry';
import { IAuthenticationResponse } from '../../types/tokens/standard-tokens';
import { IRegisterToken } from '../../types/tokens/i-register-token';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { getAuthUser } from '../helpers';

export const authMutation: GraphQLFieldConfigMap<any, any> = {
  login: {
    type: AuthType,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      rememberMe: { type: GraphQLBoolean, defaultValue: true }
    },
    async resolve(parent, args: ILoginToken, context: IGQLContext) {
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
  },
  logout: {
    type: GraphQLBoolean,
    async resolve(parent, args, context: IGQLContext) {
      await ControllerFactory.get('users').logOut(context.req, context.res);
      return true;
    }
  },
  registerUser: {
    type: AuthType,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      activationLink: { type: GraphQLString, defaultValue: '/' }
    },
    async resolve(parent, args: IRegisterToken, context: IGQLContext) {
      const user = await ControllerFactory.get('users').register(
        args.username,
        args.password,
        args.email,
        args.activationLink,
        {},
        context.req
      );

      const response: IAuthenticationResponse = {
        message: user
          ? 'Please activate your account with the link sent to your email address'
          : 'User is not authenticated',
        authenticated: user ? true : false,
        user: user ? user : null
      };
      return response;
    }
  },
  approveActivation: {
    type: GraphQLBoolean,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args: any, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw Error('Authentication error');
      if (auth.user.privileges === 'regular' && auth.user.username !== args.username) throw Error('Permission error');

      await ControllerFactory.get('users').approveActivation(args.username);
      return true;
    }
  }
};
