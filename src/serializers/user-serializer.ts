'use strict';

import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { UserPrivileges } from '../core/user';
import ControllerFactory from '../core/controller-factory';
import { ownerRights, adminRights, identifyUser } from '../utils/permission-controllers';
import { Serializer } from './serializer'
import { j200 } from '../utils/response-decorators';
import { UserTokens, IAuthReq, IBaseControler } from 'modepress';
import * as compression from 'compression';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';

/**
 * Main class to use for managing user data
 */
export class UserSerializer extends Serializer {
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
    const user = await ControllerFactory.get( 'users' ).getUser( req.params.username );

    if ( !user )
      throw new Error( 'No user found' );

    const response: UserTokens.GetOne.Response = user.generateCleanedData( Boolean( req.query.verbose ) );
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

    let index: number | undefined = parseInt( req.query.index );
    let limit: number | undefined = parseInt( req.query.limit );
    let query = req.query.search ? new RegExp( req.query.search ) : undefined;
    index = isNaN( index ) ? undefined : index;
    limit = isNaN( limit ) ? undefined : limit;

    const response: UserTokens.GetAll.Response = await ControllerFactory.get( 'users' ).getUsers( index, limit, query, verbose );
    return response;
  }

  /**
   * Sets a user's meta data
 */
  @j200()
  private async setData( req: IAuthReq, res: express.Response ): Promise<UserTokens.PostUserMeta.Response> {
    const user = req._user!;
    let val = req.body && req.body.value;
    if ( !val )
      val = {};

    await ControllerFactory.get( 'users' ).setMeta( user, val );
    return;
  }

  /**
 * Sets a user's meta value
 */
  @j200()
  private async setVal( req: IAuthReq, res: express.Response ): Promise<UserTokens.PostUserMetaVal.Response> {
    const user = req._user!;
    const name = req.params.name;

    await ControllerFactory.get( 'users' ).setMetaVal( user, name, req.body.value );
    return;
  }

  /**
 * Gets a user's meta value
 */
  @j200()
  private async getVal( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    const name = req.params.name;

    const response: UserTokens.GetUserMetaVal.Response = await ControllerFactory.get( 'users' ).getMetaVal( user, name );
    return response;
  }

  /**
 * Gets a user's meta data
 */
  @j200()
  private async getData( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    const response: UserTokens.GetUserMeta.Response = await ControllerFactory.get( 'users' ).getMetaData( user );
    return response;
  }

  /**
	 * Removes a user from the database
	 */
  @j200( 204 )
  private async removeUser( req: IAuthReq, res: express.Response ) {
    const toRemove = req.params.user;
    if ( !toRemove )
      throw new Error( 'No user found' );

    await ControllerFactory.get( 'users' ).removeUser( toRemove );
    return;
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

    const user = await ControllerFactory.get( 'users' ).createUser( token.username!, token.email!, token.password!, true, token.privileges, token.meta );
    const response: UserTokens.Post.Response = user.dbEntry;
    return response;
  }
}