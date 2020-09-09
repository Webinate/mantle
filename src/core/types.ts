import { ObjectID } from 'mongodb';
import { SortOrder, VolumeSortType, CommentVisibility, CommentSortType, PostVisibility, PostSortType } from './enums';
import { IUserEntry } from '../types/models/i-user-entry';

export type CategoriesGetManyOptions = {
  index: number;
  limit: number;
  root: boolean;
  parent: ObjectID | string;
};

export type FilesGetOptions = {
  volumeId?: string | ObjectID;
  user?: string;
  index?: number;
  limit?: number;
  search?: string | RegExp;
  sortType?: 'created' | 'name' | 'memory';
  sortOrder?: SortOrder;
};

export type DeleteOptions = {
  volumeId?: string | ObjectID;
  user?: string;
  fileId?: string | ObjectID;
};

export type UsersGetAllOptions = {
  search: string;
  index: number;
  limit: number;
  verbose: boolean;
};

export type VolumesGetOptions = {
  user: string | IUserEntry<'client' | 'server'>;
  search: RegExp | string;
  index: number;
  limit: number;
  sortType: VolumeSortType;
  sortOrder: SortOrder;
};

export type CommentGetAllOptions = {
  visibility: CommentVisibility;
  user: string;
  index: number;
  depth: number;
  limit: number;
  expanded: boolean;
  keyword: string;
  root: boolean;
  parentId: ObjectID | string | null;
  postId: ObjectID | string;
  sortType: CommentSortType;
  sortOrder: SortOrder;
};

export type PostsGetAllOptions = {
  visibility: PostVisibility;
  categories: ObjectID[];
  tags: string[];
  rtags: string[];
  sort: PostSortType;
  requiredTags?: string[];
  index: number;
  limit: number;
  keyword: string;
  author: string;
  sortOrder: SortOrder;
};
