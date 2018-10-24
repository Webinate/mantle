import { IModelEntry } from './i-model-entry';
import { IUserEntry } from './i-user-entry';
import { ObjectID } from 'mongodb';
import { IFileEntry } from './i-file-entry';
import { IDocument } from './i-document';

/*
 * Describes the post model
 */
export interface IPost<T extends 'client' | 'server'> extends IModelEntry<T> {
  author: T extends 'client' ? IUserEntry<T> | string | null : ObjectID | null;
  title: string;
  slug: string;
  brief: string;
  public: boolean;
  content: string;
  featuredImage: T extends 'client' ? IFileEntry<T> | string | null : ObjectID | null;
  document: T extends 'client' ? IDocument<T> | string : ObjectID;
  categories: Array<string>;
  tags: Array<string>;
  createdOn: number;
  lastUpdated: number;
}
