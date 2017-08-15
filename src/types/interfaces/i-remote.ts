import { Readable } from 'stream';

declare module 'modepress' {

  /**
   * This interface describes a remote destination that is used to upload
   * files sent from modepress. Remote's can be thought of as drives on a
   * computer or buckets in a cloud.
   */
  export interface IRemote {

    initialize( options: IRemoteOptions ): Promise<void>;

    createBucket( id: string, options?: any ): Promise<string>;

    uploadFile( bucket: string, fileId: string, source: Readable, uploadOptions: { headers: any } ): Promise<string>;

    removeFile( bucket: string, id: string ): Promise<void>;

    removeBucket( id: string ): Promise<void>;
  }
}