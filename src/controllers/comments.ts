﻿import { IConfig } from '../types/all-types';
import { Page, IComment, IUserEntry, IPost } from '../types';
import * as mongodb from 'mongodb';
import { Sort, SortDirection } from 'mongodb';
import Controller from './controller';
import { ObjectId } from 'mongodb';
import { SortOrder, CommentSortType, CommentVisibility, CommentsGetOptions } from '../core/enums';

/**
 * A controller that deals with the management of comments
 */
export class CommentsController extends Controller {
  private _commentsCollection: mongodb.Collection<IComment<'server'>>;
  private _postsCollection: mongodb.Collection<IPost<'server'>>;
  private _usersCollection: mongodb.Collection<IUserEntry<'server'>>;

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
    this._commentsCollection = await db.collection('comments');
    this._postsCollection = await db.collection('posts');
    this._usersCollection = await db.collection('users');
    return this;
  }

  /**
   * Returns an array of comment entries
   */
  async getAll(options: Partial<CommentsGetOptions> = {}) {
    const comments = this._commentsCollection;
    const findToken: Partial<IComment<'server'>> & { $or?: Partial<IComment<'server'>>[] } = { $or: [] };

    // Set the parent filter
    if (options.parentId) findToken.parent = new ObjectId(options.parentId) as any;
    else if (options.root === true) findToken.parent = null;

    if (options.postId) findToken.post = new ObjectId(options.postId);

    // Set the user property if its provided
    if (options.user) findToken.author = new RegExp(options.user, 'i') as any;

    // Check for keywords
    if (options.keyword) findToken.$or!.push({ content: <any>new RegExp(options.keyword, 'i') });

    // Add the or conditions for visibility
    if (options.visibility === CommentVisibility.public) findToken.public = true;

    // Set the default sort order to ascending
    let sortOrder: SortDirection = 'asc';
    if (options.sortOrder) {
      if (options.sortOrder === SortOrder.asc) sortOrder = 'asc';
      else sortOrder = 'desc';
    }

    // Sort by the date created
    let sort: Sort = { createdOn: sortOrder };

    // Optionally sort by the last updated
    if (options.sortType) {
      if (options.sortType === CommentSortType.updated) sort = { lastUpdated: sortOrder };
      else if (options.sortType === CommentSortType.created) sort = { createdOn: sortOrder };
    }

    if (findToken.$or!.length === 0) delete findToken.$or;

    if (options.limit === -1) options.limit = undefined;

    // First get the count
    const count = await comments.count(findToken);
    const sanitizedData = await comments
      .find(findToken, { skip: options.index || 0, limit: options.limit })
      .sort(sort || {})
      .toArray();

    const response: Page<IComment<'server'>> = {
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
    const collection = this._commentsCollection;
    const cursor = collection.find({ user: user._id } as IComment<'server'>);
    const comments = await cursor.toArray();
    const promisesToRemove: Promise<void>[] = [];
    const promisesToNullify: Promise<any>[] = [];

    for (const comment of comments)
      if (!comment.parent) promisesToRemove.push(this.remove(comment._id));
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
  async getOne(id: string | ObjectId) {
    const comments = this._commentsCollection;
    const findToken: Partial<IComment<'server'>> = { _id: new mongodb.ObjectId(id) };
    const comment = await comments.findOne(findToken);

    if (!ObjectId.isValid(id)) throw new Error(`Please use a valid object id`);
    if (!comment) throw new Error('Could not find comment');
    return comment;
  }

  /**
   * Removes a comment by its id
   * @param id The id of the comment
   */
  async remove(id: string | ObjectId) {
    if (!ObjectId.isValid(id)) throw new Error(`Please use a valid object id`);

    const comments = this._commentsCollection;
    const findToken: Partial<IComment<'server'>> = { _id: new mongodb.ObjectId(id) };

    const comment = await comments.findOne(findToken);
    if (!comment) throw new Error('Could not find a comment with that ID');

    const promises: Promise<any>[] = [];
    for (const child of comment.children) promises.push(this.remove(child));
    if (promises.length > 0) await Promise.all(promises);

    // Remove from parent children
    if (comment.parent) {
      const parent = await comments.findOne({ _id: comment.parent } as IComment<'server'>);
      const newChildren = parent!.children.filter(c => !c.equals(comment._id));
      await comments.updateOne({ _id: comment.parent! } as IComment<'server'>, {
        $set: { children: newChildren.map(child => child) }
      });
    }

    // Attempt to delete the instances
    await comments.deleteOne(findToken);
  }

  /**
   * Updates a comment by id
   * @param id The id of the comment
   * @param token The update token of the comment
   */
  async update(id: string | ObjectId, token: Partial<IComment<'server'>>) {
    const comments = this._commentsCollection;
    const findToken: Partial<IComment<'server'>> = { _id: new mongodb.ObjectId(id) };
    token.lastUpdated = Date.now();
    await comments.updateOne(findToken, { $set: token });
    const updatedComment = await comments.findOne(findToken);
    return updatedComment!;
  }

  /**
   * Creates a new comment
   * @param token The data of the comment to create
   */
  async create(token: Partial<IComment<'server'>>) {
    const comments = this._commentsCollection;
    const posts = this._postsCollection;
    const users = this._usersCollection;
    let parent: IComment<'server'> | null = null;

    if (token.parent) {
      parent = await comments.findOne({ _id: new mongodb.ObjectId(token.parent) } as IComment<'server'>);
      if (!parent) throw new Error(`No comment exists with the id ${token.parent}`);
    }

    if (token.post) {
      let post = await posts.findOne({ _id: new mongodb.ObjectId(token.post) } as IPost<'server'>);
      if (!post) throw new Error(`No post exists with the id ${token.post}`);
    }

    let author = '';
    if (token.user) {
      let user = await users.findOne({ _id: token.user } as IUserEntry<'server'>);
      if (!user) throw new Error(`No user exists with the id ${token.user}`);
      author = user.username as string;
    }

    token.createdOn = Date.now();
    token.lastUpdated = token.createdOn;
    token.author = author;
    token.children = token.children ? token.children : [];
    token.public = token.public === undefined ? true : token.public;

    const insertResult = await comments.insertOne(token as IComment<'server'>);
    const instance = await comments.findOne({ _id: insertResult.insertedId } as IComment<'server'>);

    // Assign this comment as a child to its parent comment if it exists
    if (parent) {
      const children = parent.children.map(id => id);
      children.push(instance!._id);
      await comments.updateOne({ _id: parent._id } as IComment<'server'>, {
        $set: { children: children } as IComment<'server'>
      });
    }

    return instance!;
  }
}
