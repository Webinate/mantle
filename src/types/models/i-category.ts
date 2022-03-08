import { IModelEntry } from './i-model-entry';
import { ObjectId } from 'mongodb';

/*
 * Describes the category model
 */
export interface ICategory<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  title: string;
  slug: string;
  parent: T extends 'expanded' ? ICategory<T> : T extends 'client' ? string : ObjectId | null;
  children: T extends 'expanded' ? ICategory<T>[] : undefined;
  description?: string;
}
