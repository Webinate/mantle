// import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean, GraphQLNonNull } from 'graphql';
// import ControllerFactory from '../../core/controller-factory';
// import { getAuthUser } from '../helpers';
// import { UserType, UserInputType } from '../models/user-type';
// import { IUserEntry } from '../../types/models/i-user-entry';
// import { JsonType } from '../scalars/json';
// import { UserPriviledgeEnumType } from '../scalars/user-priviledge';
// import { UserPrivilege } from '../../core/enums';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';
// import { Error401, Error403, Error404, Error400 } from '../../utils/errors';

// export const userMutation: GraphQLFieldConfigMap<any, any> = {
//   removeUser: {
//     type: GraphQLBoolean,
//     args: {
//       username: { type: new GraphQLNonNull(GraphQLString) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth) throw new Error401();

//       if (auth.user!.username !== args.username && auth.user!.privileges === 'regular') throw new Error403();

//       const toRemove = args.username;
//       if (!toRemove) throw new Error('Please specify username');

//       await ControllerFactory.get('users').removeUser(toRemove);
//       return true;
//     }
//   },
//   createUser: {
//     type: UserType,
//     args: {
//       username: { type: new GraphQLNonNull(GraphQLString) },
//       email: { type: new GraphQLNonNull(GraphQLString) },
//       password: { type: new GraphQLNonNull(GraphQLString) },
//       privileges: { type: UserPriviledgeEnumType, defaultValue: 'regular' as UserPrivilege },
//       meta: { type: JsonType }
//     },
//     async resolve(parent, args: IUserEntry<'client'>, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();
//       if (auth.user.privileges === 'regular') throw new Error403();
//       if (args.privileges === 'super') throw new Error('You cannot create a user with super admin permissions');

//       const user = await ControllerFactory.get('users').createUser(
//         {
//           username: args.username,
//           email: args.email,
//           password: args.password,
//           privileges: args.privileges,
//           meta: args.meta
//         },
//         true,
//         true
//       );

//       return user;
//     }
//   },
//   editUser: {
//     type: UserType,
//     args: {
//       id: { type: new GraphQLNonNull(GraphQLString) },
//       token: { type: new GraphQLNonNull(UserInputType) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();
//       if (!auth.isAdmin && auth.user.username !== auth.user.username) throw new Error403();

//       const user = await ControllerFactory.get('users').getUser({ id: args.id });

//       if (!user) throw new Error404(`User does not exist`);
//       if (!auth.isAdmin && user.username !== auth.user.username) throw new Error403();

//       const token = args.token as IUserEntry<'client'>;
//       if (user.privileges === 'super' && (token.privileges !== undefined && token.privileges !== 'super'))
//         throw new Error400('You cannot set a super admin level to less than super admin');

//       return await ControllerFactory.get('users').update(args.id, token, auth.isAdmin ? false : true);
//     }
//   }
// };
