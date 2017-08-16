import { Readable, Writable } from 'stream';
import { resolve, basename, extname } from 'path';
import * as rimraf from 'rimraf';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { IRemote, IUploadOptions, ILocalBucket } from 'modepress';
import * as compressible from 'compressible';

export class LocalBucket implements IRemote {
  private _zipper: zlib.Gzip;
  private _path: string;

  constructor() {
    this._zipper = zlib.createGzip();
  }

  async initialize( options: ILocalBucket ) {
    this._path = resolve( options.path );
  }

  async createBucket( id: string, options?: any ) {
    const path = `${this._path}/${id}`;
    const exists = await this.exists( path );
    if ( exists )
      throw new Error( `The folder '${path}' already exists` );

    await fs.mkdirSync( path );
    return id;
  }

  private exists( path: string ) {
    return new Promise<boolean>( function( resolve, reject ) {
      fs.exists( path, function( e ) {
        resolve( e );
      } )
    } )
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

  async uploadFile( bucket: string, source: Readable, uploadOptions: IUploadOptions ) {

    let filename = uploadOptions.filename;
    let fileExists = await this.exists( `${this._path}/${bucket}/${filename}` );
    let counter = 1;

    while ( fileExists ) {
      let ext = extname( uploadOptions.filename );
      let base = basename( uploadOptions.filename, ext )
      base += counter.toString();
      counter++;

      filename = base + ext;
      fileExists = await this.exists( `${this._path}/${bucket}/${filename}` );
    }

    const writeStream = fs.createWriteStream( `${this._path}/${bucket}/${filename}` );

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

  async removeFile( bucket: string, id: string ) {
    const file = `${this._path}/${id}/${id}`;
    const exists = await this.exists( file );
    if ( !exists )
      return;

    await this.deletePath( file );
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

  async removeBucket( id: string ) {
    const path = `${this._path}/${id}`;
    const exists = await this.exists( path );
    if ( !exists )
      return;

    await this.deletePath( `${path}` );
  }
}

export const localBucket = new LocalBucket();
