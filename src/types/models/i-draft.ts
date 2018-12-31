import { ObjectID } from 'mongodb';
import { ITemplate } from './i-template';
import { IDocument } from './i-document';
import { IDraftElement } from './i-draft-elements';

export interface IDraft<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectID;
  parent: T extends 'expanded' ? IDocument<T> : T extends 'client' ? IDocument<T> | string : ObjectID;
  template: T extends 'expanded' ? ITemplate<T> : T extends 'client' ? ITemplate<T> | string : ObjectID;
  elementsOrder: string[];
  elements: IDraftElement<T>[];
  html: { [ zone: string ]: string };
  lastUpdated: number;
  createdOn: number;
  published: boolean;
}