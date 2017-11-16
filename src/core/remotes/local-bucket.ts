import { Readable, Writable } from 'stream';
import { resolve, basename, extname } from 'path';
import * as rimraf from 'rimraf';
import { mkdirSync, exists, existsSync, createWriteStream } from 'fs';
import { createGzip, Gzip } from 'zlib';
import { IRemote, IUploadOptions, ILocalBucket, IBucketEntry, IFileEntry } from 'modepress';
import * as compressible from 'compressible';

export class LocalBucket implements IRemote {
  private _zipper: Gzip;
  private _path: string;
  private _url: string;

  constructor() {
    this._zipper = createGzip();
  }

  async initialize( options: ILocalBucket ) {

    if ( !options.path )
      throw new Error( `Please specify the 'path' variable to your local remote options` );

    if ( !existsSync( resolve( options.path ) ) )
      throw new Error( `The path '${resolve( options.path )}' specified in the local remote does not resolve to a folder` );

    if ( !options.url )
      throw new Error( `Please specify the 'url' variable to your local remote options` );

    this._path = resolve( options.path );
    this._url = options.url;
  }

  async createBucket( bucket: IBucketEntry, options?: any ) {
    const path = `${this._path}/${bucket.identifier}`;
    const exists = await this.exists( path );
    if ( exists )
      throw new Error( `The folder '${path}' already exists` );

    await mkdirSync( path );
    return bucket.identifier;
  }

  private exists( path: string ) {
    return new Promise<boolean>( function( resolve, reject ) {
      exists( path, function( e ) {
        resolve( e );
      } )
    } )
  }

  generateUrl( bucket: IBucketEntry, file: IFileEntry ) {
    return `${this._url}/${bucket.identifier}/${file.identifier}`;
  }

  /**
   * Wraps a source and destination stream in a promise that catches error
   * and completion events
   */
  private handleStreamsEvents( source: Readable, dest: Writable ) {
    return new Promise( function( resolve, reject ) {
      let earlyExit = false;

      source.on( 'error', function( err: Error ) {
        if ( earlyExit )
          return;

        earlyExit = true;
        reject( new Error( `Error reading source stream for upload: '${err.message}'` ) );
      } );

      dest.on( 'error', function( err: Error ) {
        if ( earlyExit )
          return;

        earlyExit = true;
        return reject( new Error( `Error in upload stream to bucket: '${err.message}'` ) )
      } );

      dest.on( 'finish', () => {
        if ( earlyExit )
          return;

        resolve();
      } );
    } );
  }

  async uploadFile( bucket: IBucketEntry, file: IFileEntry, source: Readable, uploadOptions: IUploadOptions ) {
    let ext = extname( uploadOptions.filename );
    let filename = uploadOptions.filename;
    let fileExists = await this.exists( `${this._path}/${bucket.identifier}/${filename}${ext ? '.' + ext : ''}` );
    let counter = 1;

    while ( fileExists ) {
      ext = extname( uploadOptions.filename );
      let base = basename( uploadOptions.filename, ext )
      base += counter.toString();
      counter++;

      filename = base + ( ext ? '.' + ext : '' );
      fileExists = await this.exists( `${this._path}/${bucket.identifier}/${filename}` );
    }

    const writeStream = createWriteStream( `${this._path}/${bucket.identifier}/${filename}` );

    // Check if the stream content type is something that can be compressed
    // if so, then compress it before sending it to
    // Google and set the content encoding
    if ( compressible( uploadOptions.headers[ 'content-type' ] ) )
      source.pipe( this._zipper ).pipe( writeStream );
    else
      source.pipe( writeStream );

    await this.handleStreamsEvents( source, writeStream );
    return filename;
  }

  async removeFile( bucket: IBucketEntry, file: IFileEntry ) {
    const filePath = `${this._path}/${bucket.identifier}/${file.identifier}`;
    const exists = await this.exists( filePath );
    if ( !exists )
      return;

    await this.deletePath( filePath );
  }

  private async deletePath( path ) {
    return new Promise( function( resolve, reject ) {
      rimraf( path, function( err ) {
        if ( err )
          return reject( err );

        return resolve();
      } );
    } );
  }

  async removeBucket( bucket: IBucketEntry ) {
    const path = `${this._path}/${bucket.identifier}`;
    const exists = await this.exists( path );
    if ( !exists )
      return;

    await this.deletePath( `${path}` );
  }
}

export const localBucket = new LocalBucket();
