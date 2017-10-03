import { IAuthReq, IComment, IModelEntry, CommentTokens } from 'modepress';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Controller } from './controller';
import { Schema } from '../models/schema';
import { Model } from '../models/model';
import { identifyUser, adminRights, canEdit, hasId } from '../utils/permission-controllers';
import { j200 } from '../utils/serializers';
import { UserPrivileges } from '../core/user';
import { IBaseControler } from 'modepress';
import Factory from '../core/controller-factory';

/**
 * A controller that deals with the management of comments
 */
export class CommentsController extends Controller {
  private _options: IBaseControler;

  /**
	 * Creates a new instance of the controller
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'comments' ) ] );
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

    router.get( '/comments', <any>[ adminRights, this.getComments.bind( this ) ] );
    router.get( '/comments/:id', <any>[ hasId( 'id', 'ID' ), identifyUser, this.getComment.bind( this ) ] );
    router.get( '/nested-comments/:parentId', <any>[ hasId( 'parentId', 'parent ID' ), identifyUser, this.getComments.bind( this ) ] );
    router.get( '/users/:user/comments', <any>[ identifyUser, this.getComments.bind( this ) ] );
    router.delete( '/comments/:id', <any>[ identifyUser, hasId( 'id', 'ID' ), this.remove.bind( this ) ] );
    router.put( '/comments/:id', <any>[ identifyUser, hasId( 'id', 'ID' ), this.update.bind( this ) ] );
    router.post( '/posts/:postId/comments/:parent?', <any>[ canEdit, hasId( 'postId', 'parent ID' ), hasId( 'parent', 'Parent ID', true ), this.create.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/', router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Returns an array of IComment items
   */
  @j200()
  private async getComments( req: IAuthReq, res: express.Response ) {
    const comments = this.getModel( 'comments' )! as Model<IComment>;
    let count = 0;
    const user = req._user;
    const findToken = { $or: [] as IComment[] };
    let visibility: string | undefined;

    // Set the parent filter
    if ( req.query.parentId )
      ( <IComment>findToken ).parent = req.query.parentId;

    // Set the user property if its provided
    if ( req.query.user )
      ( <IComment>findToken ).author = <any>new RegExp( req.query.user, 'i' );

    // Check for keywords
    if ( req.query.keyword )
      findToken.$or.push( <IComment>{ content: <any>new RegExp( req.query.keyword, 'i' ) } );

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
      ( <IComment>findToken ).public = visibility === 'public' ? true : false;

    // Set the default sort order to ascending
    let sortOrder = -1;
    if ( req.query.sortOrder ) {
      if ( ( <string>req.query.sortOrder ).toLowerCase() === 'asc' )
        sortOrder = 1;
      else
        sortOrder = -1;
    }

    // Sort by the date created
    let sort: IComment = { createdOn: sortOrder };

    // Optionally sort by the last updated
    if ( req.query.sort ) {
      if ( req.query.sort === 'updated' )
        sort = { lastUpdated: sortOrder };
    }

    if ( findToken.$or.length === 0 )
      delete findToken.$or;

    // First get the count
    count = await comments.count( findToken );

    let index: number | undefined;
    let limit: number | undefined;
    if ( req.query.index !== undefined )
      index = parseInt( req.query.index );
    if ( req.query.limit !== undefined )
      limit = parseInt( req.query.limit );

    const schemas = await comments.findInstances( { selector: findToken, sort: sort, index: index, limit: limit } );

    const jsons: Array<Promise<IComment>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( {
        verbose: Boolean( req.query.verbose ),
        expandForeignKeys: Boolean( req.query.expanded ),
        expandMaxDepth: parseInt( req.query.depth || 1 ),
        expandSchemaBlacklist: [ 'parent' ]
      } ) );

    const sanitizedData = await Promise.all( jsons );

