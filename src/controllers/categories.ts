import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import * as mongodb from 'mongodb';
import Controller from './controller';
import { ICategory } from '../types/models/i-category';
import { ISchemaOptions } from '../types/misc/i-schema-options';
import { ObjectID } from 'mongodb';

export type CategoriesGetManyOptions = {
  index: number;
  limit: number;
  root: boolean;
  depth: number;
  parent: string;
};

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
  async getAll(options: Partial<CategoriesGetManyOptions> = {}) {
    const collection = this._collection;
    const index: number = options.index || 0;
    const limit: number = options.limit || -1;
    const root = options.root || false;

    const selector = root
      ? ({ parent: null } as ICategory<'server'>)
      : options.parent
      ? ({ parent: new ObjectID(options.parent) } as ICategory<'server'>)
      : undefined;

    const sanitizedData = await collection.find(selector || {}, undefined, index, limit);
    const count = await collection.count({});
    const data = await sanitizedData.toArray();

    const response: Page<ICategory<'server'>> = {
      count: count,
      data: data,
      index: index,
      limit: limit
    };

    return response;
  }

  getDefaultsOptions(options: Partial<ISchemaOptions>): ISchemaOptions {
    return {
      verbose: true,
      expandForeignKeys: options.expandForeignKeys || false,
      expandMaxDepth: options.expandMaxDepth || 1,
      expandSchemaBlacklist: [/parent/]
    };
  }

  /**
   * Gets a single category resource
   * @param id The id of the category to fetch
   */
  async getOne(id: string | mongodb.ObjectID) {
    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectID(id) };
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
  async remove(id: string) {
    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectID(id) };
    const category = await this._collection.findOne(findToken);

    if (!category) throw new Error('Could not find a comment with that ID');

    const promises: Promise<any>[] = [];
    for (const child of category.children) promises.push(this.remove(child.toString()));

    if (category.children.length > 0) await Promise.all(promises);

    const p = category.parent;
    if (p) {
      const findToken: Partial<ICategory<'server'>> = { _id: p };
      const parent = (await this._collection.findOne(findToken)) as ICategory<'server'>;
      let children = parent.children.filter(c => !c.equals(category._id));
      await this._collection.updateOne({ _id: parent._id }, { set: { children } as ICategory<'server'> });
    }

    // Attempt to delete the instance
    await this._collection.deleteOne(findToken);
  }

  /**
   * Updates a category by id
   * @param token The update token of the category
   */
  async update(token: Partial<ICategory<'client'>>) {
    const collection = this._collection;
    let parent: ICategory<'server'> | null = null;

    // Check if target parent exists
    if (token.parent) {
      parent = await collection.findOne(<ICategory<'server'>>{ _id: new mongodb.ObjectID(token.parent) });
      if (!parent) throw new Error(`No category exists with the id ${token.parent}`);
    }

    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectID(token._id) };
    const curCategory = await collection.findOne(findToken);

    if (!curCategory) throw new Error(`No category exists with the id ${token._id}`);

    // If it has a parent - then remove it from the current parent
    if (curCategory.parent && curCategory.parent.toString() !== token.parent) {
      const curParent = (await collection.findOne({ _id: curCategory.parent } as ICategory<'server'>)) as ICategory<
        'server'
      >;
      const children = curParent.children;
      const tokenId = new mongodb.ObjectID(token._id);
      const index = children.findIndex(it => tokenId.equals(it));
      if (index !== -1) {
        children.splice(index, 1);
        await collection.updateOne(
          { _id: curParent._id } as ICategory<'server'>,
          { children: children } as ICategory<'server'>
        );
      }
    }

    await collection.updateOne(findToken, token);
    const updatedCategory = await collection.findOne(findToken);

    // Assign this comment as a child to its parent comment if it exists
    if (parent && updatedCategory) {
      const children = parent.children;
      const newId = updatedCategory._id;
      const index = children.findIndex(it => newId === it);
      if (index === -1) {
        children.push(newId);
        await collection.updateOne(
          <ICategory<'server'>>{ _id: parent._id },
          <ICategory<'server'>>{ children: children }
        );
      }
    }

    return updatedCategory!;
  }

  /**
   * Creates a new category
   * @param token The data of the category to create
   */
  async create(token: Partial<ICategory<'client'>>) {
    const collection = this._collection;
    let parent: ICategory<'server'> | null = null;

    if (token.parent) {
      parent = await collection.findOne(<ICategory<'server'>>{ _id: new mongodb.ObjectID(token.parent) });
      if (!parent) throw new Error(`No category exists with the id ${token.parent}`);
    }

    const result = await collection.insertOne(token);
    const instance = await collection.findOne({ _id: result.insertedId } as ICategory<'server'>);

    if (!instance) throw new Error(`Could not create category`);

    // Assign this comment as a child to its parent comment if it exists
    if (parent && instance) {
      const children = parent.children;
      children.push(instance._id);
      await collection.updateOne(<ICategory<'server'>>{ _id: parent._id }, {
        set: { children: children } as ICategory<'server'>
      });
    }

    return instance;
  }
}
