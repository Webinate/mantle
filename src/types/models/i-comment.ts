import { IModelEntry } from './i-model-entry';
import { IPost } from './i-post';
import { ObjectID } from 'mongodb';

/*
 * Describes the comment model
 */
export interface IComment<T extends 'client' | 'server'> extends IModelEntry<T> {
  author?: string;
  post?: T extends 'client' ? string | IPost<T> : ObjectID;
  parent?: T extends 'client' ? string | IComment<T> : ObjectID;
  public?: boolean;
  content?: string;
  children?: T extends 'client' ? string[] | IComment<T>[] : ObjectID[];
  createdOn?: number;
  lastUpdated?: number;
}
