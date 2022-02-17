import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import * as mongodb from 'mongodb';
import Controller from './controller';
import { ICategory } from '../types/models/i-category';
import { ObjectId } from 'mongodb';
import { CategoriesGetOptions } from '../core/enums';

export type GetOneOptions = {
  expanded: boolean;
  depth: number;
};

/**
 * A controller that deals with the management of categories
 */
export class CategoriesController extends Controller {
  private _collection: mongodb.Collection<ICategory<'server'>>;

  /**
   * Creates a new instance of the controller
   */
  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(db: mongodb.Db) {
    this._collection = await db.collection('categories');
    return this;
  }

  /**
   * Returns an array of category entries
   */
  async getAll(options: Partial<CategoriesGetOptions> = {}) {
    const collection = this._collection;
    const index: number = options.index || 0;
    const limit = options.limit || undefined;
    const root = options.root || false;

    const selector = root
      ? ({ parent: null } as ICategory<'server'>)
      : options.parent
      ? ({ parent: new ObjectId(options.parent) } as ICategory<'server'>)
      : undefined;

    const sanitizedData = await collection.find(selector || {}, { limit, skip: index });
    const count = await collection.count({});
    const data = await sanitizedData.toArray();

    const response: Page<ICategory<'server'>> = {
      count: count,
      data: data,
      index: index,
      limit: limit ?? -1
    };

    return response;
  }

  /**
   * Gets a single category resource
   * @param id The id of the category to fetch
   */
  async getOne(id: string | mongodb.ObjectId) {
    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectId(id) };
    return await this._collection.findOne(findToken);
  }

  /**
   * Gets a single category resource by its slug
   * @param slug The slug of the category to fetch
   */
  async getBySlug(slug: string) {
    const findToken: Partial<ICategory<'server'>> = { slug: slug };
    return await this._collection.findOne(findToken);
  }

  /**
   * Removes a category by its id
   * @param id The id of the category
   */
  async remove(id: string | ObjectId) {
    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectId(id) };
    const category = await this._collection.findOne(findToken);

    if (!category) throw new Error('Could not find a comment with that ID');

    const promises: Promise<any>[] = [];

    const children = await this._collection.find({ parent: category._id } as ICategory<'server'>).toArray();
    for (const child of children) promises.push(this.remove(child._id));
    if (children.length > 0) await Promise.all(promises);

    // Attempt to delete the instance
    await this._collection.deleteOne(findToken);
  }

  /**
   * Updates a category by id
   * @param token The update token of the category
   */
  async update(token: Partial<ICategory<'server'>>) {
    const collection = this._collection;
    let parent: ICategory<'server'> | null = null;

    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectId(token._id) };
    const curCategory = await collection.findOne(findToken);
    if (!curCategory) throw new Error(`No category exists with the id ${token._id}`);

    if (curCategory.slug !== token.slug) {
      const exists = await collection.findOne({ slug: token.slug } as ICategory<'server'>);
      if (exists) throw new Error(`Category with the slug '${token.slug}' already exists`);
    }

    // Check if target parent exists
    if (token.parent) {
      parent = await collection.findOne(<ICategory<'server'>>{ _id: new mongodb.ObjectId(token.parent) });
      if (!parent) throw new Error(`No category exists with the id ${token.parent}`);
    }

    await collection.updateOne(findToken, token);
    const updatedCategory = await collection.findOne(findToken);

    return updatedCategory!;
  }

  /**
   * Creates a new category
   * @param token The data of the category to create
   */
  async create(token: Partial<ICategory<'server'>>) {
    const collection = this._collection;
    let parent: ICategory<'server'> | null = null;

    if (token.slug) {
      const exists = await collection.findOne({ slug: token.slug } as ICategory<'server'>);
      if (exists) throw new Error(`Category with the slug '${token.slug}' already exists`);
    }

    if (token.parent) {
      parent = await collection.findOne(<ICategory<'server'>>{ _id: new mongodb.ObjectId(token.parent) });
      if (!parent) throw new Error(`No category exists with the id ${token.parent}`);
    }

    const result = await collection.insertOne(token as ICategory<'server'>);
    const instance = await collection.findOne({ _id: result.insertedId } as ICategory<'server'>);

    if (!instance) throw new Error(`Could not create category`);
    return instance;
  }
}
