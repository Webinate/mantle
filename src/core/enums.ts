/*
 * Describes what kind of privileges the user has
 */
export enum UserPrivileges {
  SuperAdmin = 1,
  Admin = 2,
  Regular = 3
}

export const Collections = {
  users: 'users',
  sessions: 'sessions',
  volumes: 'volumes',
  files: 'files',
  stats: 'storage-stats',
  foreignKeys: '_foreignKeys'
}