import { IModelEntry } from './i-model-entry';

/*
 * Describes the post model
 */
export interface IPost extends IModelEntry {
  author?: string;
  title?: string;
  slug?: string;
  brief?: string;
  public?: boolean;
  content?: string;
  featuredImage?: string;
  categories?: Array<string>;
  tags?: Array<string>;
  createdOn?: number;
  lastUpdated?: number;
}
