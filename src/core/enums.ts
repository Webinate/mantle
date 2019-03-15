/*
 * Describes what kind of privileges the user has
 */
export type UserPrivilege = 'super' | 'admin' | 'regular';

export const Collections = {
  users: 'users',
  sessions: 'sessions',
  volumes: 'volumes',
  files: 'files',
  stats: 'storage-stats',
  foreignKeys: '_foreignKeys'
};
