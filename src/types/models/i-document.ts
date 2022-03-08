import { ObjectId } from 'mongodb';
import { ITemplate } from './i-template';
import { IUserEntry } from './i-user-entry';
import { IDraftElement } from './i-draft-elements';

export interface IDocument<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  author: T extends 'expanded' ? IUserEntry<T> : T extends 'client' ? IUserEntry<T> | string | null : ObjectId | null;
  template: T extends 'expanded' ? ITemplate<T> : T extends 'client' ? ITemplate<T> | string : ObjectId;
  lastUpdated: number;
  createdOn: number;
  elementsOrder: T extends 'server' ? ObjectId[] : string[];
  elements: T extends 'server' ? ObjectId[] : IDraftElement<T>[];
  html: { [zone: string]: string };
}
