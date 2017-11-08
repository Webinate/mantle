import { IAuthReq, IPost, IUserEntry, PostTokens } from 'modepress';

import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Controller } from './controller';
import { identifyUser, adminRights, hasId } from '../utils/permission-controllers';
import { j200 } from '../utils/serializers';
import { UserPrivileges } from '../core/user';
import { Model } from '../models/model';
import { IBaseControler } from 'modepress';
import Factory from '../core/model-factory';

/**
 * A controller that deals with the management of posts
 */
export class PostsController extends Controller {

  private _options: IBaseControler;

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
    e.use( ( this._options.rootPath || '' ) + '/posts', router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Returns an array of IPost items
   */
  @j200()
  private async getPosts( req: IAuthReq, res: express.Response ) {
    const posts = this.getModel( 'posts' ) as Model<IPost>;
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

    let index: number = 0;
    let limit: number = 10;
    if ( req.query.index !== undefined )
      index = parseInt( req.query.index );
    if ( req.query.limit !== undefined )
      limit = parseInt( req.query.limit );

    const schemas = await posts!.findInstances( {
      selector: findToken,
      sort: sort,
      index: index,
      limit: limit,
      projection: ( getContent === false ? { content: 0 } : undefined )
    } );

    const jsons: Array<Promise<IPost>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( { verbose: Boolean( req.query.verbose ) } ) );

    const sanitizedData = await Promise.all( jsons );

    const response: PostTokens.GetAll.Response = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit
    };
    return response;
  }

  /**
   * Returns a single post
   */
  @j200()
  private async getPost( req: IAuthReq, res: express.Response ) {
    const posts = this.getModel( 'posts' ) as Model<IPost>;
    let findToken: IPost;
    const user: IUserEntry = req._user!;

    if ( req.params.id )
      findToken = { _id: new mongodb.ObjectID( req.params.id ) };
    else
      findToken = { slug: req.params.slug };

    const schemas = await posts!.findInstances( { selector: findToken, index: 0, limit: 1 } );

    if ( schemas.length === 0 )
      throw new Error( 'Could not find post' );


    const isPublic = await schemas[ 0 ].getByName( 'public' )!.getValue();
    // Only admins are allowed to see private posts
    if ( !isPublic && ( !user || ( user && user.privileges! > UserPrivileges.Admin ) ) )
      throw new Error( 'That post is marked private' );

    const jsons: Array<Promise<IPost>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( { verbose: Boolean( req.query.verbose ) } ) );

    const sanitizedData = await Promise.all( jsons );

    const response: PostTokens.GetOne.Response = sanitizedData[ 0 ];
    return response;
  }

  /**
   * Attempts to remove a post by ID
   */
  @j200( 204 )
  private async removePost( req: IAuthReq, res: express.Response ) {
    const posts = this.getModel( 'posts' )!;

    // Attempt to delete the instances
    const numRemoved = await posts.deleteInstances( <IPost>{ _id: new mongodb.ObjectID( req.params.id ) } );

    if ( numRemoved === 0 )
      throw new Error( 'Could not find a post with that ID' );

    return;
  }

  /**
   * Attempts to update a post by ID
   */
  @j200()
  private async updatePost( req: IAuthReq, res: express.Response ) {
    const token: PostTokens.Post.Body = req.body;
    const posts = this.getModel( 'posts' )!;

    const schema = await posts.update( <IPost>{ _id: new mongodb.ObjectID( req.params.id ) }, token );

    if ( schema.error )
      throw new Error( <string>schema.tokens[ 0 ].error );

    if ( schema.tokens.length === 0 )
      throw new Error( 'Could not find post with that id' );

    const response: PostTokens.PutOne.Response = {
      message: 'Post Updated'
    };

    return response;
  }

  /**
   * Attempts to create a new post
   */
  @j200()
  private async createPost( req: IAuthReq, res: express.Response ) {
    const token: PostTokens.Post.Body = req.body;
    const posts = this.getModel( 'posts' )!;

    // User is passed from the authentication function
    token.author = req._user!.username;

    const schema = await posts.createInstance( token );
    const json = await schema.getAsJson( { verbose: true } );

    const response: PostTokens.Post.Response = {
      message: 'New post created',
      data: json
    } as PostTokens.Post.Response;

    return response;
  }
}