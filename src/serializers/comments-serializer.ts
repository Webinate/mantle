import { IAuthReq } from '../types/tokens/i-auth-request';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Serializer } from './serializer';
import { identifyUser, hasId, requireUser } from '../utils/permission-controllers';
import { j200 } from '../utils/response-decorators';
import { UserPrivileges } from '../core/user-privileges';
import { IBaseControler } from '../types/misc/i-base-controller';
import Factory from '../core/model-factory';
import { CommentsController, CommentVisibility } from '../controllers/comments';
import ControllerFactory from '../core/controller-factory';
import { IComment } from '..';

/**
 * A controller that deals with the management of comments
 */
export class CommentsSerializer extends Serializer {
  private _options: IBaseControler;
  private _controller: CommentsController;

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
    this._controller = ControllerFactory.get( 'comments' );
    const router = express.Router();

    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/comments', <any>[ identifyUser, this.getComments.bind( this ) ] );
    router.get( '/comments/:id', <any>[ hasId( 'id', 'ID' ), identifyUser, this.getComment.bind( this ) ] );
    router.get( '/nested-comments/:parentId', <any>[ hasId( 'parentId', 'parent ID' ), identifyUser, this.getComments.bind( this ) ] );
    router.get( '/users/:user/comments', <any>[ identifyUser, this.getComments.bind( this ) ] );
    router.delete( '/comments/:id', <any>[ requireUser, hasId( 'id', 'ID' ), this.remove.bind( this ) ] );
    router.put( '/comments/:id', <any>[ requireUser, hasId( 'id', 'ID' ), this.update.bind( this ) ] );
    router.post( '/posts/:postId/comments/:parent?', <any>[ requireUser, hasId( 'postId', 'parent ID' ), hasId( 'parent', 'Parent ID', true ), this.create.bind( this ) ] );

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
    const user = req._user;
    let visibility: string | undefined;

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

    let depth: number | undefined = parseInt( req.query.depth );
    let index: number | undefined = parseInt( req.query.index );
    let limit: number | undefined = parseInt( req.query.limit );
    if ( isNaN( depth ) )
      depth = undefined;
    if ( isNaN( index ) )
      index = undefined;
    if ( isNaN( limit ) )
      limit = undefined;

    let verbose = false;
    if ( req._isAdmin )
      verbose = true;

    const response = await this._controller.getAll( {
      depth: depth,
      index: index,
      limit: limit,
      expanded: req.query.expanded !== undefined ? req.query.expanded === 'true' : undefined,
      keyword: req.query.keyword,
      root: req.query.root === 'true' ? true : false,
      parentId: req.query.parentId || null,
      postId: req.query.postId,
      visibility: visibility as CommentVisibility,
      verbose,
      sortOrder: req.query.sortOrder,
      sortType: req.query.sortType,
      user: req.params.user || req.query.user
    } );

    return response;
  }

  /**
   * Returns a single comment
   */
  @j200()
  private async getComment( req: IAuthReq, res: express.Response ) {

    const user = req._user;

    let depth: number | undefined = parseInt( req.query.depth );
    if ( isNaN( depth ) )
      depth = undefined;

    let verbose = false;
    if ( req._isAdmin )
      verbose = true;

    const comment = await this._controller.getOne( req.params.id, {
      depth: depth,
      expanded: req.query.expanded !== undefined ? req.query.expanded === 'true' : undefined,
      verbose,
    } );

    // Only admins are allowed to see private comments
    if ( !comment.public && ( !user || user.privileges! >= UserPrivileges.Admin ) )
      throw new Error( 'That comment is marked private' );

    return comment;
  }

  /**
   * Attempts to remove a comment by ID
   */
  @j200( 204 )
  private async remove( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    const comment = await this._controller.getOne( req.params.id );

    // Only admins are allowed to see private comments
    if ( user.privileges > UserPrivileges.Admin && user.username !== comment.author )
      throw new Error( 'You do not have permission' );

    await this._controller.remove( req.params.id );
  }

  /**
   * Attempts to update a comment by ID
   */
  @j200()
  private async update( req: IAuthReq, res: express.Response ) {
    const token: Partial<IComment<'client'>> = req.body;
    const user = req._user!;
    let comment = await this._controller.getOne( req.params.id );

    // Only admins are allowed to see private comments
    if ( user.privileges > UserPrivileges.Admin && user.username !== comment.author )
      throw new Error( 'You do not have permission' );

    comment = await this._controller.update( req.params.id, token );
    return comment;
  }

  /**
   * Attempts to create a new comment
   */
  @j200()
  private async create( req: IAuthReq, res: express.Response ) {
    const token: Partial<IComment<'client'>> = req.body;

    // User is passed from the authentication function
    token.user = req._user!._id.toString();
    token.author = req._user!.username as string;
    token.post = req.params.postId as string;
    token.parent = req.params.parent;

    const response = await this._controller.create( token );
    return response;
  }
}