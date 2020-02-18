import { IModelEntry } from './i-model-entry';
import { ObjectID } from 'mongodb';

/*
 * Describes the category model
 */
export interface ICategory<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  title: string;
  slug: string;
  parent: T extends 'expanded' ? ICategory<T> : T extends 'client' ? string : ObjectID | null;
  children: T extends 'expanded' ? ICategory<T>[] : T extends 'client' ? (string | ICategory<T>)[] : ObjectID[];
  description: string;
}
