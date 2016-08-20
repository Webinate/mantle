declare module UsersInterface
{
    export class User
    {
        dbEntry: IUserEntry;
    }

    /*
    * Describes the different types of event interfaces we can use to interact with the system via web sockets
    */
    export module SocketTokens
    {
        export type ClientInstructionType =  (
            'Login' |
            'Logout' |
            'Activated' |
            'Removed' |
            'FileUploaded' |
            'FileRemoved' |
            'BucketUploaded' |
            'BucketRemoved' |
            'MetaRequest'
        );

        export type ServerInstructionType =  (
            'MetaRequest'
        );

        /**
         * The base interface for all data that is serialized & sent to clients or server.
         * The type property describes to the reciever what kind of data to expect.
         */
        export interface IToken
        {
            error? : string;
            type: ClientInstructionType | ServerInstructionType | string;
        }

        /*
        * Describes a get/set Meta request, which can fetch or set meta data for a given user
        * if you provide a property value, then only that specific meta property is edited.
        * If not provided, then the entire meta data is set.
        */
        export interface IMetaToken extends IToken
        {
            username?: string;
            property?: string;
            val?: any;
        }

        /*
        * The socket user event
        */
        export interface IUserToken extends IToken
        {
            username: string;
        }

        /*
        * Interface for file added events
        */
        export interface IFileToken extends IToken
        {
            username: string;
            file: IFileEntry;
        }

        /*
        * Interface for a bucket being added
        */
        export interface IBucketToken extends IToken
        {
            username: string;
            bucket: IBucketEntry
        }
    }

    /*
    * An interface to describe the data stored in the database for users
    */
    export interface IUserEntry
    {
        _id?: any;
        username?: string;
        email?: string;
        password?: string;
        registerKey?: string;
        sessionId?: string;
        createdOn?: number;
        lastLoggedIn?: number;
        privileges?: number;
        passwordTag?: string;
        meta?: any;
    }

    /**
    * The interface for describing each user's bucket
    */
    export interface IBucketEntry
    {
        _id?:any;
        name?: string;
        identifier?: string;
        user?: string;
        created?: number;
        memoryUsed?: number;
        meta?: any;
    }

    /**
    * The interface for describing each user's bucket
    */
    export interface IStorageStats
    {
        user?: string;
        memoryUsed?: number;
        memoryAllocated?: number;
        apiCallsUsed?: number;
        apiCallsAllocated?: number;
    }

    /**
    * The interface for describing each user's file
    */
    export interface IFileEntry
    {
        _id?: any;
        name?: string;
        user?: string;
        identifier?: string;
        bucketId?: string;
        bucketName?: string;
        publicURL?: string;
        created?: number;
        size?: number;
        mimeType?: string;
        isPublic?: boolean;
        numDownloads?: number;
        parentFile?: string;
        meta?: any;
    }

    /**
    * Adds a logged in user to the request object
    */
    export interface AuthRequest extends Express.Request
    {
        _user: User;
        _target: User;
        params: any;
        body: any;
        query: any;
    }

    /*
    * An interface to describe the data stored in the database from the sessions
    */
    export interface ISessionEntry
    {
        _id?: any;
        sessionId?: string;
        data?: any;
        expiration?: number;
    }

    /*
    * Users stores data on an external cloud bucket with Google
    */
    export interface IWebsocket
    {
        /**
         * A key that must be provided in the headers of socket client connections. If the connection headers
         * contain 'users-api-key', and it matches this key, then the connection is considered an authorized connection.
         */
        socketApiKey: string;

        /**
        * The port number to use for web socket communication. You can use this port to send and receive events or messages
        * to the server.
        * e.g. 8080
        */
        port: number;


        /**
        * An array of safe origins for socket communication
        * [
        *   "webinate.net",
        *   "localhost"
        * ]
        */
        approvedSocketDomains: Array<string>;
    }

    export interface IMailer
    {
        /**
         * Attempts to initialize the mailer
         * @param {IMailOptions} options
         * @returns {Promise<boolean>}
         */
        initialize(options: IMailOptions) : Promise<boolean>

        /**
         * Sends an email
         * @param {stirng} to The email address to send the message to
         * @param {stirng} from The email we're sending from
         * @param {stirng} subject The message subject
         * @param {stirng} msg The message to be sent
         * @returns {Promise<boolean>}
         */
        sendMail( to : string, from : string, subject : string, msg : string ): Promise<boolean>
    }

    export interface IMailOptions { }

    /**
     * Options for a gmail mailer
     */
    export interface IGMail extends IMailOptions
    {
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
    export interface IMailgun extends IMailOptions
    {
        /** The domain for associated with the mailgun account */
        domain: string;

        /** The api key for your mailgun account */
        apiKey: string;
    }

    /*
    * Users stores data on an external cloud bucket with Google
    */
    export interface IGoogleProperties
    {
        /*
        * Path to the key file
        */
        keyFile: string;

        /*
        * Describes the bucket details
        */
        bucket : {

            /*
            * Project ID
            */
            projectId: string;

            /**
            * The name of the mongodb collection for storing bucket details
            * eg: "buckets"
            */
            bucketsCollection: string;

            /**
            * The name of the mongodb collection for storing file details
            * eg: "files"
            */
            filesCollection: string;

            /**
            * The name of the mongodb collection for storing user stats
            * eg: "storageAPI"
            */
            statsCollection: string;

            /**
            * The length of time the assets should be cached on a user's browser.
            * eg:  2592000000 or 30 days
            */
            cacheLifetime: number;
        }
    }

    /*
    * The default response  format
    */
    export interface IResponse
    {
        message: string;
        error: boolean;
    }

    /*
    * A GET request that returns the status of a user's authentication
    */
    export interface IAuthenticationResponse extends IResponse
    {
        authenticated: boolean;
        user?: IUserEntry;
    }

    /*
    * Token used to describe how the upload went
    */
    export interface IUploadToken
    {
        file: string;
        field: string;
        filename: string;
        error: boolean;
        errorMsg: string;
        url: string;
    }

    /*
    * A POST request that returns the details of a text upload
    */
    export interface IUploadTextResponse extends IResponse
    {
        token: IUploadToken;
    }

    /*
    * A POST request that returns the details of a binary upload
    */
    export interface IUploadBinaryResponse extends IResponse
    {
        token: IUploadToken;
    }

    /*
    * A POST request that returns the details of a multipart form upload
    */
    export interface IUploadResponse extends IResponse
    {
        tokens: Array<IUploadToken>
    }

    /*
    * A GET request that returns an array of data items
    */
    export interface IGetArrayResponse<T> extends IResponse
    {
        data: Array<T>;
        count: number;
    }

    /*
    * A GET request that returns a single data item
    */
    export interface IGetResponse<T> extends IResponse
    {
        data: T;
    }

    /*
    * The token used for logging in
    */
    export interface ILoginToken
    {
        username: string;
        password: string;
        rememberMe: boolean;
    }

    /*
    * The token used for registration
    */
    export interface IRegisterToken
    {
        username: string;
        password: string;
        email: string;
        captcha?: string;
        meta?: any;
        privileges?: number;
    }

    /*
    * Represents the details of the admin user
    */
    export interface IAdminUser
    {
        username: string;
        email: string;
        password: string;
    }

    /*
    * Options for configuring the API
    */
    export interface IConfig
    {
        /**
        * If true, then the server runs in debug mode. When running tests you should have the application
        * run in debug mode. You can set this via the config or else use the --debug=true command in the console.
        * eg: true / false. The default is true.
        */
        debugMode: boolean;

        /**
        * The host to use when listening
        * eg: "localhost" or "192.168.0.1" or "0.0.0.0"
        */
        host: string;

        /**
        * The domain or host name of the site. This is the external URL to use for connecting to users.
        * eg: "webinate.net"
        */
        hostName: string;

        /**
        * The RESTful path of this service.
        * eg: If "/api", then the API url would be 127.0.0.1:80/api (or rather host:port/api)
        */
        apiPrefix: string;

        /**
        * The URL to redirect to after the user attempts to activate their account.
        * User's can activate their account via the "/activate-account" URL, and after its validation the server will redirect to this URL
        * adding a query ?message=You%20have%20activated%20your%20account&status=success.
        * The status can be either 'success' or 'error'
        *
        * eg: "http://localhost/notify-user"
        */
        accountRedirectURL: string;

        /**
        * The URL sent to users emails for when their password is reset. This URL should
        * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
        *
        * eg: "http://localhost/reset-password"
        */
        passwordResetURL: string;

        /**
        * An array of approved domains that can access this API.
        * e.g. ["webinate\\.net", "127.0.0.1:80", "http:\/\/127.0.0.1"] etc...
        */
        approvedDomains: Array<string>;

        /**
        * The port number to use for regular HTTP requests.
        * e.g. 80
        */
        portHTTP: number;

        /**
        * The port number to use for SSL requests
        * e.g. 443
        */
        portHTTPS: number;

        /**
        * Information regarding the websocket communication. Used for events and IPC
        */
        websocket: IWebsocket;

        /**
        * The name of the mongo database name
        */
        databaseName: string;

        /**
        * The name of the mongodb collection for storing user details
        * eg: "users"
        */
        userCollection: string;

        /**
        * The name of the mongodb collection for storing session details
        * eg: "sessions"
        */
        sessionCollection: string;

        /**
        * The host the DB is listening on
        * e.g. "127.0.0.1"
        */
        databaseHost: string;

        /**
        * The port number mongodb is listening on
        * e.g. 27017
        */
        databasePort: number;

        /**
        * If true, the API will try to secure its communications
        * e.g. false/true
        */
        ssl: boolean;

        /**
        * The path to the SSL private key
        */
        sslKey: string;

        /**
        * The path to the SSL certificate authority root file
        */
        sslRoot: string;

        /**
        * The path to the SSL certificate authority intermediate file
        */
        sslIntermediate: string;

        /**
        * The path to the SSL certificate file path
        */
        sslCert: string;

        /**
        * The SSL pass phrase (if in use)
        */
        sslPassPhrase: string;

        /*
        * If set, the session will be restricted to URLs underneath the given path.
        * By default the path is "/", which means that the same sessions will be shared across the entire domain.
        * e.g: "/"
        */
        sessionPath?: string;

        /**
        * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
        * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
        * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
        * Default is blank ""
        */
        sessionDomain?: string;

        /**
        * A persistent connection is one that will last after the user closes the window and visits the site again (true).
        * A non-persistent that will forget the user once the window is closed (false)
        * e.g: true/false. Default is true
        */
        sessionPersistent?: boolean;

        /**
        * The default length of user sessions in seconds
        * e.g 1800
        */
        sessionLifetime?: number;

        /**
        * The longer period length of user sessions in seconds (Typically when a user clicks a 'remember me' type of button)
        * e.g (60 * 60 * 24 * 2) = 2 days
        */
        sessionLifetimeExtended?: number;

        /**
        * The private key to use for Google captcha
        * Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
        */
        captchaPrivateKey: string;

        /**
        * The public key to use for Google captcha
        * Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
        */
        captchaPublicKey: string;

        /**
        * The administrative user. This is the root user that will have access to the information in the database.
        * This can be anything you like, but try to use passwords that are hard to guess
        * eg:

        "adminUser": {
                "username": "root",
                "email": "root_email@host.com",
                "password": "CHANGE_THIS_PASSWORD"
            }
        */
        adminUser: IAdminUser;

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
            type: "gmail" | "mailgun";

             /**
             * Options to be sent to the desired mailer
             */
            options: IGMail | IMailgun;
        }

        /**
        * Information relating to the Google storage platform
        *
        "google": {
            "keyFile": "",
            "mail":{
                "apiEmail": "",
                "from": ""
            },
            "bucket": {
                    "projectId": "",
                    "bucketsCollection": "buckets",
                    "filesCollection": "files"
                }
            }
        */
        google: IGoogleProperties;
    }

    export interface IGetUser extends IGetResponse<IUserEntry> { }
    export interface IGetUserStorageData extends IGetResponse<IStorageStats> { }
    export interface IGetUsers extends IGetArrayResponse<IUserEntry> { count: number; }
    export interface IGetSessions extends IGetArrayResponse<ISessionEntry> { }
    export interface IGetBuckets extends IGetArrayResponse<IBucketEntry> { }
    export interface IGetFile extends IGetResponse<IFileEntry> { }
    export interface IGetFiles extends IGetArrayResponse<IFileEntry> { }
    export interface IRemoveFiles extends IGetArrayResponse<string> { }
}

declare module "webinate-users"
{
    export = UsersInterface;
}