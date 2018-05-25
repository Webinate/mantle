import { IBaseControler } from '../types/misc/i-base-controller';
import { StatTokens } from '../types/tokens/standard-tokens';
import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import ControllerFactory from '../core/controller-factory';
import { UsersController } from '../controllers/users';
import { ownerRights } from '../utils/permission-controllers';
import { Serializer } from './serializer';
import * as compression from 'compression';
import { errJson, j200 } from '../utils/response-decorators';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import { StatsController } from '../controllers/stats';
import { IUserEntry } from '../types/models/i-user-entry';

/**
 * Main class to use for managing users
 */
export class StatsSerializer extends Serializer {
  private _options: IBaseControler;
  private _userController: UsersController;
  private _statController: StatsController;

  /**
	 * Creates an instance of the user manager
	 * @param e The express app
	 * @param The config options of this manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'buckets' ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ) {

    this._userController = ControllerFactory.get( 'users' );
    this._statController = ControllerFactory.get( 'stats' );

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/users/:user/get-stats', <any>[ ownerRights, this.getStats.bind( this ) ] );
    router.post( '/create-stats/:target', <any>[ ownerRights, this.createStats.bind( this ) ] );
    router.put( '/storage-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue.bind( this ), this.updateCalls.bind( this ) ] );
    router.put( '/storage-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue.bind( this ), this.updateMemory.bind( this ) ] );
    router.put( '/storage-allocated-calls/:target/:value', <any>[ ownerRights, this.verifyTargetValue.bind( this ), this.updateAllocatedCalls.bind( this ) ] );
    router.put( '/storage-allocated-memory/:target/:value', <any>[ ownerRights, this.verifyTargetValue.bind( this ), this.updateAllocatedMemory.bind( this ) ] );

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
      const user = await this._userController.getUser( req.params.target );

      if ( !user )
        throw new Error( `Could not find the user '${req.params.target}'` );

      req._target = user.dbEntry as IUserEntry<'server'>;
      next();

    } catch ( err ) {
      return errJson( err, res );
    };
  }

  /**
   * Updates the target user's api calls
   */
  @j200()
  private async updateCalls( req: IAuthReq, res: express.Response ): Promise<StatTokens.PutStorageCalls.Response> {
    const value = parseInt( req.params.value );
    await this._statController.update( req._target!.username! as string, { apiCallsUsed: value } );
  }

  /**
   * Updates the target user's memory usage
   */
  @j200()
  private async updateMemory( req: IAuthReq, res: express.Response ): Promise<StatTokens.PutStorageMemory.Response> {
    const value = parseInt( req.params.value );
    await this._statController.update( req._target!.username! as string, { memoryUsed: value } );
    return;
  }

  /**
   * Updates the target user's allocated api calls
   */
  @j200()
  private async updateAllocatedCalls( req: IAuthReq, res: express.Response ): Promise<StatTokens.PutStorageAlocCalls.Response> {
    const value = parseInt( req.params.value );
    await this._statController.update( req._target!.username! as string, { apiCallsAllocated: value } );
  }

  /**
   * Updates the target user's allocated memory
   */
  @j200()
  private async updateAllocatedMemory( req: IAuthReq, res: express.Response ): Promise<StatTokens.PutStorageAlocMemory.Response> {
    const value = parseInt( req.params.value );
    await this._statController.update( req._target!.username! as string, { memoryAllocated: value } );
  }

  /**
   * Fetches the statistic information for the specified user
   */
  @j200()
  private async getStats( req: IAuthReq, res: express.Response ): Promise<StatTokens.GetOne.Response> {
    const stats = await this._statController.get( req._user!.username as string );
    return stats;
  }

  /**
   * Creates a new user stat entry. This is usually done for you when creating a new user
   */
  @j200()
  private async createStats( req: IAuthReq, res: express.Response ) {
    const stats: StatTokens.Post.Response = await this._statController.createUserStats( req.params.target );
    return stats;
  }
}