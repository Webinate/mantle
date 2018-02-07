import { IMailer, IGMail } from '../types/config/properties/i-mail';
import * as google from 'googleapis';
/**
 * A simple class for sending mail using Google Mail's API
 */
export declare class GMailer implements IMailer {
    gmail: google.GMail;
    private _keyFile;
    private _apiEmail;
    private _authorizer;
    private _scopes;
    private _debugMode;
    /**
     * Creates an instance of the mailer
     */
    constructor(debugMode: boolean);
    /**
     * Attempts to initialize the mailer
     * @param options The gmail options for this mailer
     */
    initialize(options: IGMail): Promise<boolean>;
    /**
     * Attempts to authorize the google service account credentials
     */
    private authorize(credentials);
    /**
     * Sends an email using Google's Gmail API
     * @param to The email address to send the message to
     * @param from The email we're sending from
     * @param subject The message subject
     * @param msg The message to be sent
     */
    sendMail(to: string, from: string, subject: string, msg: string): Promise<boolean>;
    /**
     * Builds a message string in base64 encoding
     * @param to The email address to send the message to
     * @param from The email we're sending from
     * @param subject The message subject
     * @param message The message to be sent
     */
    private buildMessage(to, from, subject, message);
}
