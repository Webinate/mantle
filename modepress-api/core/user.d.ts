import { IUserEntry } from '../types/models/i-user-entry';
export declare enum UserPrivileges {
    SuperAdmin = 1,
    Admin = 2,
    Regular = 3,
}
export declare class User {
    dbEntry: IUserEntry;
    /**
       * Creates a new User instance
       * @param dbEntry The data object that represents the user in the DB
       */
    constructor(dbEntry: IUserEntry);
    /**
     * Generates an object that can be sent to clients.
     * @param verbose If true, sensitive database data will be sent (things like passwords will still be obscured)
     */
    generateCleanedData(verbose?: boolean): IUserEntry;
    /**
       * Generates the object to be stored in the database
       */
    generateDbEntry(): IUserEntry;
    /**
       * Creates a random string that is assigned to the dbEntry registration key
       * @param length The length of the password
       */
    generateKey(length?: number): string;
}
