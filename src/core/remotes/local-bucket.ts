import { Readable, Writable } from 'stream';
import { resolve } from 'path';
import * as rimraf from 'rimraf';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { IRemote, ILocalBucket } from 'modepress';
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

    if ( fs.existsSync( path ) )
      throw new Error( `The folder '${path}' already exists` );

    await fs.mkdirSync( path );
    return id;
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

  async uploadFile( bucket: string, fileId: string, source: Readable, uploadOptions: { headers: any } ) {

    const file = `${this._path}/${bucket}/${fileId}`;
    const writeStream = fs.createWriteStream( file );

    // Check if the stream content type is something that can be compressed
    // if so, then compress it before sending it to
    // Google and set the content encoding
    if ( compressible( uploadOptions.headers[ 'content-type' ] ) )
      source.pipe( this._zipper ).pipe( writeStream );
    else
      source.pipe( writeStream );

    await this.handleStreamsEvents( source, writeStream );
    return fileId;
  }

  async removeFile( bucket: string, id: string ) {
    const file = `${this._path}/${id}/${id}`;

    if ( !fs.existsSync( file ) )
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
    if ( !fs.existsSync( path ) )
      return;

    await this.deletePath( `${path}` );
  }
}

export const localBucket = new LocalBucket();
