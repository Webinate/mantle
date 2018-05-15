import { Readable } from 'stream';
import { IBucketEntry } from '../models/i-bucket-entry';
import { IFileEntry } from '../models/i-file-entry';
import { IRemoteOptions } from '../config/properties/i-remote-options';


export type IUploadOptions = {
  headers: any;
  filename: string;
}

/**
 * This interface describes a remote destination that is used to upload
 * files sent from modepress. Remote's can be thought of as drives on a
 * computer or buckets in a cloud.
 */
export interface IRemote {

  initialize( options: IRemoteOptions ): Promise<void>;

  createBucket( bucket: Partial<IBucketEntry<'server' | 'client'>>, options?: any ): Promise<string>;

  uploadFile( bucket: IBucketEntry<'server' | 'client'>, file: Partial<IFileEntry<'server'>>, source: Readable, uploadOptions: IUploadOptions ): Promise<string>;

  removeFile( bucket: IBucketEntry<'server' | 'client'>, id: IFileEntry<'server'> ): Promise<void>;

  removeBucket( bucket: IBucketEntry<'server' | 'client'> ): Promise<void>;

  generateUrl( bucket: IBucketEntry<'server' | 'client'>, file: Partial<IFileEntry<'server'>> ): string;
}
