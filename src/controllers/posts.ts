import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IPost } from '../types/models/i-post';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import ControllerFactory from '../core/controller-factory';
import { PostsModel } from '../models/posts-model';
import Controller from './controller';
import { isValidObjectID } from '../utils/utils';
import { UsersController } from './users';
import { IUserEntry } from '../types/models/i-user-entry';
import { IFileEntry } from '../types/models/i-file-entry';
import { DocumentsController } from './documents';
import { Error404 } from '../utils/errors';
import { Schema } from '../models/schema';

export type PostVisibility = 'all' | 'public' | 'private';

export type PostsGetAllOptions = {
  visibility: PostVisibility;
  categories: string[];
  tags: string[];
  rtags: string[];
  sort: 'title' | 'created' | 'modified';
  requiredTags?: string[];
  index: number;
  limit: number;
  keyword: string;
  author: string;
  sortOrder: 'asc' | 'desc';
  minimal: boolean;
  verbose: boolean;
}

export type PostsGetOneOptions = {
  id?: string;
  slug?: string;
  verbose?: boolean;
  public?: boolean;
}

/**
 * A controller that deals with the management of posts
 */
export class PostsController extends Controller {
  private _postsModel: PostsModel;
  private _users: UsersController;
  private _documents: DocumentsController;

  /**
	 * Creates a new instance of the controller
	 */
  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( db: mongodb.Db ) {
    this._postsModel = Factory.get( 'posts' );
    this._users = ControllerFactory.get( 'users' );
    this._documents = ControllerFactory.get( 'documents' );
    return this;
  }

  /**
   * Returns an array of IPost items
   */
  async getPosts( options: Partial<PostsGetAllOptions> = { verbose: true } ) {
    const posts = this._postsModel;
    const findToken: Partial<IPost<'server'>> & { $or: IPost<'server'>[] } = { $or: [] };

    if ( options.author ) {
      const user = await this._users.getUsers( undefined, undefined, new RegExp( `^${options.author!}$`, 'i' ) );
      if ( user && user.data.length > 0 )
        findToken.author = new mongodb.ObjectID( user.data[ 0 ]._id );
      else {
        return {
          count: 0,
          data: [],
          index: options.index || 0,
          limit: options.limit || 10
        } as Page<IPost<'client'>>;
      }
    }

    // Check for keywords
    if ( options.keyword ) {
      const keyword = new RegExp( options.keyword, 'i' );
      findToken.$or.push( <IPost<'server'>>{ title: <any>keyword } );
      findToken.$or.push( <IPost<'server'>>{ brief: <any>keyword } );
    }

    // Add the or conditions for visibility
    if ( options.visibility === 'public' )
      findToken.public = true;
    else if ( options.visibility === 'private' )
      findToken.public = false;

    // Check for tags (an OR request with tags)
    if ( options.tags && options.tags.length > 0 ) {
      findToken.tags = { $in: options.tags } as any;
    }

    // Check for required tags (an AND request with tags)
    if ( options.requiredTags && options.requiredTags.length > 0 ) {
      if ( !findToken.tags )
        findToken.tags = { $all: options.requiredTags } as any;
      else
        ( findToken.tags as any ).$all = options.requiredTags;
    }

    // Check for categories
    if ( options.categories && options.categories.length > 0 )
      findToken.categories = { $in: options.categories } as any;


    // Set the default sort order to ascending
    let sortOrder = -1;

    if ( options.sortOrder ) {
      if ( options.sortOrder.toLowerCase() === 'asc' )
        sortOrder = 1;
      else
        sortOrder = -1;
    }

    // Sort by the date created
    let sort: { [ key in keyof Partial<IPost<'server'>> ]: number } | undefined = undefined;

    // Optionally sort by the last updated
    if ( options.sort === 'created' )
      sort = { createdOn: sortOrder };
    else if ( options.sort === 'modified' )
      sort = { lastUpdated: sortOrder };
    else if ( options.sort === 'title' )
      sort = { title: sortOrder };

    let getContent: boolean = true;
    if ( options.minimal )
      getContent = false;

    // Stephen is lovely
    if ( findToken.$or.length === 0 )
      delete findToken.$or;

    // First get the count
    const count = await posts.count( findToken );
    const index: number = options.index || 0;
    const limit: number = options.limit || 10;
    const verbose = options.verbose !== undefined ? options.verbose : true;

    const sanitizedData = await posts.downloadMany( {
      selector: findToken,
      sort: sort,
      index: index,
      limit: limit,
      projection: ( getContent === false ? { content: 0 } : undefined )
    }, {
        expandForeignKeys: true,
        verbose: verbose,
        expandMaxDepth: 2,
        expandSchemaBlacklist: [ /document\.author/ ]
      } );

    const response: Page<IPost<'client' | 'expanded'>> = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit
    };

