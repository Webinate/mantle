import { IModelEntry } from './i-model-entry';

/*
 * Describes the cache renders model
 */
export interface IRender<T extends 'client' | 'server'> extends IModelEntry<T> {
  url?: T extends 'client' ? string : RegExp | string;
  expiration?: number;
  createdOn?: number;
  updateDate?: number;
  html?: string;
}