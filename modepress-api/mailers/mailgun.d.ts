import { IMailer, IMailgun } from '../types/config/properties/i-mail';
/**
 * A simple class for sending mail using Google Mail's API
 */
export declare class Mailguner implements IMailer {
    private _debugMode;
    private mailgun;
    /**
     * Creates an instance of the mailer
     */
    constructor(debugMode: boolean);
    /**
     * Attempts to initialize the mailer
     * @param options The mailgun options for this mailer
     */
    initialize(options: IMailgun): Promise<boolean>;
    /**
     * Sends an email using mailgun
     * @param to The email address to send the message to
     * @param from The email we're sending from
     * @param subject The message subject
     * @param msg The message to be sent
     */
    sendMail(to: string, from: string, subject: string, msg: string): Promise<boolean>;
}
