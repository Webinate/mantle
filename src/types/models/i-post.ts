import { IModelEntry } from './i-model-entry';
import { IUserEntry } from './i-user-entry';
import { ObjectID } from 'mongodb';

/*
 * Describes the post model
 */
export interface IPost<T extends 'client' | 'server'> extends IModelEntry<T> {
  author: T extends 'client' ? IUserEntry<T> | string : ObjectID;
  title: string;
  slug: string;
  brief: string;
  public: boolean;
  content: string;
  featuredImage: string;
  categories: Array<string>;
  tags: Array<string>;
  createdOn: number;
  lastUpdated: number;
}
