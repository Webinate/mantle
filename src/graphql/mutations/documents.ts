import { GraphQLFieldConfigMap, GraphQLNonNull } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { GraphQLObjectId } from '../scalars/object-id';
import { Error401 } from '../../utils/errors';
import { DocumentType } from '../models/document-type';

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
  }
};
