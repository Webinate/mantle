// import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLInt, GraphQLBoolean } from 'graphql';
// import ControllerFactory from '../../core/controller-factory';
// import { getAuthUser } from '../helpers';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';
// import { GraphQLObjectId } from '../scalars/object-id';
// import { Error401 } from '../../utils/errors';
// import { DocumentType } from '../models/document-type';
// import { ElementType, ElementInputType } from '../models/element-type';
// import { Queue } from '../helpers/queue';

// const addElmQueue: Queue = new Queue();
// const removeElmQueue: Queue = new Queue();

// export const documentsMutation: GraphQLFieldConfigMap<any, any> = {
//   changeDocTemplate: {
//     type: DocumentType,
//     args: {
//       id: { type: new GraphQLNonNull(GraphQLObjectId) },
//       template: { type: new GraphQLNonNull(GraphQLObjectId) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();

//       const updatedDoc = await ControllerFactory.get('documents').changeTemplate(
//         {
//           id: args.id,
//           checkPermissions: auth.isAdmin ? undefined : { userId: auth.user._id }
//         },
//         args.template,
//         { verbose: true, expandForeignKeys: false }
//       );

//       return updatedDoc;
//     }
//   },
//   addDocElement: {
//     type: ElementType,
//     args: {
//       id: { type: new GraphQLNonNull(GraphQLObjectId) },
//       index: { type: GraphQLInt },
//       token: { type: new GraphQLNonNull(ElementInputType) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();

//       let index: number | undefined = parseInt(args.index);
//       if (isNaN(index)) index = undefined;

//       const ticket = addElmQueue.register();
//       await addElmQueue.waitForTurn(ticket);

//       try {
//         const element = await ControllerFactory.get('documents').addElement(
//           {
//             id: args.id,
//             checkPermissions: auth.isAdmin ? undefined : { userId: auth.user._id }
//           },
//           args.token,
//           index,
//           { verbose: true, expandForeignKeys: false }
//         );

//         addElmQueue.processNext();
//         return element;
//       } catch (err) {
//         addElmQueue.processNext();
//         throw err;
//       }
//     }
//   },
//   updateDocElement: {
//     type: ElementType,
//     args: {
//       id: { type: new GraphQLNonNull(GraphQLObjectId) },
//       elementId: { type: new GraphQLNonNull(GraphQLObjectId) },
//       index: { type: GraphQLInt },
//       token: { type: new GraphQLNonNull(ElementInputType) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();

//       const element = await ControllerFactory.get('documents').updateElement(
//         {
//           id: args.id,
//           checkPermissions: auth.isAdmin ? undefined : { userId: auth.user._id },
//           verbose: true,
//           expandForeignKeys: false
//         },
//         args.elementId,
//         args.token
//       );

//       return element;
//     }
//   },
//   removeDocElement: {
//     type: GraphQLBoolean,
//     args: {
//       docId: { type: new GraphQLNonNull(GraphQLObjectId) },
//       elementId: { type: new GraphQLNonNull(GraphQLObjectId) }
//     },
//     async resolve(parent, args, context: IGQLContext) {
//       const auth = await getAuthUser(context.req, context.res);
//       if (!auth.user) throw new Error401();

//       const ticket = removeElmQueue.register();
//       await removeElmQueue.waitForTurn(ticket);

//       try {
//         await ControllerFactory.get('documents').removeElement(
//           {
//             id: args.docId,
//             checkPermissions: auth.isAdmin ? undefined : { userId: auth.user._id }
//           },
//           args.elementId
//         );

//         removeElmQueue.processNext();
//         return true;
//       } catch (err) {
//         removeElmQueue.processNext();
//         throw err;
//       }
//     }
//   }
// };
