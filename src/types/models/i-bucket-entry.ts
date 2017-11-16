import { ObjectID } from 'mongodb';

declare module 'modepress' {
  /**
   * The interface for describing each user's bucket
   */
  export interface IBucketEntry {
    _id?: string | ObjectID;
    name: string;
    identifier: string;
    user: string;
    created: number;
    memoryUsed: number;
    meta: any;
  }
}