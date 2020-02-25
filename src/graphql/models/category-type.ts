import { ObjectType, Field, ID, InputType, ArgsType, Int } from 'type-graphql';
import { PaginatedResponse } from './paginated-response';
import { ICategory } from '../../types/models/i-category';
import { Page } from '../../types/tokens/standard-tokens';

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

  @Field({ nullable: true })
  description: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  parent: string;

  @Field(type => [String], { nullable: true })
  children: string[];

  constructor(initialization?: Partial<AddCategoryInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@InputType()
export class UpdateCategoryInput extends AddCategoryInput {
  @Field(type => ID)
  _id: string;

  constructor(initialization?: Partial<UpdateCategoryInput>) {
    super(initialization);
  }
}

@ArgsType()
export class GetCategoriesArgs {
  @Field(type => Boolean)
  root = false;

  @Field(type => Int, { defaultValue: 0 })
  index: number = 0;

  @Field(type => Int, { defaultValue: 10 })
  limit = 10;
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
