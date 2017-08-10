declare module 'modepress' {
  /*
   * An interface to describe the data stored in the database for users
   */
  export interface IUserEntry {
    _id?: any;
    username?: string;
    email?: string;
    password?: string;
    registerKey?: string;
    sessionId?: string;
    createdOn?: number;
    lastLoggedIn?: number;
    privileges?: number;
    passwordTag?: string;
    meta?: any;
  }
}