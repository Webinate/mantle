import { IModelEntry } from './i-model-entry';

/**
  * The interface for describing each user's bucket
  */
export interface IStorageStats<T extends 'client' | 'server'> extends IModelEntry<T> {
  user?: string;
  memoryUsed?: number;
  memoryAllocated?: number;
  apiCallsUsed?: number;
  apiCallsAllocated?: number;
}
