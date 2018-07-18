import { FileTokens } from '../types/tokens/standard-tokens';
import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require( 'express' );
import bodyParser = require( 'body-parser' );
import { ownerRights, requireUser } from '../utils/permission-controllers';
import { Serializer } from './serializer'
import ControllerFactory from '../core/controller-factory';
import * as compression from 'compression';
import { j200 } from '../utils/response-decorators';
import { IFileOptions } from '../types/misc/i-file-options';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import { FilesController } from '../controllers/files';
import { unlink, exists } from 'fs';
import { IncomingForm, Fields, File, Part } from 'formidable';
import * as winston from 'winston';
import { VolumesController } from '../controllers/volumes';
import { IUploadResponse } from '..';

/**
 * Main class to use for managing users
 */
export class FileSerializer extends Serializer {
  private _options: IFileOptions;
  private _files: FilesController;
  private _allowedFileTypes: Array<string>;
  private _volumeController: VolumesController;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( options: IFileOptions ) {
    super( [ Factory.get( 'files' ) ] );
    this._options = options;
    this._allowedFileTypes = [ 'image/bmp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff', 'text/plain', 'text/json', 'application/octet-stream' ];
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

    router.get( '/users/:user/volumes/:volume', <any>[ ownerRights, this.getFiles.bind( this ) ] );
    router.delete( '/:file', <any>[ requireUser, this.remove.bind( this ) ] );
    router.put( '/:file', <any>[ requireUser, this.update.bind( this ) ] );
    router.post( '/users/:user/volumes/:volume/upload/:directory?', <any>[ ownerRights, this.upload.bind( this ) ] );

    this._volumeController = ControllerFactory.get( 'volumes' );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + `/files`, router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Removes a file specified in the URL
   */
  @j200( 204 )
  private async remove( req: IAuthReq, res: express.Response ) {
    await this._files.removeFiles( { fileId: req.params.file, user: req._user!.username as string } );
  }

  /**
   * Renames a file
   */
  @j200()
  private async update( req: IAuthReq, res: express.Response ) {
    const file = req.body as FileTokens.Put.Body;
    const updatedFile: FileTokens.Put.Response = await this._files.update( req.params.file, file );
    return updatedFile;
  }

  /**
   * Fetches all file entries from the database. Optionally specifying the volume to fetch from.
   */
  @j200()
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
      user: req.params.user,
      searchTerm: req.query.search ? new RegExp( req.query.search, 'i' ) : undefined
    } );

    const resp: FileTokens.GetAll.Response = page;
    return resp;
  }

  private removeFiles( files: File[] ) {
    files.forEach( file => {
      exists( file.path, function( exists ) {
        if ( exists ) {
          unlink( file.path, function( err ) {
            if ( err )
              winston.error( err.message );
          } );
        }
      } );
    } );
  }

  private processUploadRequest( req: IAuthReq ) {
    return new Promise<{ fields: Fields, files: File[] }>( ( resolve, reject ) => {
      const form = new IncomingForm();
      const filesArr: File[] = [];
      let fieldsToRet: Fields;
      let error: Error | null = null;

      form.encoding = 'utf-8';
      form.keepExtensions = true;
      form.maxFields = 1000; // Max number of allowed fields
      form.maxFieldsSize = 20 * 1024 * 1024; // Max size allowed for fields
      form.maxFileSize = 0.5 * 1024 * 1024; // Max size allowed for files
      form.multiples = false;
      form.uploadDir = './temp';


      form.onPart = ( part: Part ) => {
        if ( part.mime ) {
          const allowedTypes = this._allowedFileTypes;
          const extension = part.mime.toLowerCase();

          if ( allowedTypes.indexOf( extension ) !== -1 )
            form.handlePart( part );
          else
            error = new Error( `Extension ${extension} not supported` );
        }
        else {
          form.handlePart( part );
        }
      }

      form.parse( req, ( err, fields, files ) => {

        if ( err ) {
          // Not sure why - but we need to have a timeout here as without it we get
          // an error write write ECONNABORTED
          setTimeout( () => reject( err ), 500 );
          return
        }

        fieldsToRet = fields;
        for ( const key in files )
          filesArr.push( files[ key ] );
      } );

      form.on( 'end', () => {
        if ( error ) {
          this.removeFiles( filesArr );
          return reject( error );
        }
        else {
          // TODO: Remove this line
          this.removeFiles( filesArr );
          return resolve( { fields: fieldsToRet, files: filesArr } );
        }
      } )
    } );
  }

  @j200()
  private async upload( req: IAuthReq ) {
    const volumeName = req.params.volume;
    const username = req._user!.username as string;

    if ( !volumeName || volumeName.trim() === '' )
      throw new Error( `Please specify a volume for the upload` );

    const volume = await this._volumeController.get( { name: volumeName, user: username } );
    if ( !volume )
      throw new Error( `Volume does not exist` );


    const response = await this.processUploadRequest( req );
    const files = response.files.map( f => {
      return {
        size: f.size,
        path: f.path,
        name: f.name,
        type: f.type,
      }
    } );

    const toRet: IUploadResponse = { files: files };
    return toRet;
  }
}