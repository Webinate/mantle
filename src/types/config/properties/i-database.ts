declare module 'modepress' {

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

    /**
     * The port number the mongo database is listening on
     */
    port: number;
  }
}