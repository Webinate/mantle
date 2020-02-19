// import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';
// import { ICategory } from '../../types/models/i-category';
import { ObjectType, Field, ID, InputType } from 'type-graphql';
import { PaginatedResponse } from './page-type';
import { ICategory } from '../../types/models/i-category';
import { Page } from '../../types/tokens/standard-tokens';

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
  parent: Category | null;

  @Field(type => [Category])
  children: Category[];

  static fromEntity(category: ICategory<'server'>) {
    const toReturn = new Category();
    toReturn._id = category._id.toString();
    toReturn.slug = category.slug;
    category.title = category.title;
    return toReturn;
  }
}

@InputType()
export class AddCategoryInput implements Partial<ICategory<'client'>> {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  slug: string;

  @Field()
  parent: string;

  @Field(type => [String])
  children: string[];
}

@InputType()
export class UpdateCategoryInput extends AddCategoryInput {
  @Field(type => ID)
  _id: string;
}

@ObjectType({ description: 'A page of wrapper of categories' })
export class PaginatedCategoryResponse extends PaginatedResponse(Category) {
  static fromEntity(page: Page<ICategory<'server'>>) {
    const toReturn = new PaginatedCategoryResponse();
    toReturn.count = page.count;
    toReturn.index = page.index;
    toReturn.limit = page.limit;
    toReturn.data = page.data.map(cat => Category.fromEntity(cat));
    return toReturn;
  }
}
