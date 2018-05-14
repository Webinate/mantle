import { IModelEntry } from './i-model-entry';
import { ObjectID } from 'mongodb';

/*
 * Describes the category model
 */
export interface ICategory extends IModelEntry {
  title: string;
  slug: string;
  parent: string | null;
  children: ( ObjectID | string | ICategory )[];
  description: string;
}
