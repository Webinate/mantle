// import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';
// import { ICategory } from '../../types/models/i-category';
import { ObjectType, Field, ID, Arg } from 'type-graphql';
import { PaginatedResponse } from './page-type';

// export const CategoryType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Category',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     parent: {
//       type: CategoryType,
//       resolve: (parent: ICategory<'client'>) => {
//         if (typeof parent.parent === 'string')
//           return Controllers.get('categories').getOne(parent.parent as string, { expandForeignKeys: false });
//         else return parent.parent;
//       }
//     },
//     children: {
//       type: new GraphQLList(CategoryType),
//       resolve: async (parent: ICategory<'client'>) => {
//         const response = await Controllers.get('categories').getAll(
//           { parent: parent._id as string },
//           { expandForeignKeys: false }
//         );
//         return response.data;
//       }
//     },
//     title: { type: GraphQLString },
//     slug: { type: GraphQLString },
//     description: { type: GraphQLString }
//   })
// });

@ObjectType({ description: 'Object representing a Category' })
export class Category {
  @Field(type => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  slug: string;

  @Field(type => Category, { nullable: true })
  parent: Category;

  @Field(type => [Category])
  children: Category[];
}

@ObjectType({ description: 'A page of wrapper of categories' })
export class PaginatedCategoryResponse extends PaginatedResponse(Category) {}
