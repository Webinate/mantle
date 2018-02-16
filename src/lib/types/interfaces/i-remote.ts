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

  createBucket( bucket: IBucketEntry, options?: any ): Promise<string>;

  uploadFile( bucket: IBucketEntry, file: IFileEntry, source: Readable, uploadOptions: IUploadOptions ): Promise<string>;

  removeFile( bucket: IBucketEntry, id: IFileEntry ): Promise<void>;

  removeBucket( bucket: IBucketEntry ): Promise<void>;

  generateUrl( bucket: IBucketEntry, file: IFileEntry ): string;
}
