import { ObjectType, Field, InputType, ArgsType, Int } from 'type-graphql';
import { PaginatedResponse } from './paginated-response';
import { ICategory } from '../../types/models/i-category';
import { Page } from '../../types/tokens/standard-tokens';
import { IsSafeText } from '../../decorators/isSafeText';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';

@ObjectType({ description: 'Object representing a Category' })
export class Category {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field()
  slug: string;

  @Field(type => Category, { nullable: true })
  parent: Category | null;

  @Field(type => [Category], { nullable: true })
  children: Category[];

  static fromEntity(category: ICategory<'server'>) {
    const toReturn = new Category();
    Object.assign(toReturn, category);
    return toReturn;
  }
}

@InputType()
export class AddCategoryInput {
  @Field()
  @IsSafeText()
  title: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsSafeText()
  description: string = '';

  @Field()
  slug: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  parent: ObjectId | string;

  constructor(initialization?: Partial<AddCategoryInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@InputType()
export class UpdateCategoryInput extends AddCategoryInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

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
