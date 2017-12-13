import { IUserEntry, IConfig, IMailer, IGMail, IMailgun, IMailOptions, IAdminUser, Page } from 'modepress';
import { Collection, Db } from 'mongodb';
import { ServerRequest, ServerResponse } from 'http';
import { isEmail, trim, blacklist, isAlphanumeric } from 'validator';
import { hash, compare } from 'bcrypt';
import { Request } from 'express';
import { User, UserPrivileges } from '../core/user';
import { info, warn } from '../utils/logger';
import { CommsController } from '../socket-api/comms-controller';
import { ClientInstruction } from '../socket-api/client-instruction';
import { ClientInstructionType } from '../socket-api/socket-event-types';
import ControllerFactory from '../core/controller-factory';
import { GMailer } from '../mailers/gmail';
import { Mailguner } from '../mailers/mailgun';
import { Session } from '../core/session';
import Controller from './controller';

/**
 * Main class to use for managing users
 */
export class UsersController extends Controller {
  private _collection: Collection<IUserEntry>;
  private _mailer: IMailer;

  /**
	 * Creates an instance of the user manager
	 */
  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {
    this._collection = await db.collection( this._config.collections.userCollection );
    ControllerFactory.get( 'sessions' ).on( 'sessionRemoved', this.onSessionRemoved.bind( this ) );

    if ( this._config.mail ) {
      if ( this._config.mail.type === 'gmail' ) {
        this._mailer = new GMailer( this._config.debug );
        this._mailer.initialize( this._config.mail.options as IGMail );
      }
      else if ( this._config.mail.type === 'mailgun' ) {
        this._mailer = new Mailguner( this._config.debug );
        this._mailer.initialize( this._config.mail.options as IMailgun );
      }
    }

    if ( !this._mailer )
      warn( 'No mailer has been specified and so the API cannot send emails. Please check your config.' )

    const adminUser = this._config.adminUser as IAdminUser;

    // See if we have an admin user
    let user = await this.getUser( adminUser.username );

    // If no admin user exists, so lets try to create one
    if ( !user )
      user = await this.createUser( {
        username: adminUser.username,
        email: adminUser.email,
        password: adminUser.password,
        privileges: UserPrivileges.SuperAdmin,
        meta: {}
      }, true, true );
  }

