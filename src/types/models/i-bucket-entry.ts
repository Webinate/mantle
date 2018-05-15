import { IModelEntry } from './i-model-entry';

/**
 * The interface for describing each user's bucket
 */
export interface IBucketEntry<T extends 'server' | 'client'> extends IModelEntry<T> {
  name: string;
  identifier: string;
  user: string;
  created: number;
  memoryUsed: number;
  meta: any;
}
