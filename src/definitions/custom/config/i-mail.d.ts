declare namespace Modepress {

    export interface IMailOptions { }

    export interface IMailer {
        /**
         * Attempts to initialize the mailer
         * @param {IMailOptions} options
         * @returns {Promise<boolean>}
         */
        initialize( options: IMailOptions ): Promise<boolean>

        /**
         * Sends an email
         * @param {stirng} to The email address to send the message to
         * @param {stirng} from The email we're sending from
         * @param {stirng} subject The message subject
         * @param {stirng} msg The message to be sent
         * @returns {Promise<boolean>}
         */
        sendMail( to: string, from: string, subject: string, msg: string ): Promise<boolean>
    }

    /**
     * Options for a gmail mailer
     */
    export interface IGMail extends IMailOptions {
        /*
         * The email account to use the gmail API through. This account must be authorized to
         * use this application. See: https://admin.google.com/AdminHome?fral=1#SecuritySettings:
         */
        apiEmail: string;

        /*
         * Path to the key file
         */
        keyFile: string;
    }

    /**
     * Options for a mailgun mailer
     */
    export interface IMailgun extends IMailOptions {
        /**
         * The domain for associated with the mailgun account
         */
        domain: string;

        /**
         * The api key for your mailgun account
         */
        apiKey: string;
    }
}