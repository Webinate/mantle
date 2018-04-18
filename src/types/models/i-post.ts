import { IModelEntry } from './i-model-entry';
import { IUserEntry } from './i-user-entry';

/*
 * Describes the post model
 */
export interface IPost extends IModelEntry {
  author?: IUserEntry;
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
