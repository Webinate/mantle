import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLInt } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { GraphQLObjectId } from '../scalars/object-id';
import { Error401 } from '../../utils/errors';
import { DocumentType } from '../models/document-type';
import { ElementType } from '../models/element-type';

export const documentsMutation: GraphQLFieldConfigMap<any, any> = {
  changeDocTemplate: {
    type: DocumentType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLObjectId) },
      template: { type: new GraphQLNonNull(GraphQLObjectId) }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      const updatedDoc = await ControllerFactory.get('documents').changeTemplate(
        {
          id: args.id,
          checkPermissions: auth.isAdmin ? undefined : { userId: auth.user._id }
        },
        args.template,
        { verbose: true, expandForeignKeys: false }
      );

      return updatedDoc;
    }
  },
  addDocElement: {
    type: ElementType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLObjectId) },
      index: { type: GraphQLInt },
      token: { type: new GraphQLNonNull(ElementType) }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw new Error401();

      let index: number | undefined = parseInt(args.index);
      if (isNaN(index)) index = undefined;

      const element = await ControllerFactory.get('documents').addElement(
        {
          id: args.id,
          checkPermissions: auth.isAdmin ? undefined : { userId: auth.user._id }
        },
        args.token,
        index,
        { verbose: true, expandForeignKeys: false }
      );

      return element;
    }
  }
};
