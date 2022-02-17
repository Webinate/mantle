import { IModelEntry } from './i-model-entry';
import { IUserEntry } from './i-user-entry';
import { ObjectId } from 'mongodb';
import { IFileEntry } from './i-file-entry';
import { IDocument } from './i-document';
import { IDraft } from './i-draft';

/*
 * Describes the post model
 */
export interface IPost<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  author: T extends 'expanded'
    ? IUserEntry<T> | null
    : T extends 'client'
    ? IUserEntry<T> | string | null
    : ObjectId | null;
  title: string;
  slug: string;
  brief: string;
  public: boolean;
  featuredImage: T extends 'expanded'
    ? IFileEntry<T> | null
    : T extends 'client'
    ? IFileEntry<T> | string | null
    : ObjectId | null;
  document: T extends 'expanded' ? IDocument<T> : T extends 'client' ? IDocument<T> | string : ObjectId;
  latestDraft: T extends 'expanded' ? IDraft<T> | null : T extends 'client' ? null | string : ObjectId | null;
  categories: T extends 'server' ? Array<ObjectId> : Array<string>;
  tags: Array<string>;
  createdOn: number;
  lastUpdated: number;
}
