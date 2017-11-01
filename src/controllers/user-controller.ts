'use strict';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { UserPrivileges } from '../core/user';
import { UserManager } from '../core/user-manager';
import { ownerRights, adminRights, identifyUser } from '../utils/permission-controllers';
import { Controller } from './controller'
import { j200 } from '../utils/serializers';
import { UserTokens, IAuthReq, IUserEntry, IBaseControler } from 'modepress';
import * as compression from 'compression';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';

/**
 * Main class to use for managing user data
 */
export class UserController extends Controller {
  private _options: IBaseControler;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'users' ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ) {

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', <any>[ identifyUser, this.getUsers.bind( this ) ] );
    router.post( '/', <any>[ adminRights, this.createUser.bind( this ) ] );
    router.get( '/:user/meta', <any>[ ownerRights, this.getData.bind( this ) ] );
    router.get( '/:user/meta/:name', <any>[ ownerRights, this.getVal.bind( this ) ] );
    router.get( '/:username', <any>[ ownerRights, this.getUser.bind( this ) ] );
    router.delete( '/:user', <any>[ ownerRights, this.removeUser.bind( this ) ] );
    router.post( '/:user/meta/:name', <any>[ adminRights, this.setVal.bind( this ) ] );
    router.post( '/:user/meta', <any>[ adminRights, this.setData.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/users', router );

    await super.initialize( e, db );
    return this;
  }

  /**
 * Gets a specific user by username or email - the 'username' parameter must be set. Some of the user data will be obscured unless the verbose parameter
   * is specified. Specify the verbose=true parameter in order to get all user data.
 */
  @j200()
  private async getUser( req: IAuthReq, res: express.Response ) {

    const user = await UserManager.get.getUser( req.params.username );

    if ( !user )
      throw new Error( 'No user found' );

    const response: UserTokens.GetOne.Response = {
      data: user.generateCleanedData( Boolean( req.query.verbose ) )
    };

    return response;
  }

  /**
 * Gets a list of users. You can limit the haul by specifying the 'index' and 'limit' query parameters.
   * Also specify the verbose=true parameter in order to get all user data. You can also filter usernames with the
   * search query
 */
  @j200()
  private async getUsers( req: IAuthReq, res: express.Response ) {
    let verbose = Boolean( req.query.verbose );

    // Only admins are allowed to see sensitive data
    if ( req._user && req._user.privileges === UserPrivileges.SuperAdmin && verbose )
      verbose = true;
    else
      verbose = false;

    const index = parseInt( req.query.index );
    const limit = parseInt( req.query.limit );

    const totalNumUsers = await UserManager.get.numUsers( new RegExp( req.query.search ) );
    const users = await UserManager.get.getUsers( index, limit, new RegExp( req.query.search ) );
    const sanitizedData: IUserEntry[] = [];

    for ( let i = 0, l = users.length; i < l; i++ )
      sanitizedData.push( users[ i ].generateCleanedData( verbose ) );

    const response: UserTokens.GetAll.Response = {
      data: sanitizedData,
      count: totalNumUsers,
      index: index,
      limit: limit
    };

    return response;
  }

  /**
   * Sets a user's meta data
 */
  @j200()
  private async setData( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    let val = req.body && req.body.value;
    if ( !val )
      val = {};

    await UserManager.get.setMeta( user, val );
    const response: UserTokens.PostUserMeta.Response = { message: `User's data has been updated` };
    return response;
  }

  /**
 * Sets a user's meta value
 */
  @j200()
  private async setVal( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    const name = req.params.name;

    await UserManager.get.setMetaVal( user, name, req.body.value );
    const response: UserTokens.PostUserMetaVal.Response = { message: `Value '${name}' has been updated` };
    return response;
  }

  /**
 * Gets a user's meta value
 */
  @j200()
  private async getVal( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    const name = req.params.name;

    const response: UserTokens.GetUserMetaVal.Response = await UserManager.get.getMetaVal( user, name );
    return response;
  }

  /**
 * Gets a user's meta data
 */
  @j200()
  private async getData( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    const response: UserTokens.GetUserMeta.Response = await UserManager.get.getMetaData( user );
    return response;
  }

  /**
	 * Removes a user from the database
	 */
  @j200()
  private async removeUser( req: IAuthReq, res: express.Response ) {
    const toRemove = req.params.user;
    if ( !toRemove )
      throw new Error( 'No user found' );

    await UserManager.get.removeUser( toRemove );
    const response: UserTokens.DeleteOne.Response = { message: `User ${toRemove} has been removed` };
    return response;
  }

  /**
	 * Allows an admin to create a new user without registration
	 */
  @j200()
  private async createUser( req: express.Request, res: express.Response ) {
    const token: UserTokens.Post.Body = req.body;
    token.privileges = token.privileges ? token.privileges : UserPrivileges.Regular;

    // Not allowed to create super users
    if ( token.privileges === UserPrivileges.SuperAdmin )
      throw new Error( 'You cannot create a user with super admin permissions' );

    const user = await UserManager.get.createUser( token.username!, token.email!, token.password!, true, token.privileges, token.meta );
    const response: UserTokens.Post.Response = {
      data: user.dbEntry
    };
    return response;
  }
}