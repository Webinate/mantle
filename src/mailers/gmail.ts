'use strict';

import * as google from 'googleapis';
import * as googleAuth from 'google-auth-library';
import * as fs from 'fs';
import { error as logError, info } from '../logger';
import * as def from 'webinate-users';
import * as yargs from 'yargs';

const args = yargs.argv;

/**
 * A simple class for sending mail using Google Mail's API
 */
export class GMailer implements def.IMailer {
    public gmail: google.GMail;
    private _keyFile: any;
    private _apiEmail: string;
    private _authorizer: any;
    private _scopes: Array<string>;
    private _debugMode: boolean;

    /**
     * Creates an instance of the mailer
     */
    constructor( debugMode: boolean ) {
        this._debugMode = debugMode;
        this._scopes = [
            'https://mail.google.com/',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/gmail.send'
        ];
    }

    /**
     * Attempts to initialize the mailer
     * @param options The gmail options for this mailer
     */
    initialize( options: def.IGMail ): Promise<boolean> {

        return new Promise(( resolve ) => {

            this.gmail = google.gmail( 'v1' );
            this._keyFile = args.keyFile || JSON.parse( fs.readFileSync( options.keyFile, 'utf8' ) );
            this._apiEmail = options.apiEmail;

            // Authorize a client with the loaded credentials
            this.authorize( this._keyFile )
                .then( function() {
                    info( `Connected to Google Authentication` );
                    resolve( true )
                } )
                .catch( function( err: Error ) {
                    logError( `Could not authorize Google API: ${err.message}` );
                    resolve( false );
                } );
        } );
    }

    /**
     * Attempts to authorize the google service account credentials
     */
    private authorize( credentials ): Promise<GoogleAuth.JWT> {

        return new Promise<GoogleAuth.JWT>(( resolve, reject ) => {

            const auth = new googleAuth();
            const jwt = new auth.JWT(
                credentials.client_email,
                null,
                credentials.private_key,
                this._scopes,
                this._apiEmail
            );

            jwt.authorize(( err ) => {

                if ( err )
                    return reject( err );

                this._authorizer = jwt;
                resolve( jwt );
            } );
        } );
    }

    /**
     * Sends an email using Google's Gmail API
     * @param to The email address to send the message to
     * @param from The email we're sending from
     * @param subject The message subject
     * @param msg The message to be sent
     */
    sendMail( to: string, from: string, subject: string, msg: string ): Promise<boolean> {

        return new Promise(( resolve, reject ) => {

            info( `Sending email to: ${to}` );

            // Build the message string
            const message = this.buildMessage( to, from, subject, msg );

            if ( this._debugMode )
                return resolve( true );

            info( `Sending: ${message}` );

            // Send the message
            this.gmail.users.messages.insert( {
                auth: this._authorizer,
                userId: 'me',
                resource: { raw: message }
            }, ( err, response ) => {

                if ( err ) {
                    logError( `Could not send email to ${to}: ${err}` );
                    return reject( err );
                }

                // See explanation on next line
                if ( this._apiEmail !== to ) {
                    info( `Email sent ${JSON.stringify( response )} unmodified` );
                    return resolve( true );
                }

                // When you send an email to yourself - it doesnt go to the inbox in gmail.
                // You actually have to modify the sent email labels to tell it to do so.
                // Sending to other emails is fine though
                this.gmail.users.messages.modify( {
                    auth: this._authorizer,
                    userId: 'me',
                    id: response.id,
                    resource: { addLabelIds: [ 'UNREAD', 'INBOX', 'IMPORTANT' ] }
                }, function( err ) {
                    if ( !err ) {
                        info( `Modified email sent ${JSON.stringify( response )}` );
                        return resolve( true );
                    }
                    else {
                        logError( `Could not modify email ${JSON.stringify( response )}: ${err}` );
                        return reject( err );
                    }
                } );
            } );
        } );
    }

    /**
     * Builds a message string in base64 encoding
     * @param to The email address to send the message to
     * @param from The email we're sending from
     * @param subject The message subject
     * @param message The message to be sent
     */
    private buildMessage( to: string, from: string, subject: string, message: string ): string {
        const str = [ 'Content-Type: text/plain; charset=\'UTF-8\'\r\n',
            'MIME-Version: 1.0\r\n',
            'Content-Transfer-Encoding: 7bit\r\n',
            'to: ', to, '\r\n',
            'from: ', from, '\r\n',
            'subject: ', subject, '\r\n\r\n',
            message
        ].join( '' );

        // Encode the mail into base 64
        const encodedMail = new Buffer( str ).toString( 'base64' ).replace( /\+/g, '-' ).replace( /\//g, '_' );
        return encodedMail;
    }
}