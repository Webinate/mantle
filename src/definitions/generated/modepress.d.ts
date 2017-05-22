import { IServer } from './i-server';
import { IGMail, IMailgun } from './i-mail';
import { IGoogleProperties } from './i-google';
import { IWebsocket } from './i-socket';

/*
    * Represents the details of the admin user
    */
export interface IAdminUser {
    username: string;
    email: string;
    password: string;
}

/**
 * Describes the controller structure of plugins in the config file
 */
export interface IControllerPlugin {
    path: string;
}

/**
 * A server configuration
 */
export interface IConfig {

    /**
     * The length of time the assets should be cached on a user's browser. The default is 30 days.
     */
    cacheLifetime: number;

    /**
     * If true, then modepress will render bot page crawls stripping all javascript source tags after the page is fully loaded. This
     * is accomplished by sending a headless browser request to the page and waiting for it to fully load. Once loaded the page is saved
     * and stripped of scripts. Any subsequent calls to the page will result in the saved page being presented as long as the expiration
     * has not been exceeded - if it has then a new render is done.
     * e.g. '127.0.0.1:3000'
     */
    enableAjaxRendering: boolean;

    /**
     * The length of time a render is kept in the DB before being updated. Stored in seconds.
     * e.g. 86400 (1 day)
     */
    ajaxRenderExpiration: number;

    /**
     * The name of the mongo database to use
     */
    databaseName: string;

    /**
     * The database host we are listening on
     */
    databaseHost: string;

    /**
     * The port number the mongo database is listening on
     */
    databasePort: number;

    /**
     * The URL of the webinate-users api
     */
    usersURL: string;

    /**
     * An array of servers for each host / route that modepress is supporting
     */
    servers: Array<IServer>;

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

    /**
     * User related settings
     */
    userSettings: {
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

        // These need to be removed eventually
        secure: boolean;
        hostName: string;
        portHTTP: number;
        portHTTPS: number;
        apiPrefix: string;
    }

    sessionSettings: {
        /*
        * If set, the session will be restricted to URLs underneath the given path.
        * By default the path is '/', which means that the same sessions will be shared across the entire domain.
        * e.g: '/'
        */
        sessionPath?: string;

        /**
         * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
         * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
         * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
         * Default is blank ''
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
         * Should the session be secure
         */
        secure: boolean;
    }

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
     * Information relating to the Google storage platform
     *
     'google': {
         'keyFile': '',
         'mail':{
             'apiEmail': '',
             'from': ''
         },
         'bucket': {
                 'projectId': '',
                 'bucketsCollection': 'buckets',
                 'filesCollection': 'files'
             }
         }
     */
    google: IGoogleProperties;

    /**
     * Information regarding the websocket communication. Used for events and IPC
     */
    websocket: IWebsocket;


}
/*
* Users stores data on an external cloud bucket with Google
*/
export interface IGoogleProperties {
    /*
    * Path to the key file
    */
    keyFile: string;

    /*
    * Describes the bucket details
    */
    bucket: {

        /*
        * Project ID
        */
        projectId: string;

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

        /**
         * The length of time the assets should be cached on a user's browser.
         * eg:  2592000000 or 30 days
         */
        cacheLifetime: number;
    }
}

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
/**
 * Defines routes and the paths they take
 */
export interface IPath {
    /**
     * The express end point route to use. E.g. '*' or '/some-route'
     */
    path: string;

    /**
     * The file to be sent when the path resolves. This must be a file path and point to a file that exists.
     * The file could be any valid html file. Alternatively it can be rendered as an express jade file (.jade)
     */
    index: string;

    /**
     * An array of javascript file paths that should be added to the page when it loads
     * e.g. ['./plugins/my-plugin/index.js']
     */
    plugins: Array<string>;

    /**
     * An array of javascript variables that will be sent to any jade templates for a given path
     */
    variables: { [ name: string ]: string };
}
import { IPath } from './i-path';
import { ISSL } from './i-ssl';
import { IControllerPlugin } from './i-config';

/**
 * Defines routes and the paths of a host / port
 */
export interface IServer {
    /**
     * The host we listening for
    */
    host: string;

    /**
     * The length of time the assets should be cached on a user's browser. The default is 30 days.
     */
    cacheLifetime: number;

    /**
     * The port number of the host
     */
    portHTTP: number;

    /**
     * An array of domains that are CORS approved
     */
    approvedDomains: Array<string>;

    /**
     * An array of folder paths that can be used to fetch static content
     */
    staticFilesFolder: Array<string>;

    /**
     * An object to describe SSL properties.
     * eg : {
            portHTTPS: 443;
            sslKey: './PATH_TO_KEY';
            sslCert: './PATH_TO_CERT';
            sslRoot: './PATH_TO_ROOT';
            sslIntermediate: './PATH_TO_INTERMEDIATE';
            sslPassPhrase: 'PASSPHRASE';
        * }
        */
    ssl: ISSL;

    /**
     * An array of IPath objects that define routes and where they go to
     */
    paths: Array<IPath>

    /**
     * An array of controllers associated with this server
     */
    controllers: Array<IControllerPlugin>

