// import { GraphQLFieldConfigMap, GraphQLString, GraphQLInt, GraphQLObjectType, GraphQLList, GraphQLID } from 'graphql';
// import ControllerFactory from '../../core/controller-factory';
// import { FileType } from '../models/file-type';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';

// export const fileQuery: GraphQLFieldConfigMap<any, any> = {
//   file: {
//     description: 'Get a single file',
//     type: FileType,
//     args: { id: { type: GraphQLID } },
//     async resolve(parent, args, context: IGQLContext) {
//       // code to get data from db / other source
//       const user = await ControllerFactory.get('files').getFile(args.id, { expandForeignKeys: false });

//       return user;
//     }
//   },
//   files: {
//     type: new GraphQLObjectType({
//       name: 'FilesPage',
//       fields: {
//         data: { type: new GraphQLList(FileType) },
//         limit: { type: GraphQLInt },
//         index: { type: GraphQLInt },
//         count: { type: GraphQLInt }
//       }
//     }),
//     args: {
//       index: { type: GraphQLInt },
//       limit: { type: GraphQLInt },
//       search: { type: GraphQLString }
//     },
//     resolve(parent, args, context: IGQLContext) {
//       // code to get data from db / other source
//       return ControllerFactory.get('files').getFiles({
//         index: args.index,
//         limit: args.limit,
//         search: args.search,
//         verbose: true,
//         expandForeignKeys: false
//       });
//     }
//   }
// };
