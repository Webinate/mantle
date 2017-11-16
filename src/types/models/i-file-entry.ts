import { ObjectID } from 'mongodb';

declare module 'modepress' {
  /**
   * The interface for describing each user's file
   */
  export interface IFileEntry {
    _id?: string | ObjectID;
    name: string;
    user: string;
    identifier?: string;
    bucketId: string | ObjectID;
    bucketName: string;
    publicURL?: string;
    created: number;
    size: number;
    mimeType: string;
    isPublic: boolean;
    numDownloads: number;
    parentFile: string | null;
    meta: any;
  }
}