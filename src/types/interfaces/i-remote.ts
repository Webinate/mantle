import { Readable } from 'stream';

declare module 'modepress' {

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

    createBucket( id: string, options?: any ): Promise<string>;

    uploadFile( bucket: string, source: Readable, uploadOptions: IUploadOptions ): Promise<string>;

    removeFile( bucket: string, id: string ): Promise<void>;

    removeBucket( id: string ): Promise<void>;

    generateUrl( bucketIdentifier: string, fileIdentifier: string ): string;
  }
}