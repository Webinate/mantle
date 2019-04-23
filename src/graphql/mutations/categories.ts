import { GraphQLFieldConfigMap, GraphQLString, GraphQLBoolean, GraphQLNonNull, GraphQLID } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { getAuthUser } from '../helpers';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { ICategory } from '../../types/models/i-category';
import { CategoryType } from '../models/category-type';

export const categoriesMutation: GraphQLFieldConfigMap<any, any> = {
  removeCategory: {
    type: GraphQLBoolean,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) }
    },
    async resolve(parent, args, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw Error('Authentication error');
      if (auth.user.privileges === 'regular') throw Error('You do not have permission');

      await ControllerFactory.get('categories').remove(args.id);
      return true;
    }
  },
  createCategory: {
    type: CategoryType,
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      slug: { type: new GraphQLNonNull(GraphQLString) },
      parent: { type: GraphQLString },
      description: { type: GraphQLString }
    },
    async resolve(parent, args: ICategory<'client'>, context: IGQLContext) {
      const auth = await getAuthUser(context.req, context.res);
      if (!auth.user) throw Error('Authentication error');
      if (auth.user.privileges === 'regular') throw Error('You do not have permission');

      const category = await ControllerFactory.get('categories').create(args);
      return category;
    }
  }
};