    /**
    * The URL to redirect to after the user attempts to activate their account.
    * User's can activate their account via the '/activate-account' URL, and after its validation the server will redirect to this URL
    * adding a query ?message=You%20have%20activated%20your%20account&status=success.
    * The status can be either 'success' or 'error'
    *
    * eg: 'http://localhost/notify-user'
    */
    accountRedirectURL: string;

    /**
     * The URL sent to users emails for when their password is reset. This URL should
     * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
     *
     * eg: 'http://localhost/reset-password'
     */
    passwordResetURL: string;
}
import { ISSL } from './i-ssl';

/*
* Users stores data on an external cloud bucket with Google
*/
export interface IWebsocket {
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
     * The hostname of the socket connection
     * eg: 'localhost'
     */
    host: string;

    /**
     * An array of safe origins for socket communication
     * [
     *   'webinate.net',
     *   'localhost'
     * ]
     */
    approvedSocketDomains: Array<string>;

    /**
     * An object to descrine the socket ssl properties
     */
    ssl?: ISSL;
}
export interface ISSL {

    /**
     * The port number to use for SSL. Only applicable if ssl is true.
     */
    portHTTPS: number;

    /**
     * The path of the SSL private key. Only applicable if ssl is true.
     */
    sslKey: string;

    /**
     * The path of the SSL certificate file (usually provided by a third vendor). Only applicable if ssl is true.
     */
    sslCert: string;

    /**
     * The path of the SSL root file (usually provided by a third vendor). Only applicable if ssl is true.
     */
    sslRoot: string;

    /**
     * The path of the SSL intermediate/link file (usually provided by a third vendor). Only applicable if ssl is true.
     */
    sslIntermediate: string;

    /**
     * The password to use for the SSL (optional). Only applicable if ssl is true.
     */
    sslPassPhrase: string;
}
/**
 * A list of optional parameters that can be passed to schema items that determines how they are
 * serialized
 */
export interface ISchemaOptions {

    /**
     * If true, foreign keys will serialize their values
     */
    expandForeignKeys?: boolean;

    /**
     * When fetching schema data, we need to define if the query is verbose or not.
     * If true, then all data is returned and is not stripped of sensitive items
     */
    verbose: boolean

    /**
     * Defines how many levels deep foreign key traversal iterates. If 1, then only the immediate foreign keys
     * are fetched. For example  Model X references model Y, which in turn references another model X. When expandMaxDepth=1
     * only model X and its model Y instance are returned (Model Y's reference to any X is ignored)
     * Only read if expandForeignKeys is true.
     */
    expandMaxDepth?: number;

    /**
     * Defines an array of schema names that must not be expanded when expandForeignKeys is true.
     */
    expandSchemaBlacklist?: Array<string>;
}
/**
 * The interface for describing each user's bucket
 */
export interface IBucketEntry {
    _id?: any;
    name?: string;
    identifier?: string;
    user?: string;
    created?: number;
    memoryUsed?: number;
    meta?: any;
}
import { IModelEntry } from './i-model-entry';

/*
* Describes the category model
*/
export interface ICategory extends IModelEntry {
    title?: string;
    slug?: string;
    parent?: string;
    description?: string;
}
import { IModelEntry } from './i-model-entry';

/*
* Describes the comment model
*/
export interface IComment extends IModelEntry {
    author?: string;
    post?: string;
    parent?: string;
    public?: boolean;
    content?: string;
    children?: Array<string>;
    createdOn?: number;
    lastUpdated?: number;
}
/**
 * The interface for describing each user's file
 */
export interface IFileEntry {
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
    parentFile?: string | null;
    meta?: any;
}
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
import { IModelEntry } from './i-model-entry';

/*
* Base interface for all models
*/
export interface IModelEntry {
    _id?: any;
    _requiredDependencies?: Array<{ collection: string, _id: any }>
    _optionalDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
    _arrayDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
}
import { IModelEntry } from './i-model-entry';

/*
* Describes the post model
*/
export interface IPost extends IModelEntry {
    author?: string;
    title?: string;
    slug?: string;
    brief?: string;
    public?: boolean;
    content?: string;
    featuredImage?: string;
    categories?: Array<string>;
    tags?: Array<string>;
    createdOn?: number;
    lastUpdated?: number;
}
import { IModelEntry } from './i-model-entry';

/*
* Describes the cache renders model
*/
export interface IRender extends IModelEntry {
    url?: string;
    expiration?: number;
    createdOn?: number;
    updateDate?: number;
    html?: string;
}

/*
* An interface to describe the data stored in the database from the sessions
*/
export interface ISessionEntry {
    _id?: any;
    sessionId?: string;
    data?: any;
    expiration?: number;
}

/**
 * The interface for describing each user's bucket
 */
export interface IStorageStats {
    user?: string;
    memoryUsed?: number;
    memoryAllocated?: number;
    apiCallsUsed?: number;
    apiCallsAllocated?: number;
}

