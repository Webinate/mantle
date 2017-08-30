import { IAuthReq, IPost, IUserEntry, IGetPost, IGetPosts, IResponse } from 'modepress';

import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Controller } from './controller';
import { Model } from '../models/model';
import { PostsModel } from '../models/posts-model';
import { CategoriesModel } from '../models/categories-model';
import { identifyUser, adminRights, hasId } from '../utils/permission-controllers';
import { j200 } from '../utils/serializers';
import { UserPrivileges } from '../core/user';
import { IBaseControler } from 'modepress';

/**
 * A controller that deals with the management of posts
 */
export class PostsController extends Controller {

  private _options: IBaseControler;

	/**
	 * Creates a new instance of the controller
	 */
  constructor( options: IBaseControler ) {
    super( [ Model.registerModel( PostsModel ), Model.registerModel( CategoriesModel ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ): Promise<Controller> {

    const router = express.Router();

    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', <any>[ identifyUser, this.getPosts.bind( this ) ] );
    router.get( '/slug/:slug', <any>[ identifyUser, this.getPost.bind( this ) ] );
    router.get( '/:id', <any>[ identifyUser, hasId( 'id', 'ID' ), this.getPost.bind( this ) ] );
    router.delete( '/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.removePost.bind( this ) ] );
    router.put( '/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.updatePost.bind( this ) ] );
    router.post( '/', <any>[ adminRights, this.createPost.bind( this ) ] );

    // Register the path
    e.use(( this._options.rootPath || '' ) + '/posts', router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Returns an array of IPost items
   */
  @j200()
  private async getPosts( req: IAuthReq, res: express.Response ) {
    const posts = this.getModel( 'posts' );
    let count = 0;
    let visibility: string | undefined = undefined;
    const user = req._user;

    const findToken = { $or: [] as IPost[] };
    if ( req.query.author )
      ( <any>findToken ).author = new RegExp( req.query.author, 'i' );

    // Check for keywords
    if ( req.query.keyword ) {
      findToken.$or.push( <IPost>{ title: <any>new RegExp( req.query.keyword, 'i' ) } );
      findToken.$or.push( <IPost>{ content: <any>new RegExp( req.query.keyword, 'i' ) } );
      findToken.$or.push( <IPost>{ brief: <any>new RegExp( req.query.keyword, 'i' ) } );
    }

    // Check for visibility
    if ( req.query.visibility ) {
      if ( ( <string>req.query.visibility ).toLowerCase() === 'all' )
        visibility = 'all';
      else if ( ( <string>req.query.visibility ).toLowerCase() === 'private' )
        visibility = 'private';
      else
        visibility = 'public';
    }

    // If no user we only allow public
    if ( !user )
      visibility = 'public';
    // If an admin - we do not need visibility
    else if ( user.privileges! < UserPrivileges.Admin )
      visibility = undefined;
    // Regular users only see public
    else
      visibility = 'public';

    // Add the or conditions for visibility
    if ( visibility )
      ( <IPost>findToken ).public = visibility === 'public' ? true : false;


    // Check for tags (an OR request with tags)
    if ( req.query.tags ) {
      const tags = req.query.tags.split( ',' );
      if ( tags.length > 0 )
        ( <any>findToken ).tags = { $in: tags };
    }

    // Check for required tags (an AND request with tags)
    if ( req.query.rtags ) {
      const rtags = req.query.rtags.split( ',' );
      if ( rtags.length > 0 ) {
        if ( !( <any>findToken ).tags )
          ( <any>findToken ).tags = { $all: rtags };
        else
                    ( <any>findToken ).tags.$all = rtags;
      }
    }

    // Check for categories
    if ( req.query.categories ) {
      const categories = req.query.categories.split( ',' );
      if ( categories.length > 0 )
        ( <any>findToken ).categories = { $in: categories };
    }

    // Set the default sort order to ascending
    let sortOrder = -1;

    if ( req.query.sortOrder ) {
      if ( ( <string>req.query.sortOrder ).toLowerCase() === 'asc' )
        sortOrder = 1;
      else
        sortOrder = -1;
    }

    // Sort by the date created
    let sort: IPost = { createdOn: sortOrder };

    // Optionally sort by the last updated
    if ( req.query.sort ) {
      if ( req.query.sort === 'true' )
        sort = { lastUpdated: sortOrder };
    }

    let getContent: boolean = true;
    if ( req.query.minimal )
      getContent = false;

    // Stephen is lovely
    if ( findToken.$or.length === 0 )
      delete findToken.$or;

    // First get the count
    count = await posts!.count( findToken );

    let index: number | undefined;
    let limit: number | undefined;
    if ( req.query.index !== undefined )
      index = parseInt( req.query.index );
    if ( req.query.limit !== undefined )
      limit = parseInt( req.query.limit );

    const instances = await posts!.findInstances<IPost>( {
      selector: findToken,
      sort: sort,
      index: index,
      limit: limit,
      projection: ( getContent === false ? { content: 0 } : undefined )
    } );

    const jsons: Array<Promise<IPost>> = [];
    for ( let i = 0, l = instances.length; i < l; i++ )
      jsons.push( instances[ i ].schema.getAsJson<IPost>( instances[ i ]._id, { verbose: Boolean( req.query.verbose ) } ) );

    const sanitizedData = await Promise.all( jsons );

    return {
      count: count,
      message: `Found ${count} posts`,
      data: sanitizedData
    } as IGetPosts;
  }

  /**
   * Returns a single post
   */
  @j200()
  private async getPost( req: IAuthReq, res: express.Response ) {
    const posts = this.getModel( 'posts' );
    let findToken: IPost;
    const user: IUserEntry = req._user!;

    if ( req.params.id )
      findToken = { _id: new mongodb.ObjectID( req.params.id ) };
    else
      findToken = { slug: req.params.slug };

    const instances = await posts!.findInstances<IPost>( { selector: findToken, index: 0, limit: 1 } );

    if ( instances.length === 0 )
      throw new Error( 'Could not find post' );


    const isPublic = await instances[ 0 ].schema.getByName( 'public' )!.getValue();
    // Only admins are allowed to see private posts
    if ( !isPublic && ( !user || ( user && user.privileges! > UserPrivileges.Admin ) ) )
      throw new Error( 'That post is marked private' );

    const jsons: Array<Promise<IPost>> = [];
    for ( let i = 0, l = instances.length; i < l; i++ )
      jsons.push( instances[ i ].schema.getAsJson<IPost>( instances[ i ]._id, { verbose: Boolean( req.query.verbose ) } ) );

    const sanitizedData = await Promise.all( jsons );

    return {
      message: `Found ${sanitizedData.length} posts`,
      data: sanitizedData[ 0 ]
    } as IGetPosts;
  }

  /**
   * Attempts to remove a post by ID
   */
  @j200()
  private async removePost( req: IAuthReq, res: express.Response ) {
    const posts = this.getModel( 'posts' )!;

    // Attempt to delete the instances
    const numRemoved = await posts.deleteInstances( <IPost>{ _id: new mongodb.ObjectID( req.params.id ) } );

    if ( numRemoved === 0 )
      throw new Error( 'Could not find a post with that ID' );

    return {
      message: 'Post has been successfully removed'
    } as IResponse;
  }

  /**
   * Attempts to update a post by ID
   */
  @j200()
  private async updatePost( req: IAuthReq, res: express.Response ) {
    const token: IPost = req.body;
    const posts = this.getModel( 'posts' )!;

    const instance = await posts.update( <IPost>{ _id: new mongodb.ObjectID( req.params.id ) }, token );

    if ( instance.error )
      throw new Error( <string>instance.tokens[ 0 ].error );

    if ( instance.tokens.length === 0 )
      throw new Error( 'Could not find post with that id' );

    return {
      message: 'Post Updated'
    } as IResponse;
  }

  /**
   * Attempts to create a new post
   */
  @j200()
  private async createPost( req: IAuthReq, res: express.Response ) {
    const token: IPost = req.body;
    const posts = this.getModel( 'posts' )!;

    // User is passed from the authentication function
    token.author = req._user!.username;

    const instance = await posts.createInstance( token );
    const json = await instance.schema.getAsJson( instance._id, { verbose: true } );

    return {
      message: 'New post created',
      data: json
    } as IGetPost;
  }
}