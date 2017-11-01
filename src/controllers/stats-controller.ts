'use strict';
import { StatTokens, IAuthReq, IStorageStats, IBaseControler } from 'modepress';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { UserManager } from '../core/user-manager';
import { ownerRights } from '../utils/permission-controllers';
import { Controller } from './controller'
import { BucketManager } from '../core/bucket-manager';
import * as compression from 'compression';
import { okJson, errJson } from '../utils/serializers';
import * as mongodb from 'mongodb';
import Factory from '../core/controller-factory';

/**
 * Main class to use for managing users
 */
export class StatsController extends Controller {
  private _allowedFileTypes: Array<string>;
  private _options: IBaseControler;

  /**
	 * Creates an instance of the user manager
	 * @param e The express app
	 * @param The config options of this manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'bucket' ) ] );
    this._allowedFileTypes = [ 'image/bmp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff', 'text/plain', 'text/json', 'application/octet-stream' ];
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

    router.get( '/users/:user/get-stats', <any>[ ownerRights, this.getStats.bind( this ) ] );
    router.post( '/create-stats/:target', <any>[ ownerRights, this.createStats.bind( this ) ] );
    router.put( '/storage-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateCalls.bind( this ) ] );
    router.put( '/storage-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateMemory.bind( this ) ] );
    router.put( '/storage-allocated-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateAllocatedCalls.bind( this ) ] );
    router.put( '/storage-allocated-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue, this.updateAllocatedMemory.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + `/stats`, router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Makes sure the target user exists and the numeric value specified is valid
   */
  private async verifyTargetValue( req: IAuthReq, res: express.Response, next: Function ) {
    try {
      // Set the content type
      const value = parseInt( req.params.value );

      if ( !req.params.target || req.params.target.trim() === '' )
        throw new Error( 'Please specify a valid user to target' );

      if ( !req.params.value || req.params.value.trim() === '' || isNaN( value ) )
        throw new Error( 'Please specify a valid value' );

      // Make sure the user exists
      const user = await UserManager.get.getUser( req.params.target );

      if ( !user )
        throw new Error( `Could not find the user '${req.params.target}'` );

      req._target = user.dbEntry;
      next();

    } catch ( err ) {
      return errJson( err, res );
    };
  }

  /**
   * Updates the target user's api calls
   */
  private async updateCalls( req: IAuthReq, res: express.Response ) {
    try {
      const value = parseInt( req.params.value );
      const manager = BucketManager.get;
      await manager.updateStorage( req._target!.username!, <IStorageStats>{ apiCallsUsed: value } );
      okJson<StatTokens.PutStorageCalls.Response>( { message: `Updated the user API calls to [${value}]` }, res );

    } catch ( err ) {
      return errJson( err, res );
    };
  }

  /**
   * Updates the target user's memory usage
   */
  private async updateMemory( req: IAuthReq, res: express.Response ) {
    try {
      const value = parseInt( req.params.value );
      const manager = BucketManager.get;
      await manager.updateStorage( req._target!.username!, <IStorageStats>{ memoryUsed: value } );

      okJson<StatTokens.PutStorageMemory.Response>( { message: `Updated the user memory to [${value}] bytes` }, res );

    } catch ( err ) {
      return errJson( err, res );
    };
  }

  /**
   * Updates the target user's allocated api calls
   */
  private async updateAllocatedCalls( req: IAuthReq, res: express.Response ) {
    try {
      const value = parseInt( req.params.value );
      const manager = BucketManager.get;
      await manager.updateStorage( req._target!.username!, <IStorageStats>{ apiCallsAllocated: value } );
      okJson<StatTokens.PutStorageAlocCalls.Response>( { message: `Updated the user API calls to [${value}]` }, res );

    } catch ( err ) {
      return errJson( err, res );
    };
  }

  /**
   * Updates the target user's allocated memory
   */
  private async updateAllocatedMemory( req: IAuthReq, res: express.Response ) {
    try {
      const value = parseInt( req.params.value );
      const manager = BucketManager.get;
      await manager.updateStorage( req._target!.username!, <IStorageStats>{ memoryAllocated: value } );
      okJson<StatTokens.PutStorageAlocMemory.Response>( { message: `Updated the user memory to [${value}] bytes` }, res );

    } catch ( err ) {
      return errJson( err, res );
    };
  }

  /**
   * Fetches the statistic information for the specified user
   */
  private async getStats( req: IAuthReq, res: express.Response ) {
    try {
      const manager = BucketManager.get;
      const stats = await manager.getUserStats( req._user!.username );

      return okJson<StatTokens.GetOne.Response>( {
        data: stats
      }, res );

    } catch ( err ) {
      return errJson( err, res );
    };
  }

  /**
   * Creates a new user stat entry. This is usually done for you when creating a new user
   */
  private async createStats( req: IAuthReq, res: express.Response ) {
    try {
      const manager = BucketManager.get;
      const stats = await manager.createUserStats( req.params.target );
      res.setHeader( 'Content-Type', 'application/json' );
      res.end( JSON.stringify( stats ) );
    } catch ( err ) {
      return errJson( err, res );
    };
  }
}