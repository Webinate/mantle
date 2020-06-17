/*
 * Describes what kind of privileges the user has
 */
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

/*
 * Describes the types of volumes supported
 */
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
