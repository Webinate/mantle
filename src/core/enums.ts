/*
 * Describes what kind of privileges the user has
 */
export enum UserPrivilege {
  Super = 'super',
  Admin = 'admin',
  Regular = 'regular'
}

/*
 * Describes the types of volumes supported
 */
export enum VolumeType {
  Google = 'google',
  Local = 'local'
}

export const Collections = {
  users: 'users',
  sessions: 'sessions',
  volumes: 'volumes',
  files: 'files',
  stats: 'storage-stats',
  foreignKeys: '_foreignKeys'
};
