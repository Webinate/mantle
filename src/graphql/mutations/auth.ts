import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { ILoginToken } from '../../types/tokens/i-login-token';
import { AuthType } from '../models/auth-type';
import { IUserEntry } from '../../types/models/i-user-entry';
import { IAuthenticationResponse } from '../../types/tokens/standard-tokens';
import { IRegisterToken } from '../../types/tokens/i-register-token';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { getAuthUser } from '../helpers';
import { Error401, Error403 } from '../../utils/errors';

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
  // activateAccount: {
  //   type: GraphQLBoolean,
  //   args: {
  //     user: { type: new GraphQLNonNull(GraphQLString) },
  //     key: { type: new GraphQLNonNull(GraphQLString) },
  //     accountRedirectURL: { type: GraphQLString }
  //   },
  //   async resolve(parent, args: any, context: IGQLContext) {
  //     const res = context.res as express.Response;
  //     const req = context.req as express.Request;
  //     const redirectURL = encodeURIComponent(args.accountRedirectURL);

  //     try {
  //       // Check the user's activation and forward them onto the admin message page
  //       await ControllerFactory.get('users').checkActivation(args.user, args.key);
  //       res.setHeader('Content-Type', 'application/json');
  //       res.redirect(
  //         `${redirectURL}?message=${encodeURIComponent(
  //           'Your account has been activated!'
  //         )}&status=success&origin=${encodeURIComponent(req.query.origin)}`
  //       );
  //     } catch (error) {
  //       logError(error.toString());
  //       res.setHeader('Content-Type', 'application/json');
  //       res.status(302);
  //       res.redirect(
  //         `${redirectURL}?message=${encodeURIComponent(error.message)}&status=error&origin=${encodeURIComponent(
  //           req.query.origin
  //         )}`
  //       );
  //     }

  //     return true;
  //   }
  // },
  approveActivation: {
    type: GraphQLBoolean,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args: any, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();
      if (auth.user.privileges === 'regular' && auth.user.username !== args.username) throw new Error403();

      await ControllerFactory.get('users').approveActivation(args.username);
      return true;
    }
  },
  resendActivation: {
    type: GraphQLBoolean,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) },
      accountRedirectURL: { type: GraphQLString, defaultValue: '/' }
    },
    async resolve(parent, args: any, context: IGQLContext) {
      const origin = encodeURIComponent(
        (context.req.headers['origin'] as string) || (context.req.headers['referer'] as string)
      );
      await ControllerFactory.get('users').resendActivation(args.username, args.accountRedirectURL, origin);
      return true;
    }
  },
  requestPasswordReset: {
    type: GraphQLBoolean,
    args: {
      user: { type: new GraphQLNonNull(GraphQLString) },
      accountRedirectURL: { type: GraphQLString, defaultValue: '/' }
    },
    async resolve(parent, args: any, context: IGQLContext) {
      const origin = encodeURIComponent(
        (context.req.headers['origin'] as string) || (context.req.headers['referer'] as string)
      );
      await ControllerFactory.get('users').requestPasswordReset(args.user, args.accountRedirectURL, origin);
      return true;
    }
  },
  passwordReset: {
    type: GraphQLBoolean,
    args: {
      user: { type: new GraphQLNonNull(GraphQLString) },
      key: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args: any, context: IGQLContext) {
      await ControllerFactory.get('users').resetPassword(args.user, args.key, args.password);
      return true;
    }
  }
};
