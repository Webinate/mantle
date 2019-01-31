import { IAuthReq } from '../types/tokens/i-auth-request';
import { IUserEntry } from '../types/models/i-user-entry';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Router } from './router';
import { j200 } from '../decorators/responses';
import { validId } from '../decorators/path-sanity';
import { admin, identify, authorize } from '../decorators/permissions';
import { UserPrivileges } from '../core/enums';
import { IBaseControler } from '../types/misc/i-base-controller';
import { IPost } from '../types/models/i-post';
import Factory from '../core/model-factory';
import ControllerFactory from '../core/controller-factory';
import { PostsController, PostVisibility } from '../controllers/posts';
import { Error403 } from '../utils/errors';

/**
 * A controller that deals with the management of posts
 */
export class PostsRouter extends Router {

  private _options: IBaseControler;
  private _controller: PostsController;

  /**
	 * Creates a new instance of the controller
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'posts' ), Factory.get( 'categories' ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ) {
    this._controller = ControllerFactory.get( 'posts' );
    const router = express.Router();

    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', this.getPosts.bind( this ) );
    router.get( '/s/:slug', this.getPostBySlug.bind( this ) );
    router.get( '/:id', this.getPost.bind( this ) );
    router.get( '/:id/drafts', this.getPostDrafts.bind( this ) );
    router.delete( '/:id', this.removePost.bind( this ) );
    router.delete( '/:postId/drafts/:draftId', this.removeDraft.bind( this ) );
    router.put( '/:id', this.updatePost.bind( this ) );
    router.post( '/', this.createPost.bind( this ) );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/posts', router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Returns an array of IPost items
   */
  @j200()
  @identify()
  private async getPosts( req: IAuthReq, res: express.Response ) {
    let visibility: PostVisibility | undefined;
    const user = req._user;

    // Check for visibility
    if ( req.query.visibility )
      visibility = ( req.query.visibility as string ).toLowerCase() as PostVisibility;

    // If no user we only allow public
    if ( !user )
      visibility = 'public';
    // If an admin - we do not need visibility
    else if ( user.privileges! > UserPrivileges.Admin )
      visibility = 'public';
    // Regular users only see public
    else {
      if ( visibility === 'public' )
        visibility = 'public';
      else if ( visibility === 'private' )
        visibility = 'private';
      else
        visibility = 'all';
    }

    let index: number | undefined = parseInt( req.query.index );
    let limit: number | undefined = parseInt( req.query.limit );
    index = isNaN( index ) ? undefined : index;
    limit = isNaN( limit ) ? undefined : limit;

    const response = await this._controller.getPosts( {
      visibility: visibility as PostVisibility,
      keyword: req.query.keyword,
      author: req.query.author,
      tags: req.query.tags ? req.query.tags.split( ',' ) : undefined,
      categories: req.query.categories ? req.query.categories.split( ',' ) : undefined,
      requiredTags: req.query.rtags ? req.query.rtags.split( ',' ) : undefined,
      sort: req.query.sort ? req.query.sort.toLowerCase() : undefined,
      sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
      minimal: req.query.minimal ? true : false,
      index: index,
      limit: limit,
      verbose: req.query.verbose === 'true'
    } );

    return response;
  }

  /**
   * Returns a single post
   */
  @j200()
  @validId( 'id', 'ID' )
  @identify()
  private async getPost( req: IAuthReq, res: express.Response ) {
    return this._getPost( req, res );
  }

  /**
   * Returns a single post
   */
  @j200()
  @identify()
  private async getPostBySlug( req: IAuthReq, res: express.Response ) {
    return this._getPost( req, res );
  }

  @j200()
  @validId( 'id', 'ID' )
  @authorize()
  private async getPostDrafts( req: IAuthReq, res: express.Response ) {
    const user: IUserEntry<'server'> = req._user!;
    const response = await this._controller.getDrafts( req.params.id );
    if ( req._isAdmin || user._id.toString() === response.post.author )
      return response.drafts;

    throw new Error403();
  }

  @j200( 204 )
  @validId( 'postId', 'Post ID' )
  @validId( 'draftId', 'Draft ID' )
  @admin()
  private async removeDraft( req: IAuthReq, res: express.Response ) {
    await this._controller.removeDraft( req.params.postId, req.params.draftId );
    return;
  }



  private async _getPost( req: IAuthReq, res: express.Response ) {
    const user: IUserEntry<'server'> = req._user!;
    const post = await this._controller.getPost( {
      id: req.params.id,
      slug: req.params.slug,
      includeDocument: req.query.document && req.query.document === 'false' ? false : true,
      verbose: req.query.verbose !== undefined ? req.query.verbose === 'true' : false
    } )!;

    // Only admins are allowed to see private posts
    if ( !post.public && ( !user || ( user && user.privileges! > UserPrivileges.Admin ) ) )
      throw new Error403( 'That post is marked private' );

    return post;
  }

  /**
   * Attempts to remove a post by ID
   */
  @j200( 204 )
  @validId( 'id', 'ID' )
  @admin()
  private async removePost( req: IAuthReq, res: express.Response ) {
    await this._controller.removePost( req.params.id );
    return;
  }

  /**
   * Attempts to update a post by ID
   */
  @j200()
  @validId( 'id', 'ID' )
  @admin()
  private async updatePost( req: IAuthReq, res: express.Response ) {
    const token: IPost<'client'> = req.body;
    const post = await this._controller.update( req.params.id, token );
    return post;
  }

  /**
   * Attempts to create a new post
   */
  @j200()
  @admin()
  private async createPost( req: IAuthReq, res: express.Response ) {
    const token: IPost<'client'> = req.body;

    // User is passed from the authentication function
    if ( !token.author )
      token.author = req._user!._id.toString();

    const post = await this._controller.create( token );
    return post;
  }
}