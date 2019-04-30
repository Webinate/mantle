import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IComment } from '../types/models/i-comment';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import { CommentsModel } from '../models/comments-model';
import Controller from './controller';
import { ObjectID } from 'mongodb';
import { isValidObjectID } from '../utils/utils';
import { Schema } from '../models/schema';
import { IUserEntry } from '../types/models/i-user-entry';
import { ISchemaOptions } from '../types/misc/i-schema-options';

export type CommentVisibility = 'all' | 'public' | 'private';
export type CommentSortType = 'updated' | 'created';

export type CommentGetAllOptions = {
  visibility: CommentVisibility;
  user: string;
  index: number;
  depth: number;
  limit: number;
  expanded: boolean;
  keyword: string;
  root: boolean;
  parentId: string | null;
  postId: string;
  sortType: CommentSortType;
  sortOrder: 'asc' | 'desc';
  verbose: boolean;
};

export type CommentGetOneOptions = {
  verbose?: boolean;
  expanded?: boolean;
  depth?: number;
};

/**
 * A controller that deals with the management of comments
 */
export class CommentsController extends Controller {
  private _commentsModel: CommentsModel;

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
    this._commentsModel = Factory.get('comments');
    return this;
  }

  /**
   * Returns an array of comment entries
   */
  async getAll(options: Partial<CommentGetAllOptions> = { verbose: true }) {
    const comments = this._commentsModel;
    const findToken: Partial<IComment<'server'>> & { $or: Partial<IComment<'server'>>[] } = { $or: [] };

    // Set the parent filter
    if (options.parentId) findToken.parent = new ObjectID(options.parentId) as any;
    else if (options.root === true) findToken.parent = null;

    if (options.postId) findToken.post = new ObjectID(options.postId);

    // Set the user property if its provided
    if (options.user) findToken.author = new RegExp(options.user, 'i') as any;

    // Check for keywords
    if (options.keyword) findToken.$or.push({ content: <any>new RegExp(options.keyword, 'i') });

    // Add the or conditions for visibility
    if (options.visibility === 'public') findToken.public = true;

    // Set the default sort order to ascending
    let sortOrder = -1;
    if (options.sortOrder) {
      if (options.sortOrder.toLowerCase() === 'asc') sortOrder = 1;
      else sortOrder = -1;
    }

    // Sort by the date created
    let sort: { [key in keyof Partial<IComment<'server'>>]: number } = { createdOn: sortOrder };

    // Optionally sort by the last updated
    if (options.sortType) {
      if (options.sortType === 'updated') sort = { lastUpdated: sortOrder };
      else if (options.sortType === 'created') sort = { createdOn: sortOrder };
    }

    if (findToken.$or.length === 0) delete findToken.$or;

    // First get the count
    const count = await comments.count(findToken);
    const sanitizedData = await comments.downloadMany(
      {
        selector: findToken,
        sort: sort,
        index: options.index || 0,
        limit: options.limit || 10
      },
      {
        verbose: options.verbose === undefined ? true : options.verbose,
        expandForeignKeys: options.expanded || false,
        expandMaxDepth: options.depth || 1,
        expandSchemaBlacklist: [
          /parent/, // Do not expand parent comment
          /avatarFile\.user/, // Do not expand a comments user's avatar file
          /children\.post/ // Do not expand sub comment posts
        ]
      }
    );

    const response: Page<IComment<'client' | 'expanded'>> = {
      count: count,
      data: sanitizedData,
      index: options.index || 0,
      limit: options.limit || 10
    };

    return response;
  }

  /**
   * When a user is removed, we removed comments originated by the user
   * and nullify those that are replies
   */
  async userRemoved(user: IUserEntry<'server'>) {
    const collection = this._commentsModel.collection as mongodb.Collection<IComment<'server'>>;
    const cursor = collection.find({ user: user._id } as IComment<'server'>);
    const comments = await cursor.toArray();
    const promisesToRemove: Promise<void>[] = [];
    const promisesToNullify: Promise<any>[] = [];

    for (const comment of comments)
      if (!comment.parent) promisesToRemove.push(this.remove(comment._id.toString()));
      else
        promisesToNullify.push(
          collection.updateMany({ _id: comment._id } as IComment<'server'>, {
            $set: { user: null } as IComment<'server'>
          })
        );

    await Promise.all(promisesToNullify);
    await Promise.all(promisesToRemove);
  }

  /**
   * Gets a single comment resource
   * @param id The id of the comment to fetch
   * @param options Options for getting the resource
   */
  async getOne(id: string, options: CommentGetOneOptions = { verbose: true }) {
    const comments = this._commentsModel;
    const findToken: Partial<IComment<'server'>> = { _id: new mongodb.ObjectID(id) };
    const comment = await comments.downloadOne(findToken, {
      verbose: options.verbose === undefined ? true : options.verbose,
      expandForeignKeys: options.expanded || false,
      expandMaxDepth: options.depth || 1,
      expandSchemaBlacklist: [/parent/, /avatarFile\.user/]
    });

    if (!isValidObjectID(id)) throw new Error(`Please use a valid object id`);

    if (!comment) throw new Error('Could not find comment');

    const sanitizedData = await comment;
    return sanitizedData;
  }

  /**
   * Removes a comment by its id
   * @param id The id of the comment
   */
  async remove(id: string) {
    if (!isValidObjectID(id)) throw new Error(`Please use a valid object id`);

    const comments = this._commentsModel;
    const findToken: Partial<IComment<'server'>> = { _id: new mongodb.ObjectID(id) };

    const comment = await comments.findOne(findToken);

    if (!comment) throw new Error('Could not find a comment with that ID');

    const children = comment.getByName('children').getDbValue();
    const promises: Promise<any>[] = [];
    for (const child of children) promises.push(this.remove(child.toString()));

    if (promises.length > 0) await Promise.all(promises);

    // Remove from parent children
    if (comment.dbEntry.parent) {
      const parent = await comments.findOne({ _id: comment.dbEntry.parent } as IComment<'server'>);
      const newChildren = parent!.dbEntry.children.filter(c => !c.equals(comment.dbEntry._id));
      await comments.update({ _id: comment.dbEntry.parent! } as IComment<'server'>, {
        children: newChildren.map(child => child.toString())
      });
    }

    // Attempt to delete the instances
    await comments.deleteInstances(findToken);
  }

  /**
   * Updates a comment by id
   * @param id The id of the comment
   * @param token The update token of the comment
   */
  async update(id: string, token: Partial<IComment<'client'>>) {
    const comments = this._commentsModel;
    const findToken: Partial<IComment<'server'>> = { _id: new mongodb.ObjectID(id) };
    const updatedComment = await comments.update(findToken, token, {
      verbose: true,
      expandForeignKeys: false
    });
    return updatedComment;
  }

  /**
   * Creates a new comment
   * @param token The data of the comment to create
   */
  async create(token: Partial<IComment<'client'>>, schemaOptions?: Partial<ISchemaOptions>) {
    const comments = this._commentsModel;
    let parent: Schema<IComment<'server'>, IComment<'client' | 'expanded'>> | null = null;

    if (token.parent) {
      parent = await comments.findOne(<IComment<'server'>>{ _id: new mongodb.ObjectID(token.parent as string) });

      if (!parent) throw new Error(`No comment exists with the id ${token.parent}`);
    }

    token.createdOn = Date.now();

    const instance = await comments.createInstance(token);
    const json = await instance.downloadToken(schemaOptions || { verbose: true });

    // Assign this comment as a child to its parent comment if it exists
    if (parent) {
      const children = parent
        .getByName('children')!
        .getDbValue()!
        .map(id => id.toString());
      children.push(instance.dbEntry._id.toString());
      await comments.update(<IComment<'server'>>{ _id: parent.dbEntry._id }, { children: children });
    }

    return json;
  }
}
