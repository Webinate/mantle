import { IModelEntry } from './i-model-entry';
import { IPost } from './i-post';

/*
 * Describes the comment model
 */
export interface IComment extends IModelEntry {
  author?: string;
  post?: string | IPost;
  parent?: string;
  public?: boolean;
  content?: string;
  children?: Array<string | any>;
  createdOn?: number;
  lastUpdated?: number;
}
