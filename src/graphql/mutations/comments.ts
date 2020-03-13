// import { GraphQLFieldConfigMap, GraphQLBoolean, GraphQLNonNull, GraphQLID } from 'graphql';
// import ControllerFactory from '../../core/controller-factory';
// import { getAuthUser } from '../helpers';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';
// import { CommentType, CommentInputType } from '../models/comment-type';
// import { IComment } from '../../types/models/i-comment';
// import { Error401, Error403 } from '../../utils/errors';

// export const commentsMutation: GraphQLFieldConfigMap<any, any> = {
//   removeComment: {
//     type: GraphQLBoolean,
//     args: {
//       id: { type: new GraphQLNonNull(GraphQLID) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();

//       const comment = await ControllerFactory.get('comments').getOne(args.id);

//       // Only admins & owners are allowed
//       if (auth.user!.privileges === 'regular' && auth.user!.username !== comment.author) throw new Error403();

//       await ControllerFactory.get('comments').remove(args.id);
//       return true;
//     }
//   },
//   createComment: {
//     type: CommentType,
//     args: {
//       token: { type: new GraphQLNonNull(CommentInputType) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();

//       // User is passed from the authentication function
//       const token = args.token as Partial<IComment<'client'>>;
//       token.user = auth.user._id.toString();
//       token.author = auth.user.username as string;

//       const response = await ControllerFactory.get('comments').create(token, {
//         verbose: true,
//         expandForeignKeys: false
//       });
//       return response;
//     }
//   }
// };
