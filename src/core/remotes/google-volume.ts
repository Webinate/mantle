import '../../types/stubs';
import { Readable, Writable } from 'stream';
import { createGzip, Gzip } from 'zlib';
import { createReadStream } from 'fs';
import { IGoogleProperties } from '../../types/config/properties/i-google';
import { IRemote, IUpload, IUploadToken } from '../../types/interfaces/i-remote';
import { IVolume } from '../../types/models/i-volume-entry';
import { IFileEntry } from '../../types/models/i-file-entry';
import * as compressible from 'compressible';
import { Storage } from '@google-cloud/storage';
import { generateRandString } from '../../utils/utils';
import { extname } from 'path';

export class GoogleVolume implements IRemote {
  private _zipper: Gzip;
  private _gcs: any;

  constructor() {
    this._zipper = createGzip();
  }

  async initialize(options: IGoogleProperties) {
    this._gcs = new Storage({
      projectId: options.projectId,
      keyFilename: options.keyFile
    });
  }

  // generateUrl( volume: IVolume<'server'>, identifier: string ) {
  //   return `https://storage.googleapis.com/${volume.identifier}/${identifier}`;
  // }

  async createVolume(volume: IVolume<'server'>, options?: any) {
    const gcs = this._gcs;
    const cors = {
      location: 'EU',
      cors: [
        {
          origin: ['*'],
          method: ['GET', 'OPTIONS'],
          responseHeader: [
            'content-type',
            'authorization',
            'content-length',
            'x-requested-with',
            'x-mime-type',
            'x-file-name',
            'cache-control'
          ],
          maxAgeSeconds: 1
        }
      ]
    };

    try {
      await gcs.createBucket(volume.identifier, cors);
    } catch (err) {
      throw new Error(`Could not create a new volume: '${err.message}'`);
    }

    return volume.identifier;
  }

  /**
   * Wraps a source and destination stream in a promise that catches error
   * and completion events
   */
  private handleStreamsEvents(source: Readable, dest: Writable) {
    return new Promise(function(resolve, reject) {
      let earlyExit = false;

      source.on('error', function(err: Error) {
        if (earlyExit) return;

        earlyExit = true;
        reject(new Error(`Error reading source stream for upload: '${err.message}'`));
      });

      dest.on('error', function(err: Error) {
        if (earlyExit) return;

        earlyExit = true;
        return reject(new Error(`Error in upload stream to volume: '${err.message}'`));
      });

      dest.on('finish', () => {
        if (earlyExit) return;

        resolve(true);
      });
    });
  }

  async uploadFile(volume: IVolume<'server'>, file: IUpload): Promise<IUploadToken> {
    const filename = generateRandString(16) + extname(file.name);
    const b = this._gcs.bucket(volume.identifier);
    const rawFile = b.file(filename);

    let dest: Writable;
    const source = createReadStream(file.path);

    // Check if the stream content type is something that can be compressed
    // if so, then compress it before sending it to
    // Google and set the content encoding
    if (compressible(file.type))
      dest = source.pipe(this._zipper).pipe(
        rawFile.createWriteStream(<any>{
          metadata: { contentEncoding: 'gzip', contentType: file.type, metadata: { encoded: true } }
        })
      );
    else dest = source.pipe(rawFile.createWriteStream(<any>{ metadata: { contentType: file.type } }));

    try {
      await this.handleStreamsEvents(source, dest);
    } catch (err) {
      throw err;
    }

    await rawFile.makePublic();
    return {
      id: filename,
      url: `https://storage.googleapis.com/${volume.identifier}/${filename}`
    };
  }

  async removeFile(volume: IVolume<'server'>, file: IFileEntry<'server'>) {
    const gcs = this._gcs;
    const b: any = gcs.bucket(volume.identifier);

    try {
      // Get the volume and delete the file
      await b.file(file.identifier!).delete();
    } catch (err) {
      throw new Error(`Could not remove file '${file.identifier}' from storage system: '${err.toString()}'`);
    }
  }

  async removeVolume(entry: IVolume<'server'>) {
    const gcs = this._gcs;

    // Now remove the volume itself
    const bucket: any = gcs.bucket(entry.identifier);

    try {
      await bucket.delete();
    } catch (err) {
      throw new Error(`Could not remove volume from storage system: '${err.message}'`);
    }
  }
}

export const googleVolume = new GoogleVolume();
