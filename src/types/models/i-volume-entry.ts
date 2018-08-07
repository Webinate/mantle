import { IModelEntry } from './i-model-entry';
import { IUserEntry } from './i-user-entry';
import { ObjectID } from 'mongodb';

/**
 * The interface for describing each user's volumes
 */
export interface IVolume<T extends 'server' | 'client'> extends IModelEntry<T> {
  name: string;
  type: 'google' | 'local';
  identifier: string;
  user: T extends 'client' ? IUserEntry<T> | string : ObjectID;
  created: number;
  memoryUsed: number;
  memoryAllocated: number;
  meta: any;
}
