import { Resolver, Query, FieldResolver, Arg, Root, ResolverInterface } from 'type-graphql';
import { Category } from '../models/category-type';
import ControllerFactory from '../../core/controller-factory';

@Resolver(of => Category)
export class CategoryResolver implements ResolverInterface<Category> {
  @Query(returns => [Category], {
    nullable: true,
    description: 'Gets a page of categories'
  })
  async category(@Arg('id', { nullable: true }) id: string, @Arg('slug', { nullable: true }) slug: string) {
    if (slug) {
      return await ControllerFactory.get('categories').getBySlug(slug, { expandForeignKeys: false });
    } else {
      return await ControllerFactory.get('categories').getOne(id, { expandForeignKeys: false });
    }
  }

  @Query(returns => [Category], {
    nullable: true,
    description: 'Gets a page of categories'
  })
  async categories(
    @Arg('index') index = 0,
    @Arg('limit') limit = 10,
    @Arg('expanded') expanded = false,
    @Arg('root') root = false
  ) {
    const response = await ControllerFactory.get('categories').getAll(
      {
        index: index,
        limit: limit,
        expanded: expanded,
        root: root
      },
      { expandForeignKeys: false }
    );

    return response;
  }

  @FieldResolver(type => Category, { nullable: true })
  async parent(@Root() root: Category) {
    
    const category = await ControllerFactory.get('categories').getOne(root._id, {
        expandForeignKeys: false
      });

      const parent = await ControllerFactory.get('categories').getOne(category.parent._id, {
        expandForeignKeys: false
      });

    return parent.parent as Category;
  }

  @FieldResolver(type => [Category], { nullable: true })
  async children(@Root() category: Category) {
    const response = await ControllerFactory.get('categories').getAll(
      { parent: category._id as string },
      { expandForeignKeys: false }
    );
    return response.data as Category[];
  }

  // @Query(returns => [Category], { description: 'Get all the recipes from around the world ' })
  // async recipes(): Promise<Recipe[]> {
  //   return await this.items;
  // }

  // @Mutation(returns => Category)
  // async addRecipe(@Arg('recipe') recipeInput: RecipeInput): Promise<Recipe> {
  //   const recipe = plainToClass(Recipe, {
  //     description: recipeInput.description,
  //     title: recipeInput.title,
  //     ratings: [],
  //     creationDate: new Date()
  //   });
  //   await this.items.push(recipe);
  //   return recipe;
  // }

  // @FieldResolver()
  // async parent(@Root() category: Category) {

  //     return ControllerFactory.get('categories').getOne(parent.parent as string, { expandForeignKeys: false });
  //   else return parent.parent;
  // }
}

// @Field(type => Category, { nullable: true })
//   async parent(@Arg('parent') parent: ICategory<'client'>) {
//     if (typeof parent.parent === 'string')
//       return Controllers.get('categories').getOne(parent.parent as string, { expandForeignKeys: false });
//     else return parent.parent;
//   }

//   @Field(type => Category, { nullable: true })
//   async children(@Arg('parent') parent: ICategory<'client'>) {
//     const response = await Controllers.get('categories').getAll(
//       { parent: parent._id as string },
//       { expandForeignKeys: false }
//     );

// getCategories: {
//   type: new GraphQLObjectType({
//     name: 'CategoriesPage',
//     fields: {
//       data: { type: new GraphQLList(CategoryType) },
//       limit: { type: GraphQLInt },
//       index: { type: GraphQLInt },
//       count: { type: GraphQLInt }
//     }
//   }),
//   args: {
//     index: { type: GraphQLInt, defaultValue: 0 },
//     limit: { type: GraphQLInt, defaultValue: 10 },
//     expanded: { type: GraphQLBoolean, defaultValue: false },
//     root: { type: GraphQLBoolean, defaultValue: false }
//   },
//   resolve: async (parent, args, context: IGQLContext) => {
//     const response = await ControllerFactory.get('categories').getAll(
//       {
//         index: args.index,
//         limit: args.limit,
//         expanded: args.expanded,
//         root: args.root
//       },
//       { expandForeignKeys: false }
//     );

//     return response;
//   }
// },
// getCategory: {
//   type: CategoryType,
//   args: { id: { type: GraphQLID }, slug: { type: GraphQLString } },
//   resolve: async (parent, args, context: IGQLContext) => {
//     if (args.slug) {
//       return await ControllerFactory.get('categories').getBySlug(args.slug, { expandForeignKeys: false });
//     } else {
//       return await ControllerFactory.get('categories').getOne(args.id, { expandForeignKeys: false });
//     }
//   }
// }
