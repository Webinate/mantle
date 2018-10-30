import { ObjectID } from 'mongodb';
import { IDraft } from './i-draft';

export type DraftElements = 'elm-paragraph' | 'elm-header' | 'elm-list' | 'elm-image' | 'elm-code';

export interface IDraftElement<T extends 'server' | 'client'> {
  _id: T extends 'client' ? string : ObjectID;
  parent: T extends 'client' ? IDraft<T> | string : ObjectID;
  type: DraftElements;
  html: string;
}