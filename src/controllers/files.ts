import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IFileEntry } from '../types/models/i-file-entry';
import { IVolume } from '../types/models/i-volume-entry';
import { Db, ObjectID } from 'mongodb';
import RemoteFactory from '../core/remotes/remote-factory';
import Controller from './controller';
import { FileModel } from '../models/file-model';
import ModelFactory from '../core/model-factory';
import { isValidObjectID } from '../utils/utils';
import { VolumeModel } from '../models/volume-model';
import ControllerFactory from '../core/controller-factory';
import { IAuthReq } from '../types/tokens/i-auth-request';
import { unlink, exists } from 'fs';
import * as path from 'path';
import { IncomingForm, Fields, File, Part } from 'formidable';
import * as winston from 'winston';
import { Error404, Error500 } from '../utils/errors';
import { UsersController } from './users';
import { IUploadToken } from '../types/interfaces/i-remote';

export type FilesGetOptions = {
  volumeId?: string | ObjectID;
  user?: string;
  index?: number;
  limit?: number;
  search?: string | RegExp;
  verbose?: boolean;
  sort?: 'created' | 'name' | 'memory';
  sortOrder?: 'asc' | 'desc';
}

export type DeleteOptions = {
  volumeId?: string | ObjectID;
  user?: string;
  fileId?: string | ObjectID;
}

/**
 * Class responsible for managing files
 */
export class FilesController extends Controller {
  private _files: FileModel;
  private _volumes: VolumeModel;
  private _allowedFileTypes: Array<string>;
  private _users: UsersController;

  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {
    this._files = ModelFactory.get( 'files' );
    this._volumes = ModelFactory.get( 'volumes' );
    this._users = ControllerFactory.get( 'users' );
    this._allowedFileTypes = [ 'image/bmp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff', 'text/plain', 'text/json', 'application/octet-stream' ];
    return this;
  }

  /**
   * Fetches a file by its ID
   * @param fileID The file ID of the file on the volume
   * @param user Optionally specify the user of the file
   * @param searchTerm Specify a search term
   */
  async getFile( fileID: string, user?: string, searchTerm?: RegExp ) {
    const files = this._files;
    const searchQuery: Partial<IFileEntry<'server'>> = { identifier: fileID };

    if ( user ) {
      const u = await this._users.getUser( { username: user } );
      if ( !u )
        throw new Error404( `User not found` );

      searchQuery.user = new ObjectID( u._id );
    }

    if ( searchTerm )
      searchQuery.name = searchTerm as any;

    const file = await files.downloadOne<IFileEntry<'client'>>( searchQuery, { verbose: true, expandMaxDepth: 1, expandForeignKeys: true } );

    if ( !file )
      throw new Error( `File '${fileID}' does not exist` );

    return file;
  }

  /**
   * Fetches all file entries by a given query
   */
  async getFiles( options: FilesGetOptions ) {
    const files = this._files;
    const volumes = this._volumes;

    const searchQuery: Partial<IFileEntry<'server'>> = {};

    if ( options.volumeId ) {
      if ( typeof ( options.volumeId ) === 'string' && !isValidObjectID( options.volumeId ) )
        throw new Error( 'Please use a valid identifier for volumeId' );

      const volumeQuery: Partial<IVolume<'server'>> = { _id: new ObjectID( options.volumeId ) };
      if ( options.user ) {
        const user = await this._users.getUser( { username: options.user } );
        if ( user )
          volumeQuery.user = new ObjectID( user._id );
        else
          throw new Error404( `User not found` );
      }

      const volume = await volumes.findOne<IVolume<'server'>>( volumeQuery );

      if ( !volume )
        throw new Error( `Could not find the volume resource` );

      searchQuery.volumeId = volume.dbEntry._id;
    }

    if ( options.search )
      searchQuery.name = new RegExp( options.search ) as any;

    if ( options.user ) {
      const u = await this._users.getUser( { username: options.user } );
      if ( !u )
        throw new Error404( `User not found` );

      searchQuery.user = new ObjectID( u._id );
    }

    // Set the default sort order to ascending
    let sortOrder = -1;

    if ( options.sortOrder ) {
      if ( options.sortOrder.toLowerCase() === 'asc' )
        sortOrder = 1;
      else
        sortOrder = -1;
    }

    // Sort by the date created
    let sort: { [ key in keyof Partial<IFileEntry<'server'>> ]: number } | undefined = undefined;

    // Optionally sort by the last updated
    if ( options.sort === 'created' )
      sort = { created: sortOrder };
    else if ( options.sort === 'name' )
      sort = { name: sortOrder };
    else if ( options.sort === 'memory' )
      sort = { size: sortOrder };

    const count = await files.count( searchQuery );
    const index: number = options.index || 0;
    const limit: number = options.limit || 10;
    const verbose = options.verbose !== undefined ? options.verbose : true;

    const sanitizedData = await files.downloadMany<IFileEntry<'client'>>( {
      selector: searchQuery,
      sort: sort,
      index: index,
      limit: limit
    }, { verbose, expandForeignKeys: true, expandMaxDepth: 1 } );

    const toRet: Page<IFileEntry<'client'>> = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit
    };

