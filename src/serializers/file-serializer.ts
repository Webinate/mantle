import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { Serializer } from './serializer'
import ControllerFactory from '../core/controller-factory';
import * as compression from 'compression';
import { j200 } from '../decorators/responses';
import { authorize } from '../decorators/permissions';
import { IFileOptions } from '../types/misc/i-file-options';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import { FilesController } from '../controllers/files';
import { IFileEntry } from '../types/models/i-file-entry';
import { Error403 } from '../utils/errors';

/**
 * Main class to use for managing users
 */
export class FileSerializer extends Serializer {
  private _options: IFileOptions;
  private _files: FilesController;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IFileOptions ) {
    super( [ Factory.get( 'files' ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ) {
    this._files = ControllerFactory.get( 'files' );

    // Setup the rest calls
    const router = express.Router();
    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/volumes/:volume', this.getFiles.bind( this ) );
    router.delete( '/:file', this.remove.bind( this ) );
    router.put( '/:file', this.update.bind( this ) );
    router.post( '/volumes/:volume/upload/:directory?', this.upload.bind( this ) );
    router.post( '/replace/:fileId', this.replace.bind( this ) );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + `/files`, router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Removes a file specified in the URL
   */
  @j200( 204 )
  @authorize()
  private async remove( req: IAuthReq, res: express.Response ) {
    await this._files.removeFiles( { fileId: req.params.file, user: req._isAdmin ? undefined : req._user!.username as string } );
  }

  /**
   * Renames a file
   */
  @j200()
  @authorize()
  private async update( req: IAuthReq, res: express.Response ) {
    const file = req.body as IFileEntry<'client'>;

    if ( !req._isAdmin && file.user )
      throw new Error403( 'Permission denied - cannot set user as non-admin' );

    delete file.size;
    delete file.numDownloads;
    delete file.mimeType;
    delete file.publicURL;
    delete file.identifier;

    return await this._files.update( req.params.file, file );
  }

  /**
   * Fetches all file entries from the database. Optionally specifying the volume to fetch from.
   */
  @j200()
  @authorize()
  private async getFiles( req: IAuthReq, res: express.Response ) {
    let index: number | undefined = parseInt( req.query.index );
    let limit: number | undefined = parseInt( req.query.limit );
    index = isNaN( index ) ? undefined : index;
    limit = isNaN( limit ) ? undefined : limit;

    if ( !req.params.volume || req.params.volume.trim() === '' )
      throw new Error( 'Please specify a valid volume name' );

    const page = await this._files.getFiles( {
      volumeId: req.params.volume,
      index: index,
      limit: limit,
      sort: req.query.sort ? req.query.sort.toLowerCase() : undefined,
      sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
      user: req._isAdmin ? undefined : req._user!.username as string,
      search: req.query.search ? new RegExp( req.query.search, 'i' ) : undefined
    } );

    return page;
  }

  @j200()
  @authorize()
  private async upload( req: IAuthReq ) {
    const volumeId = req.params.volume;

    if ( !mongodb.ObjectID.isValid( volumeId ) )
      throw new Error( `Incorrect volume id format` );

    return this._files.uploadFilesToVolume( req, volumeId, req._user!._id.toString() );
  }

  @j200()
  @authorize()
  private async replace( req: IAuthReq ) {
    const fileId = req.params.fileId;

    if ( !mongodb.ObjectID.isValid( fileId ) )
      throw new Error( `Incorrect file id format` );

    return this._files.replaceFileContent( req, fileId, req._user!._id.toString() );
  }
}