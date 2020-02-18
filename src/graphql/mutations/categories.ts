import { GraphQLString, GraphQLBoolean, GraphQLNonNull, GraphQLID, GraphQLFieldConfig } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { ICategory } from '../../types/models/i-category';
import { CategoryType } from '../models/category-type';
import { isAdminGql } from '../../decorators/permissions';

class CategoriesMutator {
  @isAdminGql()
  private async removeCategoryResolver(parent: void, args: any, context: IGQLContext) {
    await ControllerFactory.get('categories').remove(args.id);
    return true;
  }

  @isAdminGql()
  async createCategoryResolver(parent: void, args: ICategory<'client'>, context: IGQLContext) {
    const category = await ControllerFactory.get('categories').create(args);
    return category;
  }

  public createCategory: GraphQLFieldConfig<void, IGQLContext> = {
    type: CategoryType,
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      slug: { type: new GraphQLNonNull(GraphQLString) },
      parent: { type: GraphQLString },
      description: { type: GraphQLString }
    },
    resolve: this.createCategoryResolver
  };

  public removeCategory: GraphQLFieldConfig<void, IGQLContext> = {
    type: GraphQLBoolean,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) }
    },
    resolve: this.removeCategoryResolver
  };
}

export const categoriesMutation = new CategoriesMutator();