    return toRet;
  }

  private removeTempFiles( files: File[] ) {
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

  private uploadFormToTempDir( req: IAuthReq ) {
    return new Promise<{ fields: Fields, files: File[] }>( ( resolve, reject ) => {
      const form = new IncomingForm();
      const filesArr: File[] = [];
      let fieldsToRet: Fields;
      let error: Error | null = null;

      form.encoding = 'utf-8';
      form.keepExtensions = true;
      form.maxFields = 1000; // Max number of allowed fields
      form.maxFieldsSize = 20 * 1024 * 1024; // Max size allowed for fields
      form.maxFileSize = this._config.remotes.maxFileSize || ( 20 * 1024 * 1024 ); // Max size allowed for files
      form.multiples = false;
      form.uploadDir = path.resolve( __dirname + '/../../temp' );


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
          this.removeTempFiles( filesArr );
          return reject( error );
        }
        else {
          return resolve( { fields: fieldsToRet, files: filesArr } );
        }
      } )
    } );
  }

  async uploadFileToRemote( file: File, volume: IVolume<'client' | 'server'>, removeFile: boolean = true ) {
    const filesModel = this._files;
    const volumesModel = this._volumes;

    file.path = path.resolve( file.path );
    let uploadToken: IUploadToken | null = null;

    // Upload the file to the remote
    try {
      uploadToken = await RemoteFactory.get( volume.type ).uploadFile( volume, file );
    } catch ( err ) {
      // Remove temp file
      if ( removeFile )
        await this.removeTempFiles( [ file ] );

      throw new Error500( err.message );
    }

    // Create the file entry
    const fileData: Partial<IFileEntry<'client'>> = {
      identifier: uploadToken!.id,
      publicURL: uploadToken!.url,
      name: file.name,
      created: Date.now(),
      size: file.size,
      mimeType: file.type,
      user: volume.user.toString(),
      volumeId: volume._id.toString(),
      volumeName: volume.name
    };

    const newFile = await filesModel.createInstance<IFileEntry<'client'>>( fileData );

    await volumesModel.update<IVolume<'client'>>( { identifier: volume.identifier } as IVolume<'server'>, { memoryUsed: volume.memoryUsed + file.size } );

    // Remove temp file
    if ( removeFile )
      await this.removeTempFiles( [ file ] );

    // Return the new file
    return newFile.downloadToken<IFileEntry<'client'>>( { verbose: true, expandMaxDepth: 1, expandForeignKeys: true } );
  }

  /**
   * Uploads files from a from data request to the temp folder
   * @param req The request to process form data
   * @param volumeId The id of the volume to upload to
   * @param username The username of the uploader
   */
  async uploadFilesToVolume( req: IAuthReq, volumeId: string, userId: string ) {
    if ( !volumeId || volumeId.trim() === '' )
      throw new Error( `Please specify a volume for the upload` );

    const volumeSchema = await this._volumes.findOne<IVolume<'server'>>( {
      _id: new ObjectID( volumeId ),
      user: new ObjectID( userId )
    } as Partial<IVolume<'server'>> );

    if ( !volumeSchema )
      throw new Error( `Volume does not exist` );

    const response = await this.uploadFormToTempDir( req );

    let memory = 0;
    for ( const f of response.files )
      memory += f.size;

    if ( memory + volumeSchema.dbEntry.memoryUsed > volumeSchema.dbEntry.memoryAllocated ) {
      await this.removeTempFiles( response.files )
      throw new Error( `You dont have sufficient memory in the volume` );
    }

    const proimises: Promise<IFileEntry<'client'>>[] = [];
    for ( const file of response.files )
      proimises.push( this.uploadFileToRemote( file, volumeSchema.dbEntry ) );

    const fileEntries = await Promise.all( proimises );
    return fileEntries;
  }

  /**
   * Fetches the file count based on the given query
   * @param searchQuery The search query to idenfify files
   */
  async count( searchQuery: IFileEntry<'server'> ) {
    const files = this._files;
    const count = await files.count( searchQuery );
    return count;
  }

  /**
   * Renames a file
   * @param fileId The id of the file to rename
   * @param name The new name of the file
   */
  async update( fileId: string | ObjectID, token: Partial<IFileEntry<'client'>> ) {
    const files = this._files;

    if ( typeof fileId === 'string' && !isValidObjectID( fileId ) )
      throw new Error( 'Invalid ID format' );

    const query = typeof fileId === 'string' ? { _id: new ObjectID( fileId ) } : { _id: fileId };
    const file = await this._files.findOne<IFileEntry<'server'>>( query );

    if ( !file )
      throw new Error( 'Resource not found' );

    const toRet = await files.update<IFileEntry<'client'>>( query, token, { verbose: true, expandMaxDepth: 1, expandForeignKeys: true } );
    return toRet;
  }

  /**
   * Deletes the file from storage and updates the databases
   * @param fileEntry
   */
  private async deleteFile( fileEntry: IFileEntry<'server'>, idsAlreadyHandled?: string[] ) {
    const files = this._files;
    const promises: Promise<any>[] = [];

    // First remove any files that have this as their parent
    const children = await files.findMany<IFileEntry<'server'>>( { selector: { parentFile: fileEntry._id } as Partial<IFileEntry<'server'>> } );
    for ( const child of children )
      promises.push( this.deleteFile( child.dbEntry ) );

    await Promise.all( promises );

    const volumes = this._volumes;
    const volume = await volumes.findOne<IVolume<'server'>>( fileEntry.volumeId );

    if ( volume ) {

      // Get the volume and delete the file
      await RemoteFactory.get( volume.dbEntry.type ).removeFile( volume.dbEntry, fileEntry );

      // Update the volume data usage
      await volumes.update<IVolume<'client'>>( { identifier: volume.dbEntry.identifier } as IVolume<'server'>, { memoryUsed: volume.dbEntry.memoryUsed - fileEntry.size! } as Partial<IVolume<'client'>> );
    }

    await files.deleteInstances( { _id: fileEntry._id } as IFileEntry<'server'> );
    return fileEntry;
  }

  /**
   * Attempts to remove files from the cloud and database by a query
   * @param searchQuery The query we use to select the files
   * @returns Returns the file IDs of the files removed
   */
  async removeFiles( options: DeleteOptions ) {
    const files = this._files;
    const volumes = this._volumes;
    const query: Partial<IFileEntry<'server'>> = {};

    if ( options.volumeId !== undefined ) {
      if ( typeof ( options.volumeId ) === 'string' && !isValidObjectID( options.volumeId ) )
        throw new Error( 'Invalid volume ID format' );

      const volumeQuery: Partial<IVolume<'server'>> = { _id: new ObjectID( options.volumeId ) }
      const volume = await volumes.collection.findOne( volumeQuery );

      if ( !volume )
        throw new Error( 'Volume resource does not exist' );

      query.volumeId = volume._id;
    }

    if ( options.fileId !== undefined ) {
      if ( typeof ( options.fileId ) === 'string' && !isValidObjectID( options.fileId ) )
        throw new Error( 'Invalid file ID format' );

      query._id = new ObjectID( options.fileId );
    }

    if ( options.user ) {
      const u = await this._users.getUser( { username: options.user } );
      if ( !u )
        throw new Error404( `User not found` );

      query.user = new ObjectID( u._id );
    }

    const fileEntries = await files.collection.find( query ).toArray();
    for ( let i = 0, l = fileEntries.length; i < l; i++ )
      await this.deleteFile( fileEntries[ i ] as IFileEntry<'server'> );

    return;
  }
}