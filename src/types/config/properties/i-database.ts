/*
 * Database properties
 */
export interface IDatabase {
  /**
   * The name of the mongo database to use
   */
  name: string;

  /**
   * The database host we are listening on
   */
  host: string;

  /** The collection name where we store database migrations */
  migrations: string;
}
