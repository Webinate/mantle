import { IUserEntry } from '../types/models/i-user-entry';

/*
 * Describes what kind of privileges the user has
 */
export enum UserPrivileges {
  SuperAdmin = 1,
  Admin = 2,
  Regular = 3
}

/*
 * Class that represents a user and its database entry
 */
export class User {
  dbEntry: IUserEntry;

  /**
	 * Creates a new User instance
	 * @param dbEntry The data object that represents the user in the DB
	 */
  constructor( dbEntry: IUserEntry ) {
    this.dbEntry = dbEntry;
  }

  /**
   * Generates an object that can be sent to clients.
   * @param verbose If true, sensitive database data will be sent (things like passwords will still be obscured)
   */
  generateCleanedData( verbose: boolean = false ): IUserEntry {
    if ( !this.dbEntry.passwordTag )
      this.dbEntry.passwordTag = '';

    if ( !this.dbEntry.sessionId )
      this.dbEntry.sessionId = '';

    if ( verbose )
      return {
        _id: this.dbEntry._id,
        email: this.dbEntry.email,
        lastLoggedIn: this.dbEntry.lastLoggedIn,
        createdOn: this.dbEntry.createdOn,
        password: this.dbEntry.password,
        registerKey: this.dbEntry.registerKey,
        sessionId: this.dbEntry.sessionId,
        username: this.dbEntry.username,
        privileges: this.dbEntry.privileges,
        passwordTag: this.dbEntry.passwordTag,
        meta: this.dbEntry.meta,
        avatar: this.dbEntry.avatar
      };
    else
      return {
        _id: this.dbEntry._id,
        lastLoggedIn: this.dbEntry.lastLoggedIn,
        createdOn: this.dbEntry.createdOn,
        username: this.dbEntry.username,
        privileges: this.dbEntry.privileges,
        avatar: this.dbEntry.avatar
      } as IUserEntry;
  }

  /**
	 * Generates the object to be stored in the database
	 */
  generateDbEntry(): IUserEntry {
    return {
      email: this.dbEntry.email,
      lastLoggedIn: Date.now(),
      createdOn: Date.now(),
      password: this.dbEntry.password,
      registerKey: ( this.dbEntry.registerKey !== undefined || this.dbEntry.privileges === UserPrivileges.SuperAdmin ? '' : this.generateKey( 10 ) ),
      sessionId: this.dbEntry.sessionId,
      username: this.dbEntry.username,
      privileges: this.dbEntry.privileges,
      passwordTag: this.dbEntry.passwordTag,
      meta: this.dbEntry.meta,
      avatar: this.dbEntry.avatar
    };
  }

  /**
	 * Creates a random string that is assigned to the dbEntry registration key
	 * @param length The length of the password
	 */
  generateKey( length: number = 10 ): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for ( let i = 0; i < length; i++ )
      text += possible.charAt( Math.floor( Math.random() * possible.length ) );

    return text;
  }
}