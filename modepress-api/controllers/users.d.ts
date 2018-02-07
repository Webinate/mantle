/// <reference types="express" />
/// <reference types="node" />
import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IUserEntry } from '../types/models/i-user-entry';
import { Db } from 'mongodb';
import { ServerRequest, ServerResponse } from 'http';
import { Request } from 'express';
import { User } from '../core/user';
import { Session } from '../core/session';
import Controller from './controller';
/**
 * Main class to use for managing users
 */
export declare class UsersController extends Controller {
    private _collection;
    private _mailer;
    /**
       * Creates an instance of the user manager
       */
    constructor(config: IConfig);
    /**
     * Initializes the controller
     * @param db The mongo db
     */
    initialize(db: Db): Promise<void>;
    /**
     * Called whenever a session is removed from the database
     */
    onSessionRemoved(sessionId: string): Promise<void>;
    /**
       * Attempts to register a new user
       * @param username The username of the user
       * @param pass The users secret password
       * @param email The users email address
     * @param meta Any optional data associated with this user
       * @param request
       * @param response
       */
    register(username: string | undefined, pass: string | undefined, email: string | undefined, activationUrl: string | undefined, meta: any, request: Request): Promise<User>;
    /**
       * Creates the link to send to the user for activation
       * @param user The user we are activating
     * @param resetUrl The url of where the activation link should go
     * @param origin The origin of where the activation link came from
       */
    private createActivationLink(user, resetUrl, origin);
    /**
       * Creates the link to send to the user for password reset
       * @param username The username of the user
     * @param origin The origin of where the password reset link came from
     * @param resetUrl The url of where the password reset link should go
       */
    private createResetLink(user, origin, resetUrl);
    /**
       * Approves a user's activation code so they can login without email validation
       * @param username The username or email of the user
       */
    approveActivation(username: string): Promise<void>;
    /**
     * Attempts to send the an email to the admin user
     * @param message The message body
     * @param name The name of the sender
     * @param from The email of the sender
     */
    sendAdminEmail(message: string, name?: string, from?: string): Promise<boolean>;
    /**
       * Attempts to resend the activation link
       * @param username The username of the user
     * @param resetUrl The url where the reset password link should direct to
     * @param origin The origin of where the request came from (this is emailed to the user)
       */
    resendActivation(username: string, resetUrl: string, origin: string): Promise<boolean>;
    /**
     * Sends the user an email with instructions on how to reset their password
     * @param username The username of the user
     * @param resetUrl The url where the reset password link should direct to
     * @param origin The site where the request came from
     */
    requestPasswordReset(username: string, resetUrl: string, origin: string): Promise<boolean>;
    /**
     * Creates a hashed password
     * @param pass The password to hash
     */
    private hashPassword(pass);
    /**
     * Compares a password to the stored hash in the database
     * @param pass The password to test
     * @param hash The hash stored in the DB
     */
    private comparePassword(pass, hash);
    /**
     * Attempts to reset a user's password.
     * @param username The username of the user
     * @param code The password code
     * @param newPassword The new password
     */
    resetPassword(username: string, code: string, newPassword: string): Promise<boolean>;
    /**
       * Checks the users activation code to see if its valid
       * @param username The username of the user
       */
    checkActivation(username: string, code: string): Promise<boolean>;
    /**
       * Attempts to log the user out
       * @param request
       * @param response
       */
    logOut(request: ServerRequest, response: ServerResponse): Promise<boolean>;
    /**
       * Creates a new user
       * @param options The user options for creating the user
     * @param activateAccount If true, the account will be automatically activated (no need for email verification)
     * @param allowAdmin Should this be allowed to create a super user
       */
    createUser(options: Partial<IUserEntry>, activateAccount?: boolean, allowAdmin?: boolean): Promise<User>;
    /**
       * Deletes a user from the database
       * @param user The unique username or email of the user to remove
       */
    removeUser(user: string): Promise<void>;
    /**
       * Gets a user by a username or email
       * @param user The username or email of the user to get
       * @param email [Optional] Do a check if the email exists as well
       * @returns Resolves with either a valid user or null if none exists
       */
    getUser(user: string, email?: string): Promise<User | null>;
    /**
       * Attempts to log a user in
       * @param username The username or email of the user
       * @param pass The password of the user
       * @param rememberMe True if the cookie persistence is required
       * @param request
       * @param response
       */
    logIn(username: string | undefined, pass: string | undefined, rememberMe: boolean | undefined, request: ServerRequest, response: ServerResponse): Promise<Session>;
    /**
       * Removes a user by his email or username
       * @param username The username or email of the user
       * @returns True if the user was in the DB or false if they were not
       */
    remove(username?: string): Promise<boolean>;
    /**
     * Sets the meta data associated with the user
     * @param user The user
     * @param data The meta data object to set
     * @returns Returns the data set
     */
    setMeta(user: IUserEntry, data?: any): Promise<any>;
    /**
     * Sets a meta value on the user. This updates the user's meta value by name
     * @param user The user
     * @param name The name of the meta to set
     * @param data The value of the meta to set
     * @returns {Promise<boolean|any>} Returns the value of the set
     */
    setMetaVal(user: IUserEntry, name: string, val: any): Promise<any>;
    /**
     * Gets the value of user's meta by name
     * @param user The user
     * @param name The name of the meta to get
     * @returns The value to get
     */
    getMetaVal(user: IUserEntry, name: string): Promise<any>;
    /**
     * Gets the meta data of a user
     * @param user The user
     * @returns The value to get
     */
    getMetaData(user: IUserEntry): Promise<any>;
    /**
     * Gets the total number of users
     * @param searchPhrases Search phrases
     */
    numUsers(searchPhrases?: RegExp): Promise<number>;
    /**
       * Prints user objects from the database
       * @param limit The number of users to fetch
       * @param index The starting index from where we are fetching users from
     * @param searchPhrases Search phrases
     * @param verbose True if you want to show all user information
       */
    getUsers(index?: number, limit?: number, searchPhrases?: RegExp, verbose?: boolean): Promise<Page<IUserEntry>>;
}
