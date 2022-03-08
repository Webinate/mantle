import { IConfig } from '../types/all-types';
import { Page, IPost, IUserEntry, IFileEntry, IDraft } from '../types';
import { Db, ObjectId, Collection, Sort, SortDirection } from 'mongodb';
import ControllerFactory from '../core/controller-factory';
import Controller from './controller';
import { UsersController } from './users';
import { DocumentsController } from './documents';
import { Error404, Error400 } from '../utils/errors';
import { SortOrder, PostsGetOptions } from '../core/enums';

export type PostsGetOneOptions = {
  id: string | ObjectId;
  slug: string;
  verbose: boolean;
  expanded: boolean;
  public: boolean;
};

/**
 * A controller that deals with the management of posts
 */
export class PostsController extends Controller {
  private _postsCollection: Collection<IPost<'server'>>;
  private _draftsCollection: Collection<IDraft<'server'>>;
  private _users: UsersController;
  private _documents: DocumentsController;

  /**
   * Creates a new instance of the controller
   */
  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(db: Db) {
    this._postsCollection = db.collection<IPost<'server'>>('posts');
    this._draftsCollection = db.collection<IDraft<'server'>>('drafts');
    this._users = ControllerFactory.get('users');
    this._documents = ControllerFactory.get('documents');
    return this;
  }

  /**
   * Returns an array of IPost items
   */
  async getPosts(options: Partial<PostsGetOptions> = {}) {
    const posts = this._postsCollection;
    const findToken: Partial<IPost<'server'>> & { $or?: IPost<'server'>[] } = { $or: [] };

    if (options.author) {
      const user = await this._users.getUsers({ search: new RegExp(`^${options.author!}$`, 'i') });
      if (user && user.data.length > 0) findToken.author = user.data[0]._id;
      else {
        return {
          count: 0,
          data: [],
          index: options.index || 0,
          limit: options.limit || 10
        } as Page<IPost<'server'>>;
      }
    }

    // Check for keywords
    if (options.keyword) {
      const keyword = new RegExp(options.keyword, 'i');
      findToken.$or!.push(<IPost<'server'>>{ title: <any>keyword });
      findToken.$or!.push(<IPost<'server'>>{ brief: <any>keyword });
    }

    // Add the or conditions for visibility
    if (options.visibility === 'public') findToken.public = true;
    else if (options.visibility === 'private') findToken.public = false;

    // Check for tags (an OR request with tags)
    if (options.tags && options.tags.length > 0) {
      findToken.tags = { $in: options.tags } as any;
    }

    // Check for required tags (an AND request with tags)
    if (options.requiredTags && options.requiredTags.length > 0) {
      if (!findToken.tags) findToken.tags = { $all: options.requiredTags } as any;
      else (findToken.tags as any).$all = options.requiredTags;
    }

    // Check for categories
    if (options.categories && options.categories.length > 0) findToken.categories = { $in: options.categories } as any;

    // Set the default sort order to ascending
    let sortOrder: SortDirection = 'asc';

    if (options.sortOrder) {
      if (options.sortOrder === SortOrder.asc) sortOrder = 'asc';
      else sortOrder = 'desc';
    }

    // Sort by the date created
    let sort: Sort | undefined = undefined;

    // Optionally sort by the last updated
    if (options.sort === 'created') sort = { createdOn: sortOrder };
    else if (options.sort === 'modified') sort = { lastUpdated: sortOrder };
    else if (options.sort === 'title') sort = { title: sortOrder };

    // Stephen is lovely
    if (findToken.$or!.length === 0) delete findToken.$or;

    // First get the count
    const count = await posts.count(findToken);
    const index: number = options.index || 0;
    let limit: number | undefined = options.limit || 10;

    if (limit === -1) limit = undefined;

    const sanitizedData = await posts
      .find(findToken, { skip: index, limit })
      .sort(sort || {})
      .toArray();

    const response: Page<IPost<'server'>> = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit ? limit : -1
    };

