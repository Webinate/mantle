import { ObjectID } from 'mongodb';
import { ITemplate } from './i-template';
import { IDocument } from './i-document';

export interface IDraft<T extends 'server' | 'client'> {
  _id: T extends 'client' ? string : ObjectID;
  parent: T extends 'client' ? IDocument<T> | string : ObjectID;
  template: T extends 'client' ? ITemplate<T> | string : ObjectID;
  elements: string[];
  lastUpdated: number;
  createdOn: number;
  published: boolean;
}