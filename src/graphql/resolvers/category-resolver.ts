import { Resolver, Query, FieldResolver, Arg, Root, ResolverInterface, Mutation, Authorized } from 'type-graphql';
import { Category, PaginatedCategoryResponse, AddCategoryInput } from '../models/category-type';
import ControllerFactory from '../../core/controller-factory';
import { ICategory } from '../../types/models/i-category';
import { UserPrivilege } from '../../core/enums';

@Resolver(of => Category)
export class CategoryResolver implements ResolverInterface<Category> {
  @Query(returns => Category, {
    nullable: true,
    description: 'Gets a page of categories'
  })
  async category(@Arg('id', { nullable: true }) id: string, @Arg('slug', { nullable: true }) slug: string) {
    if (slug) {
      return await ControllerFactory.get('categories').getBySlug(slug);
    } else {
      return await ControllerFactory.get('categories').getOne(id);
    }
  }

  @Query(returns => PaginatedCategoryResponse, { description: 'Gets an array of all categories' })
  async categories(
    @Arg('index') index: number = 0,
    @Arg('limit') limit: number = 10,
    @Arg('expanded') expanded: boolean = false,
    @Arg('root') root: boolean = false
  ) {
    const response = await ControllerFactory.get('categories').getAll({
      index: index,
      limit: limit,
      expanded: expanded,
      root: root
    });

    return PaginatedCategoryResponse.fromEntity(response);
  }

  @FieldResolver(type => Category, { nullable: true })
  async parent(@Root() root: Category) {
    const category = await ControllerFactory.get('categories').getOne(root._id);
    if (!category || !category.parent) return null;

    const parent = await ControllerFactory.get('categories').getOne(category.parent);
    return parent ? Category.fromEntity(parent) : null;
  }

  @FieldResolver(type => [Category])
  async children(@Root() category: Category) {
    const response = await ControllerFactory.get('categories').getAll({ parent: category._id as string });
    return response.data.map(cat => Category.fromEntity(cat));
  }

  @Authorized<UserPrivilege>(['admin'])
  @Mutation(returns => Category)
  async createCategory(@Arg('category') input: AddCategoryInput) {
    const category = (await ControllerFactory.get('categories').create(input)) as ICategory<'server'>;
    return Category.fromEntity(category);
  }

  @Authorized<UserPrivilege>(['admin'])
  @Mutation(returns => Boolean)
  async removeCategory(@Arg('id') id: string) {
    await ControllerFactory.get('categories').remove(id);
    return true;
  }
}
