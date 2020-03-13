// import { GraphQLFieldConfigMap, GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';
// import ControllerFactory from '../../core/controller-factory';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';
// import { getAuthUser } from '../helpers';
// import { GraphQLObjectId } from '../scalars/object-id';
// import { DocumentType } from '../models/document-type';
// import { Error401, Error403 } from '../../utils/errors';

// export const documentQuery: GraphQLFieldConfigMap<any, any> = {
//   getDocument: {
//     description: 'Get a single document',
//     type: DocumentType,
//     args: { id: { type: GraphQLObjectId } },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) new Error401();
//       const checkPermissions = auth.isAdmin ? undefined : { userId: auth.user!._id };

//       const user = await ControllerFactory.get('documents').get({
//         id: args.id,
//         checkPermissions: checkPermissions,
//         verbose: true,
//         expandForeignKeys: false
//       });

//       return user;
//     }
//   },
//   getDocuments: {
//     description: 'Get a multiple document',
//     type: new GraphQLObjectType({
//       name: 'DocumentsPage',
//       fields: {
//         data: { type: new GraphQLList(DocumentType) },
//         limit: { type: GraphQLInt },
//         index: { type: GraphQLInt },
//         count: { type: GraphQLInt }
//       }
//     }),
//     args: {},
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) new Error401();
//       if (!auth.isAdmin) new Error403();
//       const toRet = await ControllerFactory.get('documents').getMany();
//       return toRet;
//     }
//   }
// };
