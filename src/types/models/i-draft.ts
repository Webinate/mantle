import { ObjectID } from 'mongodb';
import { IDocument } from './i-document';

export interface IDraft<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectID;
  parent: T extends 'expanded' ? IDocument<T> : T extends 'client' ? IDocument<T> | string : ObjectID;
  html: { [ zone: string ]: string };
  createdOn: number;
  published: boolean;
}