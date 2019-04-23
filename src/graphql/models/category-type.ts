import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';
import Controllers from '../../core/controller-factory';
import { ICategory } from '../../types/models/i-category';

export const CategoryType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Category',
  fields: () => ({
    _id: { type: GraphQLID },
    parent: {
      type: CategoryType,
      resolve: (parent: ICategory<'client'>) => {
        if (typeof parent.parent === 'string')
          return Controllers.get('categories').getOne(parent.parent as string, { expandForeignKeys: false });
        else return parent.parent;
      }
    },
    children: {
      type: new GraphQLList(CategoryType),
      resolve: async (parent: ICategory<'client'>) => {
        const response = await Controllers.get('categories').getAll(
          { parent: parent._id as string },
          { expandForeignKeys: false }
        );
        return response.data;
      }
    },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    description: { type: GraphQLString }
  })
});
