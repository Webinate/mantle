import { ObjectID } from 'mongodb';
import { ITemplate } from './i-template';
import { IDocument } from './i-document';
import { IDraftElement } from './i-draft-elements';

export interface IDraft<T extends 'server' | 'client'> {
  _id: T extends 'client' ? string : ObjectID;
  parent: T extends 'client' ? IDocument<T> | string : ObjectID;
  template: T extends 'client' ? ITemplate<T> | string : ObjectID;
  templateMap: { [ zone: string ]: string[] };
  lastUpdated: number;
  createdOn: number;
  published: boolean;
}

export interface IPopulatedDrfat<T extends 'server' | 'client'> extends IDraft<T> {
  elements: IDraftElement<T>[];
}