  /**
   * Called whenever a session is removed from the database
   */
  async onSessionRemoved( sessionId: string ) {
    if ( !sessionId || sessionId === '' )
      return;

    const useEntry = await this._collection.find( { sessionId: sessionId } as IUserEntry ).limit( 1 ).next();
    if ( useEntry ) {
      // Send logged out event to socket
      const token = { username: useEntry.username!, type: ClientInstructionType[ ClientInstructionType.Logout ] };
      await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, useEntry.username ) );
      info( `User '${useEntry.username}' has logged out` );
    }

    return;
  }

  /**
	 * Attempts to register a new user
	 * @param username The username of the user
	 * @param pass The users secret password
	 * @param email The users email address
   * @param meta Any optional data associated with this user
	 * @param request
	 * @param response
	 */
  async register( username: string = '', pass: string = '', email: string = '', activationUrl: string = '', meta: any = {}, request: Request ) {
    const origin = encodeURIComponent( request.headers[ 'origin' ] || request.headers[ 'referer' ] );

    // First check if user exists, make sure the details supplied are ok, then create the new user
    let user: User | null = await this.getUser( username, email );

    // If we already a user then error out
    if ( user )
      throw new Error( 'That username or email is already in use; please choose another or login.' );

    // Validate other data
    if ( !pass || pass === '' ) throw new Error( 'Password cannot be null or empty' );
    if ( !email || email === '' ) throw new Error( 'Email cannot be null or empty' );
    if ( !isEmail( email ) ) throw new Error( 'Please use a valid email address' );

    user = await this.createUser( {
      username: username,
      email: email,
      password: pass,
      privileges: UserPrivileges.Regular,
      meta: meta
    }, false );

    // Send a message to the user to say they are registered but need to activate their account
    const message = 'Thank you for registering with Webinate! To activate your account please click the link below: \n\n' +
      ( activationUrl ? this.createActivationLink( user, activationUrl, origin ) + '\n\n' : '' ) +
      'Thanks\n' +
      'The Webinate Team';

    // If no mailer is setup
    if ( !this._mailer )
      throw new Error( `No email account has been setup` );

    // Send mail using the mailer
    await this._mailer.sendMail(
      user.dbEntry.email!,
      ( this._config.mail.options as IMailOptions ).from,
      'Activate your account',
      message
    );

    return user;
  }

  /**
	 * Creates the link to send to the user for activation
	 * @param user The user we are activating
   * @param resetUrl The url of where the activation link should go
   * @param origin The origin of where the activation link came from
	 */
  private createActivationLink( user: User, resetUrl: string, origin: string ): string {
    return `${resetUrl}?key=${user.dbEntry.registerKey}&user=${user.dbEntry.username}&origin=${origin}`;
  }

  /**
	 * Creates the link to send to the user for password reset
	 * @param username The username of the user
   * @param origin The origin of where the password reset link came from
   * @param resetUrl The url of where the password reset link should go
	 */
  private createResetLink( user: User, origin: string, resetUrl: string ): string {
    return `${resetUrl}?key=${user.dbEntry.passwordTag}&user=${user.dbEntry.username}&origin=${origin}`;
  }

  /**
	 * Approves a user's activation code so they can login without email validation
	 * @param username The username or email of the user
	 */
  async approveActivation( username: string ): Promise<void> {
    // Get the user
    const user: User | null = await this.getUser( username );

    if ( !user )
      throw new Error( 'No user exists with the specified details' );

    // Clear the user's activation
    await this._collection.updateOne( { _id: user.dbEntry._id }, { $set: { registerKey: '' } as IUserEntry } );

    // Send activated event
    const token = { username: username, type: ClientInstructionType[ ClientInstructionType.Activated ] };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, username ) );

    info( `User '${username}' has been activated` );
    return;
  }

  /**
   * Attempts to send the an email to the admin user
   * @param message The message body
   * @param name The name of the sender
   * @param from The email of the sender
   */
  async sendAdminEmail( message: string, name?: string, from?: string ) {
    if ( !this._mailer )
      throw new Error( `No email account has been setup` );

    try {
      const adminUser = this._config.adminUser as IAdminUser;
      await this._mailer.sendMail( adminUser.email, ( this._config.mail.options as IMailOptions ).from, `Message from ${( name ? name : 'a user' )}`,
        message + '<br /><br />Email: ' + ( from ? from : '' ) );
    } catch ( err ) {
      new Error( `Could not send email to user: ${err.message}` )
    }

    return true;
  }

  /**
	 * Attempts to resend the activation link
	 * @param username The username of the user
   * @param resetUrl The url where the reset password link should direct to
   * @param origin The origin of where the request came from (this is emailed to the user)
	 */
  async resendActivation( username: string, resetUrl: string, origin: string ) {
    // Get the user
    const user: User | null = await this.getUser( username );

    if ( !user )
      throw new Error( 'No user exists with the specified details' );

    if ( user.dbEntry.registerKey === '' )
      throw new Error( 'Account has already been activated' );

    const newKey = user.generateKey();
    user.dbEntry.registerKey = newKey;

    // Update the collection with a new key
    await this._collection.updateOne( { _id: user.dbEntry._id }, { $set: { registerKey: newKey } as IUserEntry } );

    // Send a message to the user to say they are registered but need to activate their account
    const message: string = 'Thank you for registering with Webinate!\nTo activate your account please click the link below:' +
      this.createActivationLink( user, resetUrl, origin ) +
      'Thanks\n\n' +
      'The Webinate Team';

    // If no mailer is setup
    if ( !this._mailer )
      throw new Error( `No email account has been setup` );

    try {
      // Send mail using the mailer
      await this._mailer.sendMail( user.dbEntry.email!, ( this._config.mail.options as IMailOptions ).from, 'Activate your account', message );
    } catch ( err ) {
      new Error( `Could not send email to user: ${err.message}` )
    }

    return true;
  }

  /**
   * Sends the user an email with instructions on how to reset their password
   * @param username The username of the user
   * @param resetUrl The url where the reset password link should direct to
   * @param origin The site where the request came from
   */
  async requestPasswordReset( username: string, resetUrl: string, origin: string ) {
    // Get the user
    const user: User | null = await this.getUser( username );

    if ( !user )
      throw new Error( 'No user exists with the specified details' );

    const newKey = user.generateKey();

    // Password token
    user.dbEntry.passwordTag = newKey;

    // Update the collection with a new key
    await this._collection.updateOne( { _id: user.dbEntry._id }, { $set: { passwordTag: newKey } as IUserEntry } );

    // Send a message to the user to say they are registered but need to activate their account
    const message: string = 'A request has been made to reset your password. To change your password please click the link below:\n\n' +
      this.createResetLink( user, origin, resetUrl ) +
      'Thanks\n\n' +
      'The Webinate Team';

    // If no mailer is setup
    if ( !this._mailer )
      throw new Error( `No email account has been setup` );

    // Send mail using the mailer
    try {
      await this._mailer.sendMail( user.dbEntry.email!, ( this._config.mail.options as IMailOptions ).from, 'Reset Password', message );
    }
    catch ( err ) {
      throw new Error( `Could not send email to user: ${err.message}` )
    }

    return true;
  }

  /**
   * Creates a hashed password
   * @param pass The password to hash
   */
  private hashPassword( pass: string ) {
    return new Promise<string>( function( resolve, reject ) {
      hash( pass, 8, function( err, encrypted: string ) {
        if ( err )
          return reject( err )
        else
          return resolve( encrypted );
      } );
    } );
  }

  /**
   * Compares a password to the stored hash in the database
   * @param pass The password to test
   * @param hash The hash stored in the DB
   */
  private comparePassword( pass: string, hash: string ) {
    return new Promise<boolean>( function( resolve, reject ) {
      compare( pass, hash, function( err, same: boolean ) {
        if ( err )
          return reject( err );
        else
          return resolve( same );
      } );
    } );
  }

  /**
   * Attempts to reset a user's password.
   * @param username The username of the user
   * @param code The password code
   * @param newPassword The new password
   */
  async resetPassword( username: string, code: string, newPassword: string ) {
    // Get the user
    const user: User | null = await this.getUser( username );

    // No user - so invalid
    if ( !user )
      throw new Error( 'No user exists with those credentials' );

    // If key is the same
    if ( user.dbEntry.passwordTag !== code )
      throw new Error( 'Password codes do not match. Please try resetting your password again' );

    // Make sure password is valid
    if ( newPassword === undefined || newPassword === '' || blacklist( newPassword, '@\'\'{}' ) !== newPassword )
      throw new Error( 'Please enter a valid password' );

    const hashed = await this.hashPassword( newPassword );

    // Update the key to be blank
    await this._collection.updateOne( { _id: user.dbEntry._id } as IUserEntry, { $set: { passwordTag: '', password: hashed } as IUserEntry } );

    // All done :)
    return true;
  }

  /**
	 * Checks the users activation code to see if its valid
	 * @param username The username of the user
	 */
  async checkActivation( username: string, code: string ) {
    // Get the user
    const user = await this.getUser( username );

    // No user - so invalid
    if ( !user )
      throw new Error( 'No user exists with those credentials' );

    // If key is already blank - then its good to go
    if ( user.dbEntry.registerKey === '' )
      return true;

    // Check key
    if ( user.dbEntry.registerKey !== code )
      throw new Error( 'Activation key is not valid. Please try send another.' );

    // Update the key to be blank
    await this._collection.updateOne( { _id: user.dbEntry._id } as IUserEntry, { $set: { registerKey: '' } as IUserEntry } );

    // Send activated event
    const token = { username: username, type: ClientInstructionType[ ClientInstructionType.Activated ] };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, username ) );

    info( `User '${username}' has been activated` );
    return true;
  }

  /**
	 * Attempts to log the user out
	 * @param request
	 * @param response
	 */
  async logOut( request: ServerRequest, response: ServerResponse ) {
    const sessionCleaered = await ControllerFactory.get( 'sessions' ).clearSession( null, request, response );
    return sessionCleaered;
  }

  /**
	 * Creates a new user
	 * @param options The user options for creating the user
   * @param activateAccount If true, the account will be automatically activated (no need for email verification)
   * @param allowAdmin Should this be allowed to create a super user
	 */
  async createUser( options: Partial<IUserEntry>, activateAccount: boolean = false, allowAdmin: boolean = false ) {
    // Basic checks
    if ( !options.username || trim( options.username ) === '' )
      throw new Error( 'Username cannot be empty' );
    if ( !isAlphanumeric( options.username ) )
      throw new Error( 'Username must be alphanumeric' );
    if ( !options.email || trim( options.email ) === '' )
      throw new Error( 'Email cannot be empty' );
    if ( !isEmail( options.email ) )
      throw new Error( 'Email must be valid' );
    if ( !options.password || trim( options.password ) === '' )
      throw new Error( 'Password cannot be empty' );
    if ( options.privileges === undefined || options.privileges > 3 )
      throw new Error( 'Privilege type is unrecognised' );
    if ( options.privileges === UserPrivileges.SuperAdmin && allowAdmin === false )
      throw new Error( 'You cannot create a super user' );

    // Check if the user already exists
    const hashedPsw: string = await this.hashPassword( options.password );
    const existingUser = await this.getUser( options.username, options.email );

    if ( existingUser )
      throw new Error( `A user with that name or email already exists` );

    const randNum = Math.floor( Math.random() * 20 ) + 1;
    const avatar = options.avatar && options.avatar !== '' ? options.avatar : randNum.toString();

    // Create the user
    const newUser: User = new User( {
      username: options.username,
      password: hashedPsw,
      email: options.email,
      privileges: options.privileges,
      passwordTag: '',
      meta: options.meta || {},
      avatar: avatar,
      registerKey: ( activateAccount ? '' : undefined )
    } as IUserEntry );

    // Update the database
    const insertResult = await this._collection.insertOne( newUser.generateDbEntry() );

    // Assing the ID and pass the user on
    newUser.dbEntry = insertResult.ops[ 0 ];

    // All users have default stats created for them
    await ControllerFactory.get( 'stats' ).createUserStats( newUser.dbEntry.username! );

    return newUser;
  }

  /**
	 * Deletes a user from the database
	 * @param user The unique username or email of the user to remove
	 */
  async removeUser( user: string ) {
    let username: string = '';
    const userInstance = await this.getUser( user );

    if ( !userInstance )
      throw new Error( 'Could not find any users with those credentials' );

    if ( userInstance.dbEntry.privileges === UserPrivileges.SuperAdmin )
      throw new Error( 'You cannot remove a super user' );

    username = userInstance.dbEntry.username!;

    await ControllerFactory.get( 'buckets' ).removeUser( username );

    const result = await this._collection.deleteOne( { _id: userInstance.dbEntry._id! } as IUserEntry );

    if ( result.deletedCount === 0 )
      throw new Error( 'Could not remove the user from the database' );

    // Send event to sockets
    const token = { username: username, type: ClientInstructionType[ ClientInstructionType.Removed ] };
    CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, username ) );

    info( `User '${username}' has been removed` );

    return;
  }

  /**
	 * Gets a user by a username or email
	 * @param user The username or email of the user to get
	 * @param email [Optional] Do a check if the email exists as well
	 * @returns Resolves with either a valid user or null if none exists
	 */
  async getUser( user: string, email?: string ) {
    email = email !== undefined ? email : user;

    // Validate user string
    user = trim( user );

    if ( !user || user === '' )
      throw new Error( 'Please enter a valid username' );

    if ( !isAlphanumeric( user ) && !isEmail( user ) )
      throw new Error( 'Please only use alpha numeric characters for your username' );

    const target = [ { email: email }, { username: user }];

    // Search the collection for the user
    const userEntry = await this._collection.find( { $or: target } ).limit( 1 ).next();
    if ( !userEntry )
      return null;
    else
      return new User( userEntry );
  }

  /**
	 * Attempts to log a user in
	 * @param username The username or email of the user
	 * @param pass The password of the user
	 * @param rememberMe True if the cookie persistence is required
	 * @param request
	 * @param response
	 */
  async logIn( username: string = '', pass: string = '', rememberMe: boolean = true, request: ServerRequest, response: ServerResponse ): Promise<Session> {
    await this.logOut( request, response );
    const user: User | null = await this.getUser( username );

    // If no user - then reject
    if ( !user )
      throw new Error( 'The username or password is incorrect.' );

    // Validate password
    pass = trim( pass );
    if ( !pass || pass === '' )
      throw new Error( 'Please enter a valid password' );

    // Check if the registration key has been removed yet
    if ( user.dbEntry.registerKey !== '' )
      throw new Error( 'Please authorise your account by clicking on the link that was sent to your email' );

    const passworldValid: boolean = await this.comparePassword( pass, user.dbEntry.password! );
    if ( !passworldValid )
      throw new Error( 'The username or password is incorrect.' );

    // Set the user last login time
    user.dbEntry.lastLoggedIn = Date.now();

    // Update the collection
    let result = await this._collection.updateOne( { _id: user.dbEntry._id }, { $set: { lastLoggedIn: user.dbEntry.lastLoggedIn } } );

    if ( result.matchedCount === 0 )
      throw new Error( 'Could not find the user in the database, please make sure its setup correctly' );

    const session = await ControllerFactory.get( 'sessions' ).createSession( request, response, user.dbEntry._id );

    // Send logged in event to socket
    const token = { username: username, type: ClientInstructionType[ ClientInstructionType.Login ] };
    await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, username ) );
    return session;
  }

  /**
	 * Removes a user by his email or username
	 * @param username The username or email of the user
	 * @returns True if the user was in the DB or false if they were not
	 */
  async remove( username: string = '' ) {
    const user = await this.getUser( username );

    // There was no user
    if ( !user )
      return false;

    // Remove the user from the DB
    const result = await this._collection.deleteOne( { _id: user.dbEntry._id } );
    if ( result.deletedCount === 0 )
      return false;
    else
      return true;
  }

  /**
   * Sets the meta data associated with the user
   * @param user The user
   * @param data The meta data object to set
   * @returns Returns the data set
   */
  async setMeta( user: IUserEntry, data?: any ) {

    // There was no user
    if ( !user )
      return false;

    // Remove the user from the DB
    await this._collection.updateOne( { _id: user._id } as IUserEntry, { $set: { meta: ( data ? data : {} ) } as IUserEntry } );
    return data;
  }

  /**
   * Sets a meta value on the user. This updates the user's meta value by name
   * @param user The user
   * @param name The name of the meta to set
   * @param data The value of the meta to set
   * @returns {Promise<boolean|any>} Returns the value of the set
   */
  async setMetaVal( user: IUserEntry, name: string, val: any ) {
    // There was no user
    if ( !user )
      return false;

    const datum = 'meta.' + name;
    const updateToken = { $set: {} };
    updateToken.$set[ datum ] = val;

    // Remove the user from the DB
    await this._collection.updateOne( { _id: user._id } as IUserEntry, updateToken );
    return val;
  }

  /**
   * Gets the value of user's meta by name
   * @param user The user
   * @param name The name of the meta to get
   * @returns The value to get
   */
  async getMetaVal( user: IUserEntry, name: string ) {

    // There was no user
    if ( !user )
      return false;

    // Remove the user from the DB
    const result = await this._collection.find( { _id: user._id } as IUserEntry ).project( { _id: 0, meta: 1 } ).limit( 1 ).next();
    return result.meta[ name ];
  }

  /**
   * Gets the meta data of a user
   * @param user The user
   * @returns The value to get
   */
  async getMetaData( user: IUserEntry ) {

    // There was no user
    if ( !user )
      return false;

    // Remove the user from the DB
    const result = await this._collection.find( { _id: user._id } as IUserEntry ).project( { _id: 0, meta: 1 } ).limit( 1 ).next();
    return result.meta;
  }

  /**
   * Gets the total number of users
   * @param searchPhrases Search phrases
   */
  async numUsers( searchPhrases?: RegExp ) {

    const findToken = searchPhrases ? {
      $or: [
        { username: <any>searchPhrases } as IUserEntry,
        { email: <any>searchPhrases } as IUserEntry
      ]
    } : {};

    const result: number = await this._collection.count( findToken );
    return result;
  }

  /**
	 * Prints user objects from the database
	 * @param limit The number of users to fetch
	 * @param index The starting index from where we are fetching users from
   * @param searchPhrases Search phrases
   * @param verbose True if you want to show all user information
	 */
  async getUsers( index: number = 0, limit: number = 10, searchPhrases?: RegExp, verbose: boolean = true ) {
    const findToken: { $or?: Partial<IUserEntry>[] } = {};

    if ( searchPhrases )
      findToken.$or = [ { username: <any>searchPhrases }, { email: <any>searchPhrases }];

    const cursor = this._collection.find( findToken );
    const count = await this._collection.count( findToken );

    if ( index )
      cursor.skip( index )

    if ( limit )
      cursor.limit( limit )

    const results = await cursor.toArray();
    const users: IUserEntry[] = [];
    for ( let i = 0, l = results.length; i < l; i++ )
      users.push( new User( results[ i ] ).generateCleanedData( verbose ) );

    const toRet: Page<IUserEntry> = {
      count: count,
      data: results,
      index: index,
      limit: limit
    };
    return toRet;
  }
}