    return response;
  }

  /**
   * Nullifys the user on all relevant posts
   */
  async userRemoved( userId: IUserEntry<'server'> ) {
    await this._postsModel.collection.updateMany(
      { author: userId._id } as IPost<'server'>,
      { $set: { author: null } as IPost<'server'> }
    )
  }

  /**
   * Nullifys the featured image if its deleted
   */
  async onFileRemoved( file: IFileEntry<'server'> ) {
    const collection = this._postsModel.collection as mongodb.Collection<IPost<'server'>>;
    await collection.updateMany(
      { featuredImage: file._id } as IPost<'server'>,
      { $set: { featuredImage: null } as IPost<'server'> }
    );
  }

  /**
   * Removes many posts by a selector
   */
  async removeBy( selector: Partial<IPost<'client'>> ) {
    const schemas = await this._postsModel.findMany( { selector } );
    const promises: Promise<void>[] = [];
    for ( const schema of schemas )
      promises.push( this.removePost( schema.dbEntry._id.toString() ) );

    return Promise.all( promises );
  }

  /**
   * Removes a post by ID
   * @param id The id of the post we are removing
   */
  async removePost( id: string ) {

    if ( !isValidObjectID( id ) )
      throw new Error( `Please use a valid object id` );

    const post = await this._postsModel.findOne( { _id: new mongodb.ObjectID( id ) } as IPost<'server'> );

    if ( !post )
      throw new Error404( `Could not find post` )

    const commentsFactory = ControllerFactory.get( 'comments' );
    const comments = await commentsFactory.getAll( { postId: id, expanded: false, limit: -1 } );
    const promises: Promise<any>[] = [];

    for ( const comment of comments.data )
      promises.push( commentsFactory.remove( comment._id ) );

    await Promise.all( promises );
    await this._documents.remove( post.dbEntry.document!.toString() );

    // Attempt to delete the instances
    const numRemoved = await this._postsModel.deleteInstances( { _id: new mongodb.ObjectID( id ) } );

    if ( numRemoved === 0 )
      throw new Error( 'Could not find a post with that ID' );

    return;
  }

  /**
   * Updates a post resource
   * @param id The id of the post to edit
   * @param token The edit token
   */
  async update( id: string, token: Partial<IPost<'client'>> ) {

    if ( !isValidObjectID( id ) )
      throw new Error( `Please use a valid object id` );

    const updatedPost = await this._postsModel.update( { _id: new mongodb.ObjectID( id ) }, token, {
      verbose: true,
      expandForeignKeys: true,
      expandMaxDepth: 2,
      expandSchemaBlacklist: [ /document\.author/ ]
    } );

    return updatedPost;
  }

  /**
   * Creates a new post
   * @param token The initial post data
   */
  async create( token: Partial<IPost<'client'>> ) {
    token.createdOn = Date.now();

    let schema = await this._postsModel.createInstance( token );

    // Create a new document for the post
    const docId = await this._documents.create( token.author as string );

    schema = await this._postsModel.update(
      { _id: schema.dbEntry._id } as IPost<'server'>,
      { document: docId.toString() } ) as Schema<IPost<'server'>, IPost<'client'>>;

    const post = await schema.downloadToken( {
      verbose: true,
      expandForeignKeys: true,
      expandMaxDepth: 2,
      expandSchemaBlacklist: [ /document\.author/ ]
    } );

    return post;
  }

  /**
   * Gets a single post resource
   * @param options Options for getting the post resource
   */
  async getPost( options: PostsGetOneOptions = { verbose: true } ) {
    const posts = this._postsModel;
    let findToken: Partial<IPost<'server'>>;

    if ( options.id )
      findToken = { _id: new mongodb.ObjectID( options.id ) };
    else if ( options.slug )
      findToken = { slug: options.slug };
    else
      throw new Error( `You must specify either an id or slug when fetching a post` );

    if ( options.public !== undefined )
      findToken.public = options.public;

    const post = await posts!.downloadOne( findToken, {
      verbose: options.verbose !== undefined ? options.verbose : true,
      expandForeignKeys: true,
      expandMaxDepth: 2,
      expandSchemaBlacklist: [ /document\.author/ ]
    } );

    if ( !post )
      throw new Error( 'Could not find post' );

    return post;
  }
}