import { ObjectID } from 'mongodb';
import { IDraft } from './i-draft';
import { IFileEntry } from './i-file-entry';

export type DraftElements = 'elm-paragraph' | 'elm-list' | 'elm-image' | 'elm-code' |
  'elm-header-1' | 'elm-header-2' | 'elm-header-3' | 'elm-header-4' | 'elm-header-5' | 'elm-header-6';

export interface IDraftElement<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectID;
  parent: T extends 'expanded' ? IDraft<T> : T extends 'client' ? IDraft<T> | string : ObjectID;
  type: DraftElements;
  html: string;
  zone: string;
}


export interface IImageElement<T extends 'server' | 'expanded' | 'client'> extends IDraftElement<T> {
  image: T extends 'expanded' ? IFileEntry<T> : T extends 'client' ? IFileEntry<T> | string | null : ObjectID | null;
}