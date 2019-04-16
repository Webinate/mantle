import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { UserType } from '../models/user-type';
import { IUserEntry } from '../../types/models/i-user-entry';

export const userMutation: GraphQLFieldConfigMap<any, any> = {
  removeUser: {
    type: GraphQLBoolean,
    args: {
      username: { type: GraphQLString }
    },
    async resolve(parent, args, context) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth) throw Error('Authentication error');

      if (auth.user!.username !== args.username && auth.user!.privileges === 'regular')
        throw Error('You do not have permission');

      const toRemove = args.username;
      if (!toRemove) throw new Error('Please specify username');

      await ControllerFactory.get('users').removeUser(toRemove);
      return true;
    }
  },
  createUser: {
    type: UserType,
    args: {
      username: { type: GraphQLString }
    },
    async resolve(parent, args: IUserEntry<'client'>, context) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth) throw Error('Authentication error');

      if (auth.user!.privileges === 'regular') throw Error('You do not have permission');

      args.privileges = args.privileges ? args.privileges : 'regular';

      // Not allowed to create super users
      if (args.privileges === 'super') throw new Error('You cannot create a user with super admin permissions');

      const user = await this._userController.createUser(
        {
          username: args.username!,
          email: args.email!,
          password: args.password!,
          privileges: args.privileges!,
          meta: args.meta
        },
        true,
        true
      );

      return user;
    }
  }
};
