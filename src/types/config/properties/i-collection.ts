export interface ICollectionProperties {
  /**
   * The name of the mongodb collection for storing user details
   * eg: 'users'
   */
  userCollection: string;

  /**
   * The name of the mongodb collection for storing session details
   * eg: 'sessions'
   */
  sessionCollection: string;

  /**
   * The name of the mongodb collection for storing volume details
   * eg: 'volumes'
   */
  volumesCollection: string;

  /**
   * The name of the mongodb collection for storing file details
   * eg: 'files'
   */
  filesCollection: string;

  /**
   * The name of the mongodb collection for storing user stats
   * eg: 'storageAPI'
   */
  statsCollection: string;

  /**
   * The name of the mongodb collection for storing user stats
   * eg: '_foreignKeys'
   */
  foreignKeys: string;
}