    return response;
  }

  /**
   * Gets all drafts associated with a post
   */
  async getDrafts(postId: string | ObjectId) {
    const postsCollection = this._postsCollection;
    const draftsCollection = this._draftsCollection;
    const findToken: Partial<IPost<'server'>> = { _id: new ObjectId(postId) };
    const post = await postsCollection.findOne(findToken);

    if (!post) throw new Error404('Post does not exist');

    const drafts = await draftsCollection
      .find({ parent: post.document } as IDraft<'server'>)
      .sort({ createdOn: 'asc' })
      .toArray();

    return {
      post,
      drafts
    };
  }

  /**
   * Gets a single draft by its ID
   */
  async getDraft(id: string) {
    const drafts = this._draftsCollection;
    const findToken: Partial<IDraft<'server'>> = { _id: new ObjectId(id) };
    const draft = await drafts.findOne(findToken);

    if (!draft) return null;
    return draft;
  }

  /**
   * Removes a draft from a post
   */
  async removeDraft(postId: string | ObjectId, draftId: string | ObjectId) {
    const posts = this._postsCollection;
    const drafts = this._draftsCollection;
    const findPostToken: Partial<IPost<'server'>> = { _id: new ObjectId(postId) };
    const findDraftToken: Partial<IDraft<'server'>> = { _id: new ObjectId(draftId) };
    const post = await posts.findOne(findPostToken);

    if (!post) throw new Error404('Post does not exist');

    const draft = await drafts.findOne(findDraftToken);
    if (!draft) throw new Error404('Draft does not exist');

    await drafts.deleteOne({ _id: draft._id } as IDraft<'server'>);
    if (post.latestDraft && post.latestDraft.equals(draft._id))
      await posts.updateOne({ _id: post._id } as IPost<'server'>, { $set: { latestDraft: null } });
  }

  /**
   * Nullifys the user on all relevant posts
   */
  async userRemoved(userId: IUserEntry<'server'>) {
    await this._postsCollection.updateMany({ author: userId._id } as IPost<'server'>, {
      $set: { author: null } as IPost<'server'>
    });
  }

  /**
   * Nullifys the featured image if its deleted
   */
  async onFileRemoved(file: IFileEntry<'server'>) {
    const collection = this._postsCollection;
    await collection.updateMany({ featuredImage: file._id } as IPost<'server'>, {
      $set: { featuredImage: null } as IPost<'server'>
    });
  }

  /**
   * Removes many posts by a selector
   */
  async removeBy(selector: Partial<IPost<'client'>>) {
    const schemas = await this._postsCollection.find({ selector }).toArray();
    const promises: Promise<void>[] = [];
    for (const schema of schemas) promises.push(this.removePost(schema._id));

    return Promise.all(promises);
  }

  /**
   * Removes a post by ID
   * @param id The id of the post we are removing
   */
  async removePost(id: string | ObjectId) {
    if (!ObjectId.isValid(id)) throw new Error(`Please use a valid object id`);

    const post = await this._postsCollection.findOne({ _id: new ObjectId(id) });
    if (!post) throw new Error404(`Could not find post`);

    const commentsFactory = ControllerFactory.get('comments');
    const comments = await commentsFactory.getAll({ postId: id, limit: undefined });
    const promises: Promise<any>[] = [];

    for (const comment of comments.data) promises.push(commentsFactory.remove(comment._id));

    await Promise.all(promises);
    await this._documents.remove(post.document!.toString());

    // Attempt to delete the instances
    const numRemoved = await this._postsCollection.deleteOne({ _id: new ObjectId(id) });

    if (numRemoved.deletedCount === 0) throw new Error('Could not find a post with that ID');

    return;
  }

  /**
   * Updates a post resource
   * @param id The id of the post to edit
   * @param token The edit token
   */
  async update(id: string | ObjectId, token: Partial<IPost<'server'>>) {
    if (!ObjectId.isValid(id)) throw new Error(`Please use a valid object id`);

    token.lastUpdated = Date.now();

    // Check if the image exists
    if (token.featuredImage) {
      const file = await ControllerFactory.get('files').getFile(token.featuredImage);
      if (!file) throw new Error404(`File '${token.featuredImage}' does not exist`);
    }

    const postToUpdate = await this._postsCollection.findOne({ _id: new ObjectId(id) } as IPost<'server'>);

    if (!postToUpdate) throw new Error404();

    // Make sure the slug is unique
    if (postToUpdate.slug !== token.slug && token.slug) {
      const existingPost = await this._postsCollection.findOne({ slug: token.slug } as IPost<'server'>);
      if (existingPost) throw new Error400(`Slug must be unique`);
    }

    const response = await this._postsCollection.updateOne({ _id: postToUpdate._id } as IPost<'server'>, {
      $set: token
    });
    if (response.matchedCount === 0) throw new Error404();

    const updatedPost = await this._postsCollection.findOne({ _id: new ObjectId(id) } as IPost<'server'>);

    const newDraft = await this._documents.publishDraft(updatedPost!.document);
    await this._postsCollection.updateOne({ _id: updatedPost!._id } as IPost<'server'>, {
      $set: { latestDraft: newDraft._id } as IPost<'server'>
    });

    const toRet = await this._postsCollection.findOne({ _id: updatedPost!._id } as IPost<'server'>);
    toRet!.latestDraft = newDraft._id;
    return toRet;
  }

  /**
   * Creates a new post
   * @param token The initial post data
   */
  async create(token: Partial<IPost<'server'>>) {
    token.createdOn = Date.now();
    token.lastUpdated = Date.now();
    token.tags = token.tags ? token.tags : [];
    token.brief = token.brief || '';
    token.categories = token.categories ? token.categories : [];
    token.public = token.public === undefined ? true : token.public;

    // Check if the image exists
    if (token.featuredImage) {
      const file = await ControllerFactory.get('files').getFile(token.featuredImage);
      if (!file) throw new Error404(`File '${token.featuredImage}' does not exist`);
    }

    let insertionResult = await this._postsCollection.insertOne(token as IPost<'server'>);

    // Create a new document for the post
    const doc = await this._documents.create(token.author);

    await this._postsCollection.updateOne({ _id: insertionResult.insertedId } as IPost<'server'>, {
      $set: { document: doc._id } as IPost<'server'>
    });

    let newPost = await this._postsCollection.findOne({ _id: insertionResult.insertedId } as IPost<'server'>);
    return newPost!;
  }

  /**
   * Gets a single post resource
   * @param options Options for getting the post resource
   */
  async getPost(options: Partial<PostsGetOneOptions> = {}) {
    const posts = this._postsCollection;
    let findToken: Partial<IPost<'server'>>;

    if (options.id) findToken = { _id: new ObjectId(options.id) };
    else if (options.slug) findToken = { slug: options.slug };
    else throw new Error(`You must specify either an id or slug when fetching a post`);

    if (options.public !== undefined) findToken.public = options.public;

    const post = await posts!.findOne(findToken);
    if (!post) throw new Error('Could not find post');

    return post;
  }
}
