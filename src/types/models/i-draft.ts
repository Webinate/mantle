import { ObjectId } from 'mongodb';
import { IDocument } from './i-document';

export interface IDraft<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  parent: T extends 'expanded' ? IDocument<T> : T extends 'client' ? IDocument<T> | string : ObjectId;
  html: { [zone: string]: string };
  createdOn: number;
}
