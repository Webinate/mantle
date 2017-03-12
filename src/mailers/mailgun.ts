'use strict';

import * as winston from 'winston';
import * as def from 'webinate-users';

/**
 * A simple class for sending mail using Google Mail's API
 */
export class Mailguner implements def.IMailer {
    private _debugMode: boolean;
    private mailgun: MailGun.Instance;

    /**
     * Creates an instance of the mailer
     */
    constructor( debugMode: boolean ) {
        this._debugMode = debugMode;
    }

    /**
     * Attempts to initialize the mailer
     * @param options The mailgun options for this mailer
     */
    initialize( options: def.IMailgun ): Promise<boolean> {

        return new Promise(( resolve ) => {
            this.mailgun = require( 'mailgun-js' )( { apiKey: options.apiKey, domain: options.domain } );
            resolve( true );
        } );
    }

    /**
     * Sends an email using mailgun
     * @param to The email address to send the message to
     * @param from The email we're sending from
     * @param subject The message subject
     * @param msg The message to be sent
     */
    sendMail( to: string, from: string, subject: string, msg: string ): Promise<boolean> {
        return new Promise(( resolve, reject ) => {

            winston.info( `Sending email to: ${to}`, { process: process.pid } );

            if ( this._debugMode )
                return resolve( true );

            winston.info( `Sending: ${msg}`, { process: process.pid } );

            // Send the message
            this.mailgun.messages().send( { from: from, subject: subject, text: msg, to: to }, function( err, response ) {

                if ( err ) {
                    winston.error( `Could not send email to ${to}: ${err}`, { process: process.pid } );
                    return reject( err );
                }

                winston.info( `Email sent ${JSON.stringify( response )} unmodified`, { process: process.pid } );
                return resolve( true );
            } );
        } );
    }
}