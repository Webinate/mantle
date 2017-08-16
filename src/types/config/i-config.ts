declare module 'modepress' {
  /*
   * Represents the details of the admin user
   */
  export interface IAdminUser {
    username: string;
    email: string;
    password: string;
  }

  /**
   * A server configuration
   */
  export interface IConfig {

    /**
     * The folder where modepress will search for client projects to add to the runtime.
     * This setting must represent a path string. Each folder in the path will be analyzed
     * and any with a valid modepress.json will be added.
     */
    clientsFolder: string;

    /**
     * Describes each of the media buckets available to the
     * modepress servers.
     */
    remotes: {
      'google': IGoogleProperties;
      'local': ILocalBucket;
    }

    /**
     * The length of time a render is kept in the DB before being updated. Stored in seconds.
     * e.g. 86400 (1 day)
     */
    ajaxRenderExpiration: number;


    database: {
      /**
       * The name of the mongo database to use
       */
      name: string;

      /**
       * The database host we are listening on
       */
      host: string;

      /**
       * The port number the mongo database is listening on
       */
      port: number;
    }

    /**
     * An array of servers for each host / route that modepress is supporting
     */
    // servers: Array<IClient>;

    /**
     * If debug is true, certain functions will be emulated and more information logged
     */
    debug: boolean;

    /**
     * Settings related to sending emails
     */
    mail: {

      /**
       * The from field sent to recipients
       */
      from: string;

      /**
       * Specify the type of mailer to use.
       * Currently we support either 'gmail' or 'mailgun'
       */
      type: 'gmail' | 'mailgun';

      /**
       * Options to be sent to the desired mailer
       */
      options: IGMail | IMailgun;
    }

    collections: {
      /**
       * The name of the mongodb collection for storing user details
       * eg: 'users'
       */
      userCollection: string;

      /**
       * The name of the mongodb collection for storing session details
       * eg: 'sessions'
       */
      sessionCollection: string;

      /**
       * The name of the mongodb collection for storing bucket details
       * eg: 'buckets'
       */
      bucketsCollection: string;

      /**
       * The name of the mongodb collection for storing file details
       * eg: 'files'
       */
      filesCollection: string;

      /**
       * The name of the mongodb collection for storing user stats
       * eg: 'storageAPI'
       */
      statsCollection: string;
    }

    /**
     * Describes the session settings
     */
    sessionSettings: ISession;

    /**
     * The administrative user. This is the root user that will have access to the information in the database.
     * This can be anything you like, but try to use passwords that are hard to guess
     * eg:

        'adminUser': {
                'username': 'root',
                'email': 'root_email@host.com',
                'password': 'CHANGE_THIS_PASSWORD'
            }
        */
    adminUser: IAdminUser;

    /**
     * Information regarding the websocket communication. Used for events and IPC
     */
    websocket: IWebsocket;
  }
}