import { IModelEntry } from './i-model-entry';
import { IUserEntry } from './i-user-entry';
import { ObjectId } from 'mongodb';

/**
 * The interface for describing each user's volumes
 */
export interface IVolume<T extends 'expanded' | 'server' | 'client'> extends IModelEntry<T> {
  name: string;
  type: 'google' | 'local';
  identifier: string;
  user: T extends 'expanded' ? IUserEntry<T> : T extends 'client' ? IUserEntry<T> | string : ObjectId;
  created: number;
  memoryUsed: number;
  memoryAllocated: number;
  meta: any;
}