    return {
      count: count,
      message: `Found ${count} comments`,
      data: sanitizedData
    } as CommentTokens.GetAll.Response;
  }

  /**
   * Returns a single comment
   */
  @j200()
  private async getComment( req: IAuthReq, res: express.Response ) {
    const comments = this.getModel( 'comments' )! as Model<IComment>;
    const findToken: IComment = { _id: new mongodb.ObjectID( req.params.id ) };
    const user = req._user;

    const schemas = await comments.findInstances( { selector: findToken, index: 0, limit: 1 } );

    if ( schemas.length === 0 )
      throw new Error( 'Could not find comment' );

    const isPublic = await schemas[ 0 ].getByName( 'public' )!.getValue()

    // Only admins are allowed to see private comments
    if ( !isPublic && ( !user || user.privileges! >= UserPrivileges.Admin ) )
      throw new Error( 'That comment is marked private' );

    const jsons: Array<Promise<IComment>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( {
        verbose: Boolean( req.query.verbose ),
        expandForeignKeys: Boolean( req.query.expanded ),
        expandMaxDepth: parseInt( req.query.depth || 1 ),
        expandSchemaBlacklist: [ 'parent' ]
      } ) );

    const sanitizedData = await Promise.all( jsons );

    return {
      message: `Found ${sanitizedData.length} comments`,
      data: sanitizedData[ 0 ]
    } as CommentTokens.GetOne.Response;
  }

  /**
   * Attempts to remove a comment by ID
   */
  @j200()
  private async remove( req: IAuthReq, res: express.Response ) {
    const comments = this.getModel( 'comments' )! as Model<IComment>;
    const findToken: IComment = {
      _id: new mongodb.ObjectID( req.params.id )
    }
    const user = req._user;
    const schemas = await comments.findInstances( { selector: findToken, index: 0, limit: 1 } );

    if ( schemas.length === 0 )
      throw new Error( 'Could not find a comment with that ID' );
    else {
      const author = await schemas[ 0 ].getByName( 'author' )!.getValue();

      // Only admins are allowed to see private comments
      if ( !user || ( user.privileges! < UserPrivileges.Admin && user.username !== author ) )
        throw new Error( 'You do not have permission' );
    }

    // Attempt to delete the instances
    await comments.deleteInstances( findToken );
    return { message: 'Comment has been successfully removed' } as CommentTokens.DeleteOne.Response;
  }

  /**
   * Attempts to update a comment by ID
   */
  @j200()
  private async update( req: IAuthReq, res: express.Response ) {
    const token: CommentTokens.PutOne.Body = req.body;
    const comments = this.getModel( 'comments' )! as Model<IComment>;
    const findToken: IComment = {
      _id: new mongodb.ObjectID( req.params.id )
    }

    const user = req._user;
    const schemas = await comments.findInstances( { selector: findToken, index: 0, limit: 1 } );

    if ( schemas.length === 0 )
      throw new Error( 'Could not find comment with that id' );
    else {
      const author = await schemas[ 0 ].getByName( 'author' )!.getValue();

      // Only admins are allowed to see private comments
      if ( !user || ( user.privileges! < UserPrivileges.Admin && user.username !== author ) )
        throw new Error( 'You do not have permission' );
    }

    const instance = await comments.update( findToken, token );

    if ( instance.error )
      throw new Error( <string>instance.tokens[ 0 ].error );

    return { message: 'Comment Updated' } as CommentTokens.PutOne.Response
  }

  /**
   * Attempts to create a new comment
   */
  @j200()
  private async create( req: IAuthReq, res: express.Response ) {
    const token: CommentTokens.Post.Body = req.body;
    const comments = this.getModel( 'comments' )! as Model<IComment>;

    // User is passed from the authentication function
    token.author = req._user!.username;
    token.post = req.params.postId;
    token.parent = req.params.parent;
    let parent: Schema<IComment> | null = null;


    if ( token.parent ) {
      parent = await comments.findOne( <IModelEntry>{ _id: new mongodb.ObjectID( token.parent ) } );
      if ( !parent )
        throw new Error( `No comment exists with the id ${token.parent}` );
    }

    const instance = await comments.createInstance( token );
    const json = await instance.getAsJson( { verbose: true } );


    // Assign this comment as a child to its parent comment if it exists
    if ( parent ) {
      const children: Array<string | mongodb.ObjectID> = parent.getByName( 'children' )!.value;
      children.push( instance.dbEntry._id );
      await comments.update( { _id: parent.dbEntry._id }, { children: children } )
    }

    return { message: 'New comment created', data: json } as CommentTokens.Post.Response;
  }
}