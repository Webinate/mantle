import { Readable, Writable } from 'stream';
import { IGCS, IBucket } from 'gcloud';
import * as zlib from 'zlib';
import { IRemote, IGoogleProperties } from 'modepress';
import * as compressible from 'compressible';
import * as storage from '@google-cloud/storage';

export class GoogleBucket implements IRemote {
  private _zipper: zlib.Gzip;
  private _gcs: IGCS;

  constructor() {
    this._zipper = zlib.createGzip();
  }

  async initialize( options: IGoogleProperties ) {
    this._gcs = storage( {
      projectId: options.bucket.projectId,
      keyFilename: options.keyFile
    } );
  }

  async createBucket( id: string, options?: any ) {
    const gcs = this._gcs;
    const cors = {
      location: 'EU',
      cors: [
        {
          'origin': [
            '*'
          ],
          'method': [
            'GET',
            'OPTIONS'
          ],
          'responseHeader': [
            'content-type',
            'authorization',
            'content-length',
            'x-requested-with',
            'x-mime-type',
            'x-file-name',
            'cache-control'
          ],
          'maxAgeSeconds': 1
        }
      ]
    };

    let bucket: IBucket;

    try {
      const response: any[] = await gcs.createBucket( id, cors );
      bucket = response[ 0 ] as IBucket;
    }
    catch ( err ) {
      throw new Error( `Could not create a new bucket: '${err.message}'` )
    }

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
    const b = this._gcs.bucket( bucket );
    const rawFile = b.file( fileId );

    let dest: Writable;

    // Check if the stream content type is something that can be compressed
    // if so, then compress it before sending it to
    // Google and set the content encoding
    if ( compressible( uploadOptions.headers[ 'content-type' ] ) )
      dest = source.pipe( this._zipper ).pipe( rawFile.createWriteStream( <any>{ metadata: { contentEncoding: 'gzip', contentType: uploadOptions.headers[ 'content-type' ], metadata: { encoded: true } } } ) );
    else
      dest = source.pipe( rawFile.createWriteStream( <any>{ metadata: { contentType: uploadOptions.headers[ 'content-type' ] } } ) );

    await this.handleStreamsEvents( source, dest );
    await rawFile.makePublic();
    return fileId;
  }

  async removeFile( bucket: string, id: string ) {
    const gcs = this._gcs;
    const b: IBucket = gcs.bucket( bucket );
    let apiResp;

    try {
      // Get the bucket and delete the file
      const response: any[] = await b.file( id ).delete();
      apiResp = response[ 0 ];
    }
    catch ( err ) {
      throw new Error( `Could not remove file '${id}' from storage system: '${err.toString()}'` );
    }
  }

  async removeBucket( id: string ) {
    const gcs = this._gcs;

    // Now remove the bucket itself
    const bucket: IBucket = gcs.bucket( id );

    try {
      let apiResp;
      const response: any[] = await bucket.delete()
      apiResp = response[ 0 ];
    }
    catch ( err ) {
      throw new Error( `Could not remove bucket from storage system: '${err.message}'` )
    }
  }
}

export const googleBucket = new GoogleBucket();
