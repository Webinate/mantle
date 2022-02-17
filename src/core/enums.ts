import { ObjectId } from 'mongodb';
import { IUserEntry } from '../types/models/i-user-entry';

export type CategoriesGetOptions = {
  index: number;
  limit: number;
  root: boolean;
  parent: ObjectId | string;
};

export type FilesGetOptions = {
  volumeId?: string | ObjectId;
  user?: string;
  index?: number;
  limit?: number;
  search?: string | RegExp;
  sortType?: 'created' | 'name' | 'memory';
  sortOrder?: SortOrder;
};

export type FileDeleteOptions = {
  volumeId?: string | ObjectId;
  user?: string;
  fileId?: string | ObjectId;
};

export type UsersGetptions = {
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

export type CommentsGetOptions = {
  visibility: CommentVisibility;
  user: string;
  index: number;
  depth: number;
  limit: number;
  expanded: boolean;
  keyword: string;
  root: boolean;
  parentId: ObjectId | string | null;
  postId: ObjectId | string;
  sortType: CommentSortType;
  sortOrder: SortOrder;
};

export type PostsGetOptions = {
  visibility: PostVisibility;
  categories: ObjectId[];
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

export enum UserPrivilege {
  super = 'super',
  admin = 'admin',
  regular = 'regular'
}

export enum AuthLevel {
  super = 'super',
  admin = 'admin',
  regular = 'regular',
  none = 'none'
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc'
}

export enum FileSortType {
  created = 'created',
  memory = 'memory',
  name = 'name'
}

export enum VolumeSortType {
  created = 'created',
  memory = 'memory',
  name = 'name'
}

export enum PostVisibility {
  all = 'all',
  public = 'public',
  private = 'private'
}

export enum PostSortType {
  title = 'title',
  created = 'created',
  modified = 'modified'
}

export enum VolumeType {
  google = 'google',
  local = 'local'
}

export enum ElementType {
  paragraph = 'paragraph',
  list = 'list',
  image = 'image',
  code = 'code',
  header1 = 'header1',
  header2 = 'header2',
  header3 = 'header3',
  header4 = 'header4',
  header5 = 'header5',
  header6 = 'header6',
  html = 'html'
}

export enum CommentVisibility {
  all = 'all',
  public = 'public',
  private = 'private'
}

export enum CommentSortType {
  updated = 'updated',
  created = 'created'
}

export const Collections = {
  users: 'users',
  sessions: 'sessions',
  volumes: 'volumes',
  files: 'files',
  stats: 'storage-stats',
  foreignKeys: '_foreignKeys'
};
