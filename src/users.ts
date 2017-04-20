'use strict';

import * as mongodb from 'mongodb';
import * as http from 'http';
import * as validator from 'validator';
import * as bcrypt from 'bcryptjs';
import * as express from 'express';
import { info, warn } from './logger';

import { CommsController } from './socket-api/comms-controller';
import { ClientInstruction } from './socket-api/client-instruction';
import { ClientInstructionType } from './socket-api/socket-event-types';
import { SessionManager, Session } from './session';
import { BucketManager } from './bucket-manager';
import { GMailer } from './mailers/gmail'
import { Mailguner } from './mailers/mailgun'

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
    dbEntry: Modepress.IUserEntry;

	/**
	 * Creates a new User instance
	 * @param dbEntry The data object that represents the user in the DB
	 */
    constructor( dbEntry: Modepress.IUserEntry ) {
        this.dbEntry = dbEntry;
    }

    /**
	* Generates an object that can be sent to clients.
    * @param verbose If true, sensitive database data will be sent (things like passwords will still be obscured)
	*/
    generateCleanedData( verbose: boolean = false ): Modepress.IUserEntry {
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
                meta: this.dbEntry.meta
            };
        else
            return {
                _id: this.dbEntry._id,
                lastLoggedIn: this.dbEntry.lastLoggedIn,
                createdOn: this.dbEntry.createdOn,
                username: this.dbEntry.username,
                privileges: this.dbEntry.privileges
            };
    }

	/**
	 * Generates the object to be stored in the database
	 */
    generateDbEntry(): Modepress.IUserEntry {
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
            meta: this.dbEntry.meta
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

/**
 * Main class to use for managing users
 */
export class UserManager {
    private static _singleton: UserManager;

    public sessionManager: SessionManager;
    private _userCollection: mongodb.Collection;
    private _config: Modepress.IConfig;
    private _mailer: Modepress.IMailer;

	/**
	 * Creates an instance of the user manager
	 * @param userCollection The mongo collection that stores the users
	 * @param sessionCollection The mongo collection that stores the session data
	 * @param The config options of this manager
	 */
    constructor( userCollection: mongodb.Collection, sessionCollection: mongodb.Collection, config: Modepress.IConfig ) {
        this._userCollection = userCollection;
        this._config = config;
        UserManager._singleton = this;

        // Create the session manager
        this.sessionManager = new SessionManager( sessionCollection, {
            domain: config.sessionSettings.sessionDomain,
            lifetime: config.sessionSettings.sessionLifetime,
            path: config.sessionSettings.sessionPath,
            persistent: config.sessionSettings.sessionPersistent,
            secure: config.sessionSettings.secure
        } );

        this.sessionManager.on( 'sessionRemoved', this.onSessionRemoved.bind( this ) );
    }

    /**
	 * Called whenever a session is removed from the database
	 */
    async onSessionRemoved( sessionId: string ) {
        if ( !sessionId || sessionId === '' )
            return;

        const useEntry: Modepress.IUserEntry = await this._userCollection.find( <Modepress.IUserEntry>{ sessionId: sessionId } ).limit( 1 ).next();
        if ( useEntry ) {
            // Send logged out event to socket
            const token: Modepress.SocketTokens.IUserToken = { username: useEntry.username!, type: ClientInstructionType[ ClientInstructionType.Logout ] };
            await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, useEntry.username ) );
            info( `User '${useEntry.username}' has logged out` );
        }

        return;
    }

	/**
	 * Initializes the API
	 */
    async initialize(): Promise<void> {
        const config = this._config;

        if ( config.mail ) {
            if ( config.mail.type === 'gmail' ) {
                this._mailer = new GMailer( config.debug );
                this._mailer.initialize( config.mail.options as Modepress.IGMail );
            }
            else if ( config.mail.type === 'mailgun' ) {
                this._mailer = new Mailguner( config.debug );
                this._mailer.initialize( config.mail.options as Modepress.IMailgun );
            }
        }

        if ( !this._mailer )
            warn( 'No mailer has been specified and so the API cannot send emails. Please check your config.' )


        // Clear all existing indices and then re-add them
        await this._userCollection.dropIndexes();

        // Make sure the user collection has an index to search the username field
        await this._userCollection.createIndex( <Modepress.IUserEntry>{ username: 'text', email: 'text' } );

        // See if we have an admin user
        let user = await this.getUser( config.adminUser.username );

        // If no admin user exists, so lets try to create one
        if ( !user )
            user = await this.createUser( config.adminUser.username, config.adminUser.email, config.adminUser.password, true, UserPrivileges.SuperAdmin, {}, true );

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
    async register( username: string = '', pass: string = '', email: string = '', activationUrl: string = '', meta: any = {}, request: express.Request ): Promise<User> {
        const origin = encodeURIComponent( request.headers[ 'origin' ] || request.headers[ 'referer' ] );

        // First check if user exists, make sure the details supplied are ok, then create the new user
        let user: User | null = await this.getUser( username, email );

        // If we already a user then error out
        if ( user )
            throw new Error( 'That username or email is already in use; please choose another or login.' );

        // Validate other data
        if ( !pass || pass === '' ) throw new Error( 'Password cannot be null or empty' );
        if ( !email || email === '' ) throw new Error( 'Email cannot be null or empty' );
        if ( !validator.isEmail( email ) ) throw new Error( 'Please use a valid email address' );

        user = await this.createUser( username, email, pass, false, UserPrivileges.Regular, meta );

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
            this._config.mail.from,
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
        await this._userCollection.updateOne( { _id: user.dbEntry._id }, { $set: <Modepress.IUserEntry>{ registerKey: '' } } );

        // Send activated event
        const token: Modepress.SocketTokens.IUserToken = { username: username, type: ClientInstructionType[ ClientInstructionType.Activated ] };
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
    async sendAdminEmail( message: string, name?: string, from?: string ): Promise<any> {
        if ( !this._mailer )
            throw new Error( `No email account has been setup` );

        try {
            await this._mailer.sendMail( this._config.adminUser.email, this._config.mail.from, `Message from ${( name ? name : 'a user' )}`,
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
    async resendActivation( username: string, resetUrl: string, origin: string ): Promise<boolean> {
        // Get the user
        const user: User | null = await this.getUser( username );

        if ( !user )
            throw new Error( 'No user exists with the specified details' );

        if ( user.dbEntry.registerKey === '' )
            throw new Error( 'Account has already been activated' );

        const newKey = user.generateKey();
        user.dbEntry.registerKey = newKey;

        // Update the collection with a new key
        await this._userCollection.updateOne( { _id: user.dbEntry._id }, { $set: <Modepress.IUserEntry>{ registerKey: newKey } } );

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
            await this._mailer.sendMail( user.dbEntry.email!, this._config.mail.from, 'Activate your account', message );
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
    async requestPasswordReset( username: string, resetUrl: string, origin: string ): Promise<boolean> {
        // Get the user
        const user: User | null = await this.getUser( username );

        if ( !user )
            throw new Error( 'No user exists with the specified details' );

        const newKey = user.generateKey();

        // Password token
        user.dbEntry.passwordTag = newKey;

        // Update the collection with a new key
        await this._userCollection.updateOne( { _id: user.dbEntry._id }, { $set: <Modepress.IUserEntry>{ passwordTag: newKey } } );

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
            await this._mailer.sendMail( user.dbEntry.email!, this._config.mail.from, 'Reset Password', message );
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
    private hashPassword( pass: string ): Promise<string> {
        return new Promise<string>( function( resolve, reject ) {
            bcrypt.hash( pass, 8, function( err, encrypted: string ) {
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
    private comparePassword( pass: string, hash: string ): Promise<boolean> {
        return new Promise<boolean>( function( resolve, reject ) {
            bcrypt.compare( pass, hash, function( err, same: boolean ) {
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
    async resetPassword( username: string, code: string, newPassword: string ): Promise<boolean> {
        // Get the user
        const user: User | null = await this.getUser( username );

        // No user - so invalid
        if ( !user )
            throw new Error( 'No user exists with those credentials' );

        // If key is the same
        if ( user.dbEntry.passwordTag !== code )
            throw new Error( 'Password codes do not match. Please try resetting your password again' );

        // Make sure password is valid
        if ( newPassword === undefined || newPassword === '' || validator.blacklist( newPassword, '@\'\'{}' ) !== newPassword )
            throw new Error( 'Please enter a valid password' );

        const hashed = await this.hashPassword( newPassword );

        // Update the key to be blank
        await this._userCollection.updateOne( <Modepress.IUserEntry>{ _id: user.dbEntry._id }, { $set: <Modepress.IUserEntry>{ passwordTag: '', password: hashed } } );

        // All done :)
        return true;
    }

	/**
	 * Checks the users activation code to see if its valid
	 * @param username The username of the user
	 */
    async checkActivation( username: string, code: string ): Promise<boolean> {
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
        await this._userCollection.updateOne( <Modepress.IUserEntry>{ _id: user.dbEntry._id }, { $set: <Modepress.IUserEntry>{ registerKey: '' } } );

        // Send activated event
        const token: Modepress.SocketTokens.IUserToken = { username: username, type: ClientInstructionType[ ClientInstructionType.Activated ] };
        await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, username ) );

        info( `User '${username}' has been activated` );
        return true;
    }

	/**
	 * Checks to see if a user is logged in
	 * @param request
	 * @param response
	 * @param Gets the user or null if the user is not logged in
	 */
    async loggedIn( request: http.ServerRequest, response: http.ServerResponse | null ): Promise<User | null> {
        // If no request or response, then assume its an admin user
        const session = await this.sessionManager.getSession( request, response );
        if ( !session )
            return null;

        const useEntry = await this._userCollection.find( { sessionId: session.sessionId } ).limit( 1 ).next();
        if ( !useEntry )
            return null;
        else
            return new User( useEntry );
    }

	/**
	 * Attempts to log the user out
	 * @param request
	 * @param response
	 */
    async logOut( request: http.ServerRequest, response: http.ServerResponse ): Promise<boolean> {
        const sessionCleaered = await this.sessionManager.clearSession( null, request, response );
        return sessionCleaered;
    }

	/**
	 * Creates a new user
	 * @param user The unique username
	 * @param email The unique email
	 * @param password The password for the user
     * @param activateAccount If true, the account will be automatically activated (no need for email verification)
	 * @param privilege The type of privileges the user has. Defaults to regular
     * @param meta Any optional data associated with this user
     * @param allowAdmin Should this be allowed to create a super user
	 */
    async createUser( user: string, email: string, password: string, activateAccount: boolean, privilege: UserPrivileges = UserPrivileges.Regular, meta: any = {}, allowAdmin: boolean = false ): Promise<User> {
        // Basic checks
        if ( !user || validator.trim( user ) === '' )
            throw new Error( 'Username cannot be empty' );
        if ( !validator.isAlphanumeric( user ) )
            throw new Error( 'Username must be alphanumeric' );
        if ( !email || validator.trim( email ) === '' )
            throw new Error( 'Email cannot be empty' );
        if ( !validator.isEmail( email ) )
            throw new Error( 'Email must be valid' );
        if ( !password || validator.trim( password ) === '' )
            throw new Error( 'Password cannot be empty' );
        if ( privilege > 3 )
            throw new Error( 'Privilege type is unrecognised' );
        if ( privilege === UserPrivileges.SuperAdmin && allowAdmin === false )
            throw new Error( 'You cannot create a super user' );

        // Check if the user already exists
        const hashedPsw: string = await this.hashPassword( password );
        const existingUser = await this.getUser( user, email );

        if ( existingUser )
            throw new Error( `A user with that name or email already exists` );

        // Create the user
        const newUser: User = new User( {
            username: user,
            password: hashedPsw,
            email: email,
            privileges: privilege,
            passwordTag: '',
            meta: meta,
            registerKey: ( activateAccount ? '' : undefined )
        } );

        // Update the database
        const insertResult = await this._userCollection.insertOne( newUser.generateDbEntry() );

        // Assing the ID and pass the user on
        newUser.dbEntry = insertResult.ops[ 0 ];

        // All users have default stats created for them
        await BucketManager.get.createUserStats( newUser.dbEntry.username! );

        return newUser;
    }

	/**
	 * Deletes a user from the database
	 * @param user The unique username or email of the user to remove
	 */
    async removeUser( user: string ): Promise<void> {
        let username: string = '';
        const userInstance = await this.getUser( user );

        if ( !userInstance )
            throw new Error( 'Could not find any users with those credentials' );

        if ( userInstance.dbEntry.privileges === UserPrivileges.SuperAdmin )
            throw new Error( 'You cannot remove a super user' );

        username = userInstance.dbEntry.username!;

        await BucketManager.get.removeUser( username );
        const result = await this._userCollection.deleteOne( <Modepress.IUserEntry>{ _id: userInstance.dbEntry._id! } );

        if ( result.deletedCount === 0 )
            throw new Error( 'Could not remove the user from the database' );

        // Send event to sockets
        const token: Modepress.SocketTokens.IUserToken = { username: username, type: ClientInstructionType[ ClientInstructionType.Removed ] };
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
    async getUser( user: string, email?: string ): Promise<User | null> {
        email = email !== undefined ? email : user;

        // Validate user string
        user = validator.trim( user );

        if ( !user || user === '' )
            throw new Error( 'Please enter a valid username' );

        if ( !validator.isAlphanumeric( user ) && !validator.isEmail( user ) )
            throw new Error( 'Please only use alpha numeric characters for your username' );

        const target = [ { email: email }, { username: user }];

        // Search the collection for the user
        const userEntry: Modepress.IUserEntry = await this._userCollection.find( { $or: target } ).limit( 1 ).next();
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
    async logIn( username: string = '', pass: string = '', rememberMe: boolean = true, request: http.ServerRequest, response: http.ServerResponse ): Promise<User> {
        await this.logOut( request, response );
        const user: User | null = await this.getUser( username );

        // If no user - then reject
        if ( !user )
            throw new Error( 'The username or password is incorrect.' );

        // Validate password
        pass = validator.trim( pass );
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
        let result = await this._userCollection.updateOne( { _id: user.dbEntry._id }, { $set: { lastLoggedIn: user.dbEntry.lastLoggedIn } } );

        if ( result.matchedCount === 0 )
            throw new Error( 'Could not find the user in the database, please make sure its setup correctly' );

        const session: Session = await this.sessionManager.createSession( !rememberMe, response );
        result = await this._userCollection.updateOne( { _id: user.dbEntry._id }, { $set: { sessionId: session.sessionId } } );

        if ( result.matchedCount === 0 )
            throw new Error( 'Could not find the user in the database, please make sure its setup correctly' );

        // Send logged in event to socket
        const token: Modepress.SocketTokens.IUserToken = { username: username, type: ClientInstructionType[ ClientInstructionType.Login ] };
        await CommsController.singleton.processClientInstruction( new ClientInstruction( token, null, username ) );
        return user;
    }

	/**
	 * Removes a user by his email or username
	 * @param username The username or email of the user
	 * @returns True if the user was in the DB or false if they were not
	 */
    async remove( username: string = '' ): Promise<boolean> {
        const user = await this.getUser( username );

        // There was no user
        if ( !user )
            return false;

        // Remove the user from the DB
        const result = await this._userCollection.deleteOne( { _id: user.dbEntry._id } );
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
    async setMeta( user: Modepress.IUserEntry, data?: any ): Promise<boolean | any> {

        // There was no user
        if ( !user )
            return false;

        // Remove the user from the DB
        await this._userCollection.updateOne( <Modepress.IUserEntry>{ _id: user._id }, { $set: <Modepress.IUserEntry>{ meta: ( data ? data : {} ) } } );
        return data;
    }

    /**
	 * Sets a meta value on the user. This updates the user's meta value by name
	 * @param user The user
     * @param name The name of the meta to set
     * @param data The value of the meta to set
	 * @returns {Promise<boolean|any>} Returns the value of the set
	 */
    async setMetaVal( user: Modepress.IUserEntry, name: string, val: any ): Promise<boolean | any> {
        // There was no user
        if ( !user )
            return false;

        const datum = 'meta.' + name;
        const updateToken = { $set: {} };
        updateToken.$set[ datum ] = val;

        // Remove the user from the DB
        await this._userCollection.updateOne( <Modepress.IUserEntry>{ _id: user._id }, updateToken );
        return val;
    }

    /**
	 * Gets the value of user's meta by name
	 * @param user The user
     * @param name The name of the meta to get
	 * @returns The value to get
	 */
    async getMetaVal( user: Modepress.IUserEntry, name: string ): Promise<boolean | any> {

        // There was no user
        if ( !user )
            return false;

        // Remove the user from the DB
        const result: Modepress.IUserEntry = await this._userCollection.find( <Modepress.IUserEntry>{ _id: user._id } ).project( { _id: 0, meta: 1 } ).limit( 1 ).next();
        return result.meta[ name ];
    }

    /**
	 * Gets the meta data of a user
	 * @param user The user
	 * @returns The value to get
	 */
    async getMetaData( user: Modepress.IUserEntry ): Promise<boolean | any> {

        // There was no user
        if ( !user )
            return false;

        // Remove the user from the DB
        const result: Modepress.IUserEntry = await this._userCollection.find( <Modepress.IUserEntry>{ _id: user._id } ).project( { _id: 0, meta: 1 } ).limit( 1 ).next();
        return result.meta;
    }

    /**
	 * Gets the total number of users
     * @param searchPhrases Search phrases
	 */
    async numUsers( searchPhrases?: RegExp ): Promise<number> {

        const findToken = { $or: [ <Modepress.IUserEntry>{ username: <any>searchPhrases }, <Modepress.IUserEntry>{ email: <any>searchPhrases }] };
        const result: number = await this._userCollection.count( findToken );
        return result;
    }

	/**
	 * Prints user objects from the database
	 * @param limit The number of users to fetch
	 * @param startIndex The starting index from where we are fetching users from
     * @param searchPhrases Search phrases
	 */
    async getUsers( startIndex: number = 0, limit: number = 0, searchPhrases?: RegExp ): Promise<Array<User>> {
        const findToken = { $or: [ <Modepress.IUserEntry>{ username: <any>searchPhrases }, <Modepress.IUserEntry>{ email: <any>searchPhrases }] };
        const results: Array<Modepress.IUserEntry> = await this._userCollection.find( findToken ).skip( startIndex ).limit( limit ).toArray();
        const users: Array<User> = [];
        for ( let i = 0, l = results.length; i < l; i++ )
            users.push( new User( results[ i ] ) );

        return users;
    }

    /**
     * Creates the user manager singlton
     */
    static create( users: mongodb.Collection, sessions: mongodb.Collection, config: Modepress.IConfig ): UserManager {
        return new UserManager( users, sessions, config );
    }

    /**
     * Gets the user manager singlton
     */
    static get get(): UserManager {
        return UserManager._singleton;
    }
}