/*
* An interface to describe the data stored in the database for users
*/
export interface IUserEntry {
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
import { IUserEntry } from '../models/i-user-entry';

/**
 * An interface used to describe requests that have been authenticated by a session id
 */
export interface IAuthReq extends Express.Request {
    _isAdmin: boolean;
    _verbose: boolean;
    _user: IUserEntry | null;
    _target: IUserEntry | null;
    body: any;
    headers: any;
    params: any;
    query: any;
}
/*
* The token used for logging in
*/
export interface ILoginToken {
    username: string;
    password: string;
    rememberMe: boolean;
}
export interface IMessage {
    name: string;
    email: string;
    message: string;
    phone?: string;
    website?: string;
}
/*
* The token used for registration
*/
export interface IRegisterToken {
    username: string;
    password: string;
    email: string;
    meta?: any;
    privileges?: number;
}
import { IFileEntry } from '../models/i-file-entry';
import { IBucketEntry } from '../models/i-bucket-entry';

/*
 * Describes the different types of event interfaces we can use to interact with the system via web sockets
 */
export namespace SocketTokens {
    export type ClientInstructionType = (
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

    export type ServerInstructionType = (
        'MetaRequest'
    );

    /**
     * The base interface for all data that is serialized & sent to clients or server.
     * The type property describes to the reciever what kind of data to expect.
     */
    export interface IToken {
        error?: string;
        type: ClientInstructionType | ServerInstructionType | string;
    }

    /*
     * Describes a get/set Meta request, which can fetch or set meta data for a given user
     * if you provide a property value, then only that specific meta property is edited.
     * If not provided, then the entire meta data is set.
     */
    export interface IMetaToken extends IToken {
        username?: string;
        property?: string;
        val?: any;
    }

    /*
     * The socket user event
     */
    export interface IUserToken extends IToken {
        username: string;
    }

    /*
     * Interface for file added events
     */
    export interface IFileToken extends IToken {
        username: string;
        file: IFileEntry;
    }

    /*
     * Interface for a bucket being added
     */
    export interface IBucketToken extends IToken {
        username: string;
        bucket: IBucketEntry
    }
}
/*
 * Token used to describe how the upload went
 */
export interface IUploadToken {
    file: string;
    field: string;
    filename: string;
    error: boolean;
    errorMsg: string;
    url: string;
    extension: string
}
import { IUserEntry } from '../models/i-user-entry';
import { IPost } from '../models/i-post';
import { IComment } from '../models/i-comment';
import { IBucketEntry } from '../models/i-bucket-entry';
import { ICategory } from '../models/i-category';
import { IFileEntry } from '../models/i-file-entry';
import { IMailer } from '../models/i-mail';
import { IRender } from '../models/i-render';
import { IStorageStats } from '../models/i-storage-stats';
import { ISessionEntry } from '../models/i-session-entry';
import { IUploadToken } from './i-upload-token';
import { IServer } from '../config/i-server';

/*
* The most basic response from the server. The base type of all responses.
*/
export interface IResponse {
    message: string;
    error: boolean;
}

/*
* A response for when bulk items are deleted
*/
export interface IRemoveResponse extends IResponse {
    itemsRemoved: Array<{ id: string; error: boolean; errorMsg: string; }>;
}

/*
* A GET request that returns the status of a user's authentication
*/
export interface IAuthenticationResponse extends IResponse {
    authenticated: boolean;
    user?: IUserEntry;
}

/*
* A POST request that returns the details of a text upload
*/
export interface IUploadTextResponse extends IResponse {
    token: IUploadToken;
}

/*
* A POST request that returns the details of a binary upload
*/
export interface IUploadBinaryResponse extends IResponse {
    token: IUploadToken;
}

/*
* A POST request that returns the details of a multipart form upload
*/
export interface IUploadResponse extends IResponse {
    tokens: Array<IUploadToken>
}

/*
* A GET request that returns a data item
*/
export interface IGetResponse<T> extends IResponse {
    data: T;
}

/*
* A GET request that returns an array of data items
*/
export interface IGetArrayResponse<T> extends IResponse {
    count: number;
    data: Array<T>;
}

export interface IGetRenders extends IGetArrayResponse<IRender> { }
export interface IGetPosts extends IGetArrayResponse<IPost> { }
export interface IGetComments extends IGetArrayResponse<IComment> { }
export interface IGetPost extends IGetResponse<IPost> { }
export interface IGetComment extends IGetResponse<IComment> { }
export interface IGetCategory extends IGetResponse<ICategory> { }
export interface IGetCategories extends IGetArrayResponse<ICategory> { }
export interface IGetUser extends IGetResponse<IUserEntry> { }
export interface IGetUserStorageData extends IGetResponse<IStorageStats> { }
export interface IGetUsers extends IGetArrayResponse<IUserEntry> { count: number; }
export interface IGetSessions extends IGetArrayResponse<ISessionEntry> { }
export interface IGetBuckets extends IGetArrayResponse<IBucketEntry> { }
export interface IGetFile extends IGetResponse<IFileEntry> { }
export interface IGetFiles extends IGetArrayResponse<IFileEntry> { }
export interface IRemoveFiles extends IGetArrayResponse<string> { }
