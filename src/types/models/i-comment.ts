import { IModelEntry } from './i-model-entry';
import { IPost } from './i-post';
import { ObjectID } from 'mongodb';
import { IUserEntry } from './i-user-entry';

/*
 * Describes the comment model
 */
export interface IComment<T extends 'client' | 'expanded' | 'server'> extends IModelEntry<T> {
  author: string;
  user: T extends 'expanded' ? ( IUserEntry<T> | null ) : T extends 'client' ? string | IUserEntry<T> | null : ObjectID | null;
  post: T extends 'expanded' ? IPost<T> : T extends 'client' ? string | IPost<T> : ObjectID;
  parent: T extends 'expanded' ? ( IComment<T> | null ) : T extends 'client' ? string | IComment<T> | null : ObjectID | null;
  public: boolean;
  content: string;
  children: T extends 'expanded' ? IComment<T>[] : T extends 'client' ? string[] | IComment<T>[] : ObjectID[];
  createdOn: number;
  lastUpdated: number;
}
