/*
 * Describes what kind of privileges the user has
 */
export enum UserPrivilege {
  super = 'super',
  admin = 'admin',
  regular = 'regular'
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

/*
 * Describes the types of volumes supported
 */
export enum VolumeType {
  google = 'google',
  local = 'local'
}

export const Collections = {
  users: 'users',
  sessions: 'sessions',
  volumes: 'volumes',
  files: 'files',
  stats: 'storage-stats',
  foreignKeys: '_foreignKeys'
};
