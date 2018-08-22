import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import * as mongodb from 'mongodb';
import ControllerFactory from '../core/controller-factory';
import { VolumesController } from '../controllers/volumes';
import { requireUser, adminRights, hasId } from '../utils/permission-controllers';
import { Serializer } from './serializer';
import * as compression from 'compression';
import { j200 } from '../utils/response-decorators';
import { IBaseControler } from '../types/misc/i-base-controller';
import Factory from '../core/model-factory';
import { IVolume } from '../types/models/i-volume-entry';
import { Error403 } from '../utils/errors';

/**
 * Main class to use for managing users
 */
export class VolumeSerializer extends Serializer {

  private _options: IBaseControler;
  private _volumeController: VolumesController;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'volumes' ) ] );
    this._options = options;
  }

  /**
 * Called to initialize this controller and its related database objects
 */
  async initialize( e: express.Express, db: mongodb.Db ) {

    this._volumeController = ControllerFactory.get( 'volumes' );

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', <any>[ requireUser, this.getVolumes.bind( this ) ] );
    router.get( '/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.getOne.bind( this ) ] );
    router.put( '/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.update.bind( this ) ] );
    router.delete( '/:id', <any>[ requireUser, this.removeVolumes.bind( this ) ] );
    router.post( '/', <any>[ requireUser, this.createVolume.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + `/volumes`, router );

    await super.initialize( e, db );
    return this;
  }

  @j200()
  private async getOne( req: IAuthReq, res: express.Response ) {
    const volume = await this._volumeController.get( { id: req.params.id } );

    if ( !volume )
      throw new Error( 'Volume does not exist' );

    return volume;
  }

  /**
   * Attempts to update a volume by ID
   */
  @j200()
  private async update( req: IAuthReq, res: express.Response ) {
    const token: IVolume<'client'> = req.body;

    if ( token.memoryAllocated !== undefined && !req._isAdmin )
      throw new Error403( `You don't have permission to set the memoryAllocated` );
    if ( token.memoryUsed !== undefined && !req._isAdmin )
      throw new Error403( `You don't have permission to set the memoryUsed` );

    const vol = await this._volumeController.update( req.params.id, token );
    return vol;
  }

  /**
   * Removes volumes specified in the URL
   */
  @j200( 204 )
  private async removeVolumes( req: IAuthReq, res: express.Response ) {
    await this._volumeController.remove( { _id: req.params.id as string } );
    return;
  }

  /**
   * Fetches all volume entries from the database
   */
  @j200()
  private async getVolumes( req: IAuthReq, res: express.Response ) {
    const user = req._user!;
    const manager = this._volumeController;
    let searchTerm: RegExp | undefined;

    // Check for keywords
    if ( req.query.search )
      searchTerm = new RegExp( req.query.search, 'i' );

    let index: number | undefined = parseInt( req.query.index );
    let limit: number | undefined = parseInt( req.query.limit );
    let username: string | undefined = req.query.username;
    index = isNaN( index ) ? undefined : index;
    limit = isNaN( limit ) ? undefined : limit;

    if ( req._isAdmin === false && username !== undefined )
      throw new Error403();

    const toRet = await manager.getMany( {
      user: username || user,
      searchTerm: searchTerm,
      sort: req.query.sort ? req.query.sort.toLowerCase() : undefined,
      sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
      index: index,
      limit: limit
    } );

    return toRet;
  }

  /**
   * Creates a new user volume based on the target provided
   */
  @j200()
  private async createVolume( req: IAuthReq, res: express.Response ) {
    const token: IVolume<'client'> = req.body;
    const manager = this._volumeController;

    if ( !token.user )
      token.user = req._user!._id.toString();
    else if ( !req._isAdmin )
      throw new Error403();

    if ( token.memoryAllocated !== undefined && !req._isAdmin )
      throw new Error403( `You don't have permission to set the memoryAllocated` );
    if ( token.memoryUsed !== undefined && !req._isAdmin )
      throw new Error403( `You don't have permission to set the memoryUsed` );

    const entry = await manager.create( token ) as IVolume<'client'>;
    return entry;
  }
}