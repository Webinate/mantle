import { Readable, Writable } from 'stream';
import { resolve, basename, extname } from 'path';
import * as rimraf from 'rimraf';
import { mkdirSync, exists, existsSync, createWriteStream, createReadStream } from 'fs';
import { createGzip, Gzip } from 'zlib';
import { ILocalVolume } from '../../types/config/properties/i-remote-options';
import { IRemote, IUploadToken, IUpload } from '../../types/interfaces/i-remote';
import { IFileEntry } from '../../types/models/i-file-entry';
import { IVolume } from '../../types/models/i-volume-entry';
import * as compressible from 'compressible';

export class LocalVolume implements IRemote {
  private _zipper: Gzip;
  private _path: string;
  private _url: string;

  constructor() {
    this._zipper = createGzip();
  }

  async initialize( options: ILocalVolume ) {

    if ( !options.path )
      throw new Error( `Please specify the 'path' variable to your local remote options` );

    if ( !existsSync( resolve( options.path ) ) )
      throw new Error( `The path '${resolve( options.path )}' specified in the local remote does not resolve to a folder` );

    if ( !options.url )
      throw new Error( `Please specify the 'url' variable to your local remote options` );

    this._path = resolve( options.path );
    this._url = options.url;
  }

  async createVolume( volume: IVolume<'server'>, options?: any ) {
    const path = `${this._path}/${volume.identifier}`;
    const exists = await this.exists( path );
    if ( exists )
      throw new Error( `The folder '${path}' already exists` );

    await mkdirSync( path );
    return volume.identifier;
  }

  private exists( path: string ) {
    return new Promise<boolean>( function( resolve, reject ) {
      exists( path, function( e ) {
        resolve( e );
      } )
    } )
  }

  // generateUrl( volume: IVolume<'server'>, identifier: string ) {
  //   return `${this._url}/${volume.identifier}/${identifier}`;
  // }

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
        return reject( new Error( `Error in upload stream to volume: '${err.message}'` ) )
      } );

      dest.on( 'finish', () => {
        if ( earlyExit )
          return;

        resolve();
      } );
    } );
  }

  async uploadFile( volume: IVolume<'server'>, file: IUpload ): Promise<IUploadToken> {
    let ext = extname( file.name );
    let base = basename( file.name, ext )
    let filename = base + ( ext ? ext : '' );
    let fileExists = await this.exists( `${this._path}/${volume.identifier}/${filename}` );
    let counter = 1;

    while ( fileExists ) {
      ext = extname( file.name );
      base = basename( file.name, ext )
      base += counter.toString();
      counter++;

      filename = base + ( ext ? ext : '' );
      fileExists = await this.exists( `${this._path}/${volume.identifier}/${filename}` );
    }

    const writeStream = createWriteStream( `${this._path}/${volume.identifier}/${filename}` );
    const source = createReadStream( file.path );

    // Check if the stream content type is something that can be compressed
    // if so, then compress it before sending it to
    // Google and set the content encoding
    if ( compressible( file.type ) )
      source.pipe( this._zipper ).pipe( writeStream );
    else
      source.pipe( writeStream );

    await this.handleStreamsEvents( source, writeStream );
    return {
      id: filename,
      url: `${this._url}/${volume.identifier}/${filename}`
    };
  }

  async removeFile( volume: IVolume<'server'>, file: IFileEntry<'server'> ) {
    const filePath = `${this._path}/${volume.identifier}/${file.identifier}`;
    const exists = await this.exists( filePath );
    if ( !exists )
      return;

    await this.deletePath( filePath );
  }

  private async deletePath( path: string ) {
    return new Promise( function( resolve, reject ) {
      rimraf( path, function( err ) {
        if ( err )
          return reject( err );

        return resolve();
      } );
    } );
  }

  async removeVolume( volume: IVolume<'server'> ) {
    const path = `${this._path}/${volume.identifier}`;
    const exists = await this.exists( path );
    if ( !exists )
      return;

    await this.deletePath( `${path}` );
  }
}

export const localVolume = new LocalVolume();
