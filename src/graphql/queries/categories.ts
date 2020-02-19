// import {
//   GraphQLFieldConfigMap,
//   GraphQLList,
//   GraphQLObjectType,
//   GraphQLInt,
//   GraphQLString,
//   GraphQLID,
//   GraphQLBoolean
// } from 'graphql';
// import ControllerFactory from '../../core/controller-factory';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';
// import { CategoryType } from '../models/category-type';

// export const categoriesQuery: GraphQLFieldConfigMap<any, any> = {
//   getCategories: {
//     type: new GraphQLObjectType({
//       name: 'CategoriesPage',
//       fields: {
//         data: { type: new GraphQLList(CategoryType) },
//         limit: { type: GraphQLInt },
//         index: { type: GraphQLInt },
//         count: { type: GraphQLInt }
//       }
//     }),
//     args: {
//       index: { type: GraphQLInt, defaultValue: 0 },
//       limit: { type: GraphQLInt, defaultValue: 10 },
//       expanded: { type: GraphQLBoolean, defaultValue: false },
//       root: { type: GraphQLBoolean, defaultValue: false }
//     },
//     resolve: async (parent, args, context: IGQLContext) => {
//       const response = await ControllerFactory.get('categories').getAll(
//         {
//           index: args.index,
//           limit: args.limit,
//           expanded: args.expanded,
//           root: args.root
//         },
//         { expandForeignKeys: false }
//       );

//       return response;
//     }
//   },
//   getCategory: {
//     type: CategoryType,
//     args: { id: { type: GraphQLID }, slug: { type: GraphQLString } },
//     resolve: async (parent, args, context: IGQLContext) => {
//       if (args.slug) {
//         return await ControllerFactory.get('categories').getBySlug(args.slug, { expandForeignKeys: false });
//       } else {
//         return await ControllerFactory.get('categories').getOne(args.id, { expandForeignKeys: false });
//       }
//     }
//   }
// };
