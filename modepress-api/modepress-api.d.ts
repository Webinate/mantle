/// <reference types="node" />
/// <reference types="express" />
/// <reference types="ws" />
declare module 'modepress' {
    /**
     * A server configuration
     */
    interface IConfig {
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
            /**
             * If the property is a string, it must point
             * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as IGoogleProperties.
             */
            'google': string | IGoogleProperties;
            /**
             * If the property is a string, it must point
             * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as ILocalBucket.
             */
            'local': string | ILocalBucket;
        };
        /**
         * The length of time a render is kept in the DB before being updated. Stored in seconds.
         * e.g. 86400 (1 day)
         */
        ajaxRenderExpiration: number;
        /**
         * If the property is a string, it must point
         * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as IDatabase.
         */
        database: string | IDatabase;
        /**
         * If debug is true, certain functions will be emulated and more information logged
         */
        debug: boolean;
        /**
         * Settings related to sending emails
         */
        mail: IMailProperties;
        /**
         * A list of collection names
         */
        collections: ICollectionProperties;
        /**
         * Describes the session settings
         */
        sessionSettings: ISession;
        /**
         * The administrative user. This is the root user that will have access to the information in the database.
         * This can be anything you like, but try to use passwords that are hard to guess. If the property is a string, it must point
         * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as below.
         * eg:
         * 'adminUser': {
         *  'username': 'root',
         *  'email': 'root_email@host.com',
         *  'password': 'CHANGE_THIS_PASSWORD'
         * }
         */
        adminUser: string | IAdminUser;
        /**
         * Information regarding the websocket communication. Used for events and IPC
         */
        websocket: IWebsocket;
    }
}
declare module 'modepress' {
    interface IAdminUser {
        username: string;
        email: string;
        password: string;
    }
}
declare module 'modepress' {
    interface IControllerOptions {
        path?: string;
    }
    interface IServer {
        /**
         * The port number of the host
         */
        port: number;
        /**
         * The host we listening for. The default is 'localhost'
         */
        host: string;
        /**
         * An array of folder paths that can be used to fetch static content
         */
        staticAssets?: Array<string>;
        /**
         * The length of time the assets should be cached on a user's browser in milliseconds. The default is 30 days.
         */
        staticAssetsCache?: number;
        /**
         * An object to describe SSL properties.
         * eg : {
         *   portHTTPS: 443;
         *   sslKey: './PATH_TO_KEY';
         *   sslCert: './PATH_TO_CERT';
         *   sslRoot: './PATH_TO_ROOT';
         *   sslIntermediate: './PATH_TO_INTERMEDIATE';
         *   sslPassPhrase: 'PASSPHRASE';
         * }
         */
        ssl?: ISSL;
        /**
         * An array of cors approved domains
         */
        corsApprovedDomains?: string[];
    }
    /**
     * This interface represents a json file that describes how modepress should load a client.
     * Clients are plugins that are loaded dynamically by modepress on startup.
     */
    interface IClient {
        server: string | IServer;
        name: string;
        /**
         * An array of controllers associated with this server
         */
        controllers: IControllerOptions[];
    }
}
declare module 'modepress' {
    interface ICollectionProperties {
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
}
declare module 'modepress' {
    interface IDatabase {
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
}
declare module 'modepress' {
    interface IGoogleProperties extends IRemoteOptions {
        keyFile: string;
        projectId: string;
    }
}
declare module 'modepress' {
    interface IMailProperties {
        /**
         * Specify the type of mailer to use.
         * Currently we support either 'gmail' or 'mailgun'
         */
        type: 'gmail' | 'mailgun';
        /**
         * Options to be sent to the desired mailer
         */
        options: string | IGMail | IMailgun;
    }
    interface IMailOptions {
        /**
         * The from field sent to recipients
         */
        from: string;
    }
    interface IMailer {
        /**
         * Attempts to initialize the mailer
         * @param {IMailOptions} options
         * @returns {Promise<boolean>}
         */
        initialize(options: IMailOptions): Promise<boolean>;
        /**
         * Sends an email
         * @param {stirng} to The email address to send the message to
         * @param {stirng} from The email we're sending from
         * @param {stirng} subject The message subject
         * @param {stirng} msg The message to be sent
         * @returns {Promise<boolean>}
         */
        sendMail(to: string, from: string, subject: string, msg: string): Promise<boolean>;
    }
    /**
     * Options for a gmail mailer
     */
    interface IGMail extends IMailOptions {
        apiEmail: string;
        keyFile: string;
    }
    /**
     * Options for a mailgun mailer
     */
    interface IMailgun extends IMailOptions {
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
declare module 'modepress' {
    /**
     * The base interface for all remote options
     */
    interface IRemoteOptions {
    }
    /**
     * The properties for setting up a local bucket
     */
    interface ILocalBucket extends IRemoteOptions {
        /**
         * The system path to a system directory to store the media in.
         * The directory must have write access
         */
        path: string;
        /**
         * The public URL for downloading the media
         */
        url: string;
    }
}
declare module 'modepress' {
    interface ISession {
        path: string;
        /**
         * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
         * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
         * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
         */
        domain: string;
        /**
         * A persistent connection is one that will last after the user closes the window and visits the site again (true).
         * A non-persistent that will forget the user once the window is closed (false)
         */
        persistent: boolean;
        /**
         * If true, the cookie will be encrypted
         */
        secure: boolean;
        /**
         * If you wish to create a persistent session (one that will last after the user closes the window and visits the site again) you must specify a lifetime as a number of seconds.
         * The lifetime controls both when the browser's cookie will expire, and when the session object will be freed by the sessions module.
         * By default, the browser cookie will expire when the window is closed, and the session object will be freed 24 hours after the last request is seen.
         */
        lifetime: number;
    }
}
declare module 'modepress' {
    interface IWebsocket {
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
}
declare module 'modepress' {
    interface ISSL {
        /**
         * The port number to use for SSL. Only applicable if ssl is true.
         */
        port: number;
        /**
         * The path of the SSL private key. Only applicable if ssl is true.
         */
        key: string;
        /**
         * The path of the SSL certificate file (usually provided by a third vendor). Only applicable if ssl is true.
         */
        cert: string;
        /**
         * The path of the SSL root file (usually provided by a third vendor). Only applicable if ssl is true.
         */
        root: string;
        /**
         * The path of the SSL intermediate/link file (usually provided by a third vendor). Only applicable if ssl is true.
         */
        intermediate: string;
        /**
         * The password to use for the SSL (optional). Only applicable if ssl is true.
         */
        passPhrase: string;
    }
}
declare module "types/interfaces/i-remote" {
    import { Readable } from 'stream';
    module 'modepress' {
        type IUploadOptions = {
            headers: any;
            filename: string;
        };
        /**
         * This interface describes a remote destination that is used to upload
         * files sent from modepress. Remote's can be thought of as drives on a
         * computer or buckets in a cloud.
         */
        interface IRemote {
            initialize(options: IRemoteOptions): Promise<void>;
            createBucket(id: string, options?: any): Promise<string>;
            uploadFile(bucket: string, source: Readable, uploadOptions: IUploadOptions): Promise<string>;
            removeFile(bucket: string, id: string): Promise<void>;
            removeBucket(id: string): Promise<void>;
            generateUrl(bucketIdentifier: string, fileIdentifier: string): string;
        }
    }
}
declare module 'modepress' {
    type ITextOptions = {
        /** Specify the minimum number of characters for use with this text item */
        minCharacters?: number;
        /** Specify the maximum number of characters for use with this text item */
        maxCharacters?: number;
        /** If true, the text is cleaned of HTML before insertion. The default is true */
        htmlClean?: boolean;
    };
    type ITextArrOptions = {
        /** Specify the minimum number of items that can be allowed */
        minItems?: number;
        /** Specify the maximum number of items that can be allowed */
        maxItems?: number;
        /** Specify the minimum number of characters for each text item */
        minCharacters?: number;
        /** Specify the maximum number of characters for each text item */
        maxCharacters?: number;
    };
    type NumType = 'Int' | 'Float';
    type INumOptions = {
        /** The minimum value the value can be */
        min?: number;
        /** The maximum value the value can be */
        max?: number;
        /** The type of number the schema represents */
        type?: NumType;
        /** The number of decimal places to use if the type is a Float */
        decimalPlaces?: number;
    };
    type INumArrOptions = {
        /** Specify the minimum number of items that can be allowed */
        minItems?: number;
        /** Specify the maximum number of items that can be allowed */
        maxItems?: number;
        /** Specify the minimum a number can be */
        min?: number;
        /** Specify the maximum a number can be */
        max?: number;
        /** What type of numbers to expect */
        type?: 'Int' | 'Float';
        /** The number of decimal places to use if the type is a Float */
        decimalPlaces?: number;
    };
    type IIdArrOptions = {
        /** Specify the minimum number of items that can be allowed */
        minItems?: number;
        /** Specify the maximum number of items that can be allowed */
        maxItems?: number;
    };
    type IHtmlOptions = {
        /** The tags allowed by the html parser */
        allowedTags?: string[];
        /** The attributes allowed by each attribute */
        allowedAttributes?: {
            [name: string]: Array<string>;
        };
        /** If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you */
        errorBadHTML?: boolean;
        /** Specify the minimum number of characters for use with this text item */
        minCharacters?: number;
        /** Specify the maximum number of characters for use with this text item */
        maxCharacters?: number;
    };
    type IForeignKeyOptions = {
        /** If true, then the key is allowed to be null */
        keyCanBeNull?: boolean;
        /** If true, then key will only be nullified if the target is removed. If false, then the instance that owns this item must be removed as it cannot exist without the target. */
        canAdapt?: boolean;
    };
    type IDateOptions = {
        /** If true, the date will always be updated to use the current date */
        useNow?: boolean;
    };
}
declare module 'modepress' {
    interface IAuthOptions extends IBaseControler {
        /**
         * The URL to redirect to after the user attempts to activate their account.
         * User's can activate their account via the '/activate-account' URL, and after its validation the server will redirect to this URL
         * adding a query ?message=You%20have%20activated%20your%20account&status=success.
         * The status can be either 'success' or 'error'
         *
         * eg: 'http://localhost/auth/notify-user'
         */
        accountRedirectURL: string;
        /**
         * The URL sent to users emails for when their password is reset. This URL should
         * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
         *
         * eg: 'http://localhost/auth/reset-password'
         */
        passwordResetURL: string;
        /**
         * The URL sent to users emails for when they need to activate their account
         *
         * eg: 'http://localhost/auth/activate-account
         */
        activateAccountUrl: string;
    }
}
declare module 'modepress' {
    interface IBaseControler {
        /**
         * The root path of the controller's endpoint.
         * eg: "/api"
         */
        rootPath?: string;
    }
}
declare module 'modepress' {
    interface IFileOptions extends IBaseControler {
        /**
         * The length of time the assets should be cached on a user's browser.
         * eg:  2592000000 or 30 days
         */
        cacheLifetime: number;
    }
}
declare module 'modepress' {
    interface IRenderOptions extends IBaseControler {
        /**
         * The length of time the assets should be cached on a user's browser.
         * eg:  2592000000 or 30 days
         */
        cacheLifetime: number;
    }
}
declare module 'modepress' {
    /**
     * A list of optional parameters that can be passed to schema items that determines how they are
     * serialized
     */
    interface ISchemaOptions {
        /**
         * If true, foreign keys will serialize their values
         */
        expandForeignKeys?: boolean;
        /**
         * When fetching schema data, we need to define if the query is verbose or not.
         * If true, then all data is returned and is not stripped of sensitive items
         */
        verbose: boolean;
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
}
declare module 'modepress' {
    /**
     * The interface for describing each user's bucket
     */
    interface IBucketEntry {
        _id?: any;
        name?: string;
        identifier?: string;
        user?: string;
        created?: number;
        memoryUsed?: number;
        meta?: any;
    }
}
declare module 'modepress' {
    interface ICategory extends IModelEntry {
        title?: string;
        slug?: string;
        parent?: string;
        description?: string;
    }
}
declare module 'modepress' {
    interface IComment extends IModelEntry {
        author?: string;
        post?: string;
        parent?: string;
        public?: boolean;
        content?: string;
        children?: Array<string | any>;
        createdOn?: number;
        lastUpdated?: number;
    }
}
declare module 'modepress' {
    /**
     * The interface for describing each user's file
     */
    interface IFileEntry {
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
}
declare module 'modepress' {
    interface IMailOptions {
    }
    interface IMailer {
        /**
         * Attempts to initialize the mailer
         * @param {IMailOptions} options
         * @returns {Promise<boolean>}
         */
        initialize(options: IMailOptions): Promise<boolean>;
        /**
         * Sends an email
         * @param {stirng} to The email address to send the message to
         * @param {stirng} from The email we're sending from
         * @param {stirng} subject The message subject
         * @param {stirng} msg The message to be sent
         * @returns {Promise<boolean>}
         */
        sendMail(to: string, from: string, subject: string, msg: string): Promise<boolean>;
    }
    /**
     * Options for a gmail mailer
     */
    interface IGMail extends IMailOptions {
        apiEmail: string;
        keyFile: string;
    }
    /**
     * Options for a mailgun mailer
     */
    interface IMailgun extends IMailOptions {
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
declare module 'modepress' {
    interface IModelEntry {
        _id?: any;
        _requiredDependencies?: Array<{
            collection: string;
            _id: any;
        }>;
        _optionalDependencies?: Array<{
            collection: string;
            propertyName: string;
            _id: any;
        }>;
        _arrayDependencies?: Array<{
            collection: string;
            propertyName: string;
            _id: any;
        }>;
    }
}
declare module 'modepress' {
    interface IPost extends IModelEntry {
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
}
declare module 'modepress' {
    interface IRender extends IModelEntry {
        url?: string;
        expiration?: number;
        createdOn?: number;
        updateDate?: number;
        html?: string;
    }
}
declare module 'modepress' {
    interface ISessionEntry extends IModelEntry {
        _id?: any;
        sessionId: string;
        data: any;
        expiration: number;
    }
}
declare module 'modepress' {
    /**
      * The interface for describing each user's bucket
      */
    interface IStorageStats extends IModelEntry {
        user?: string;
        memoryUsed?: number;
        memoryAllocated?: number;
        apiCallsUsed?: number;
        apiCallsAllocated?: number;
    }
}
declare module 'modepress' {
    interface IUserEntry {
        _id?: any;
        username: string;
        email: string;
        password: string;
        registerKey: string;
        sessionId: string;
        createdOn: number;
        lastLoggedIn: number;
        privileges: number;
        passwordTag: string;
        meta: any;
    }
}
declare module "types/tokens/i-auth-request" {
    import { Request } from 'express';
    module 'modepress' {
        /**
         * An interface used to describe requests that have been authenticated by a session id
         */
        interface IAuthReq extends Request {
            _user: IUserEntry | null;
            _target: IUserEntry | null;
        }
    }
}
declare module 'modepress' {
    interface ILoginToken {
        username: string;
        password: string;
        rememberMe: boolean;
    }
}
declare module 'modepress' {
    interface IMessage {
        name: string;
        email: string;
        message: string;
        phone?: string;
        website?: string;
    }
}
declare module 'modepress' {
    interface IRegisterToken {
        username: string;
        password: string;
        email: string;
        meta?: any;
        privileges?: number;
    }
}
declare module 'modepress' {
    namespace SocketTokens {
        type ClientInstructionType = ('Login' | 'Logout' | 'Activated' | 'Removed' | 'FileUploaded' | 'FileRemoved' | 'BucketUploaded' | 'BucketRemoved' | 'MetaRequest');
        type ServerInstructionType = ('MetaRequest');
        /**
         * The base interface for all data that is serialized & sent to clients or server.
         * The type property describes to the reciever what kind of data to expect.
         */
        interface IToken {
            error?: string;
            type: ClientInstructionType | ServerInstructionType | string;
        }
        interface IMetaToken extends IToken {
            username?: string;
            property?: string;
            val?: any;
        }
        interface IUserToken extends IToken {
            username: string;
        }
        interface IFileToken extends IToken {
            username: string;
            file: IFileEntry;
        }
        interface IBucketToken extends IToken {
            username: string;
            bucket: IBucketEntry;
        }
    }
}
declare module 'modepress' {
    interface IUploadToken {
        file: string;
        field: string;
        filename: string;
        error: boolean;
        errorMsg: string;
        url: string;
        extension: string;
    }
}
declare module 'modepress' {
    interface IResponse {
        message: string;
    }
    interface IRemoveResponse extends IResponse {
        itemsRemoved: Array<{
            id: string;
            error: boolean;
            errorMsg: string;
        }>;
    }
    interface IAuthenticationResponse extends IResponse {
        authenticated: boolean;
        user?: IUserEntry;
    }
    interface IUploadTextResponse extends IResponse {
        token: IUploadToken;
    }
    interface IUploadBinaryResponse extends IResponse {
        token: IUploadToken;
    }
    interface IUploadResponse extends IResponse {
        tokens: Array<IUploadToken>;
    }
    interface IGetResponse<T> extends IResponse {
        data: T;
    }
    interface IGetArrayResponse<T> extends IResponse {
        count: number;
        data: Array<T>;
    }
    namespace AuthTokens {
        /** GET /auth/authenticated */
        namespace Authenticated {
            type Body = void;
            type Response = IAuthenticationResponse;
        }
        /** GET /auth/logout */
        namespace Logout {
            type Body = void;
            type Response = IResponse;
        }
        /** GET /auth/activate-account */
        namespace ActivateAccount {
            type Body = void;
            type Response = void;
        }
        /** POST /auth/login */
        namespace Login {
            type Body = ILoginToken;
            type Response = IAuthenticationResponse;
        }
        /** POST /auth/register */
        namespace Register {
            type Body = IRegisterToken;
            type Response = IAuthenticationResponse;
        }
        /** PUT /auth/password-reset */
        namespace PasswordReset {
            type Body = void;
            type Response = IResponse;
        }
        /** PUT /auth/:user/approve-activation */
        namespace ApproveActivation {
            type Body = void;
            type Response = IResponse;
        }
        /** GET /auth/:user/resend-activation */
        namespace ResendActivation {
            type Body = void;
            type Response = IResponse;
        }
        /** GET /auth/:user/request-password-reset */
        namespace RequestPasswordReset {
            type Body = void;
            type Response = IResponse;
        }
    }
    namespace UserTokens {
        /** GET /users/ */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<IUserEntry>;
        }
        /** POST /users/ */
        namespace Post {
            type Body = IUserEntry;
            type Response = IGetResponse<IUserEntry>;
        }
        /** GET /users/:user/meta */
        namespace GetUserMeta {
            type Body = void;
            type Response = any;
        }
        /** GET /users/:user/meta/:name */
        namespace GetUserMetaVal {
            type Body = void;
            type Response = any;
        }
        /** GET /users/:username */
        namespace GetOne {
            type Body = void;
            type Response = IGetResponse<IUserEntry>;
        }
        /** DELETE /users/:username */
        namespace DeleteOne {
            type Body = void;
            type Response = IResponse;
        }
        /** POST /users/:user/meta/:name */
        namespace PostUserMeta {
            type Body = any;
            type Response = IResponse;
        }
        /** POST /users/:user/meta */
        namespace PostUserMetaVal {
            type Body = any;
            type Response = IResponse;
        }
    }
    namespace StatTokens {
        /** GET /stats/users/:user/get-stats */
        namespace GetOne {
            type Body = void;
            type Response = IGetResponse<IStorageStats>;
        }
        /** POST /stats/create-stats/:target */
        namespace Post {
            type Body = void;
            type Response = IStorageStats;
        }
        /** PUT /stats/storage-calls/:target/:value */
        namespace PutStorageCalls {
            type Body = void;
            type Response = IResponse;
        }
        /** PUT /stats/storage-memory/:target/:value */
        namespace PutStorageMemory {
            type Body = void;
            type Response = IResponse;
        }
        /** PUT /stats/storage-allocated-calls/:target/:value */
        namespace PutStorageAlocCalls {
            type Body = void;
            type Response = IResponse;
        }
        /** PUT /stats/storage-allocated-memory/:target/:value */
        namespace PutStorageAlocMemory {
            type Body = void;
            type Response = IResponse;
        }
    }
    namespace SessionTokens {
        /** GET /sessions/ */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<ISessionEntry>;
        }
        /** DELETE /sessions/:id */
        namespace DeleteOne {
            type Body = void;
            type Response = IResponse;
        }
    }
    namespace PostTokens {
        /** GET /posts/ */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<IPost>;
        }
        /**
         * GET /posts/slug/:slug or
         * GET /posts/:id
         * */
        namespace GetOne {
            type Body = void;
            type Response = IGetResponse<IPost>;
        }
        /** DELETE /posts/:id */
        namespace DeleteOne {
            type Body = void;
            type Response = IResponse;
        }
        /** PUT /posts/:id */
        namespace PutOne {
            type Body = IPost;
            type Response = IResponse;
        }
        /** POST /posts/ */
        namespace Post {
            type Body = IPost;
            type Response = IGetResponse<IPost>;
        }
    }
    namespace CommentTokens {
        /** GET /comments/ */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<IComment>;
        }
        /** GET /comments/:id */
        namespace GetOne {
            type Body = void;
            type Response = IGetResponse<IComment>;
        }
        /** DELETE /comments/:id */
        namespace DeleteOne {
            type Body = void;
            type Response = IResponse;
        }
        /** PUT /comments/:id */
        namespace PutOne {
            type Body = IComment;
            type Response = IResponse;
        }
        /** POST /posts/:postId/comments/:parent? */
        namespace Post {
            type Body = IComment;
            type Response = IGetResponse<IComment>;
        }
    }
    namespace CategoriesTokens {
        /** GET /categories/ */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<ICategory>;
        }
        /** DELETE /categories/:id */
        namespace DeleteOne {
            type Body = void;
            type Response = IResponse;
        }
        /** POST /categories */
        namespace Post {
            type Body = ICategory;
            type Response = IGetResponse<ICategory>;
        }
    }
    namespace RenderTokens {
        /** GET /renders/ */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<IRender>;
        }
        /** DELETE /renders/:id */
        namespace DeleteOne {
            type Body = void;
            type Response = IResponse;
        }
        /** DELETE /renders/clear */
        namespace DeleteAll {
            type Body = void;
            type Response = IResponse;
        }
    }
    namespace FileTokens {
        /** GET /files/users/:user/buckets/:bucket */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<IFileEntry>;
        }
        /** PUT /files/:file/rename-file */
        namespace Put {
            type Body = {
                name: string;
            };
            type Response = IResponse;
        }
        /** DELETE /files/:files */
        namespace DeleteAll {
            type Body = void;
            type Response = IGetArrayResponse<string>;
        }
    }
    namespace BucketTokens {
        /** GET /buckets/user/:user */
        namespace GetAll {
            type Body = void;
            type Response = IGetArrayResponse<IBucketEntry>;
        }
        /** POST /buckets/user/:user/:name */
        namespace Post {
            type Body = void;
            type Response = IResponse;
        }
        /** POST /buckets/:bucket/upload/:parentFile? */
        namespace PostFile {
            type Body = any;
            type Response = IUploadResponse;
        }
        /** DELETE /buckets/:buckets */
        namespace DeleteAll {
            type Body = void;
            type Response = IGetArrayResponse<string>;
        }
    }
    namespace EmailTokens {
        /** POST /message-admin */
        namespace Post {
            type Body = IMessage;
            type Response = boolean;
        }
    }
}
declare module "models/schema-items/schema-item" {
    import { ISchemaOptions, IModelEntry } from 'modepress';
    import { Schema } from "models/schema";
    /**
     * A definition of each item in the model
     */
    export class SchemaItem<T> {
        name: string;
        value: T;
        private _sensitive;
        private _unique;
        private _uniqueIndexer;
        private _indexable;
        private _required;
        private _modified;
        private _readOnly;
        constructor(name: string, value: T);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         */
        clone(copy?: SchemaItem<T>): SchemaItem<T>;
        /**
         * Gets if this item is indexable by mongodb
         */
        getIndexable(): boolean;
        /**
         * Sets if this item is indexable by mongodb
         */
        setIndexable(val: boolean): SchemaItem<T>;
        /**
         * Gets if this item is required. If true, then validations will fail if they are not specified
         */
        getRequired(): boolean;
        /**
         * Sets if this item is required. If true, then validations will fail if they are not specified
         */
        setRequired(val: boolean): SchemaItem<T>;
        /**
         * Gets if this item is read only. If true, then the value can only be set when the item is created
         * and any future updates are ignored
         */
        getReadOnly(): boolean;
        /**
         * Sets if this item is required. If true, then the value can only be set when the item is created
         * and any future updates are ignored
         */
        setReadOnly(val: boolean): SchemaItem<T>;
        /**
       * Gets if this item represents a unique value in the database. An example might be a username
       */
        getUnique(): boolean;
        /**
       * Sets if this item represents a unique value in the database. An example might be a username
       */
        setUnique(val: boolean): SchemaItem<T>;
        /**
         * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
         * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
         * a given project. In this case the project item is set as a uniqueIndexer
         */
        getUniqueIndexer(): boolean;
        /**
       * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
         * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
         * a given project. In this case the project item is set as a uniqueIndexer
       */
        setUniqueIndexer(val: boolean): SchemaItem<T>;
        /**
         * Gets if this item is sensitive
         */
        getSensitive(): boolean;
        /**
         * Gets if this item has been edited since its creation
         */
        getModified(): boolean;
        /**
         * Sets if this item is sensitive
         */
        setSensitive(val: boolean): SchemaItem<T>;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
        /**
         * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
         * doing any post update/insert operations
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert(schema: Schema<IModelEntry>, collection: string): Promise<void>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param collection The DB collection that the model was deleted from
         */
        postDelete(schema: Schema<IModelEntry>, collection: string): Promise<void>;
        /**
         * Gets the value of this item in a database safe format
         */
        getDbValue(): T;
        /**
         * Gets the value of this item
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        getValue(options?: ISchemaOptions): Promise<T>;
        /**
         * Sets the value of this item
         * @param {T} val The value to set
         */
        setValue(val: T): T;
    }
}
declare module "models/schema" {
    import { ISchemaOptions, IModelEntry } from 'modepress';
    import { SchemaItem } from "models/schema-items/schema-item";
    /**
     * Gives an overall description of each property in a model
     */
    export class Schema<T extends IModelEntry> {
        private _items;
        dbEntry: T;
        constructor();
        /**
         * Creates a copy of the schema
         */
        clone(): Schema<T>;
        /**
         * Sets a schema value by name
         * @param data The data object we are setting
         * @param allowReadOnlyValues If true, then readonly values can be overwritten (Usually the case when the item is first created)
         */
        set(data: T, allowReadOnlyValues: boolean): void;
        /**
         * Sets a schema value by name
         * @param name The name of the schema item
         * @param val The new value of the item
         */
        setVal(name: string, val: any): void;
        /**
          * De-serializes the schema items from the mongodb data entry.
           * I.e. the data is the document from the DB and the schema item sets its values from the document
         */
        deserialize(data: any): any;
        /**
         * Serializes the schema items into the JSON format for mongodb
         */
        serialize(): any;
        /**
         * Serializes the schema items into a JSON
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        getAsJson(options: ISchemaOptions): Promise<T>;
        /**
         * Checks the values stored in the items to see if they are correct
         * @param checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
         */
        validate(checkForRequiredFields: boolean): Promise<this>;
        /**
         * Called after a model instance and its schema has been validated and inserted/updated into the database. Useful for
         * doing any post update/insert operations
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert(collection: string): Promise<this>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param collection The DB collection that the model was deleted from
         */
        postDelete(collection: string): Promise<this>;
        /**
         * Gets a schema item from this schema by name
         * @param val The name of the item
         */
        getByName(val: string): SchemaItem<any> | null;
        /**
         * Adds a schema item to this schema
         * @param val The new item to add
         */
        add(val: SchemaItem<any>): SchemaItem<any>;
        /**
         * Removes a schema item from this schema
         * @param val The name of the item or the item itself
         */
        remove(val: SchemaItem<any> | string): void;
        /**
         * Gets the schema items associated with this schema
         */
        getItems(): Array<SchemaItem<any>>;
        /**
         * Gets a string representation of all fields that are unique
         */
        uniqueFieldNames(): string;
    }
}
declare module "utils/logger" {
    /**
     * Initializes the logger
     */
    export function initializeLogger(): void;
    /**
     * Logs an warning message
     * @param message The message to log
     * @param meta Optional meta information to store with the message
     */
    export function warn(message: string, meta?: any): Promise<{}>;
    /**
     * Returns if logging is enabled
     */
    export function enabled(): boolean;
    /**
     * Logs an info message
     * @param message The message to log
     * @param meta Optional meta information to store with the message
     */
    export function info(message: string, meta?: any): Promise<{}>;
    /**
     * Logs an error message
     * @param message The message to log
     * @param meta Optional meta information to store with the message
     */
    export function error(message: string, meta?: any): Promise<{}>;
    /**
     * Clears the console
     */
    export function clear(): void;
}
declare module "models/schema-items/schema-number" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { INumOptions, NumType } from 'modepress';
    /**
     * A numeric schema item for use in Models
     */
    export class SchemaNumber extends SchemaItem<number> {
        min: number;
        max: number;
        type: NumType;
        decimalPlaces: number;
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The default value of this item
         */
        constructor(name: string, val: number, options?: INumOptions);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         */
        clone(copy?: SchemaNumber): SchemaNumber;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "models/schema-items/schema-text" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { ITextOptions } from 'modepress';
    /**
     * A text scheme item for use in Models
     */
    export class SchemaText extends SchemaItem<string> {
        minCharacters: number;
        maxCharacters: number;
        htmlClean: boolean;
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The text of this item
         * @param options Optional params
         */
        constructor(name: string, val: string, options?: ITextOptions);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         * @returns
         */
        clone(copy?: SchemaText): SchemaText;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "models/schema-items/schema-bool" {
    import { SchemaItem } from "models/schema-items/schema-item";
    /**
     * A bool scheme item for use in Models
     */
    export class SchemaBool extends SchemaItem<boolean> {
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The value of this item
         */
        constructor(name: string, val: boolean);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
          */
        clone(copy?: SchemaBool): SchemaBool;
        /**
         * Always true
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "models/schema-items/schema-date" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { IDateOptions } from 'modepress';
    /**
     * A date scheme item for use in Models
     */
    export class SchemaDate extends SchemaItem<number> {
        useNow: boolean;
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The date of this item. If none is specified the Date.now() number is used.
         */
        constructor(name: string, val?: number, options?: IDateOptions);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         * @returns
         */
        clone(copy?: SchemaDate): SchemaDate;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
        /**
       * Gets the value of this item
       */
        getValue(): Promise<number>;
    }
}
declare module "models/schema-items/schema-text-array" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { ITextArrOptions } from 'modepress';
    /**
     * A text scheme item for use in Models
     */
    export class SchemaTextArray extends SchemaItem<Array<string>> {
        minItems: number;
        maxItems: number;
        minCharacters: number;
        maxCharacters: number;
        /**
         * Creates a new schema item that holds an array of text items
         * @param name The name of this item
         * @param val The text array of this schema item
         */
        constructor(name: string, val: Array<string>, options?: ITextArrOptions);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         * @returns
         */
        clone(copy?: SchemaTextArray): SchemaTextArray;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "models/schema-items/schema-json" {
    import { SchemaItem } from "models/schema-items/schema-item";
    /**
     * A json scheme item for use in Models
     */
    export class SchemaJSON extends SchemaItem<any> {
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The text of this item
         */
        constructor(name: string, val: any);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         */
        clone(copy?: SchemaJSON): SchemaJSON;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "utils/utils" {
    /**
     * Checks a string to see if its a valid mongo id
     * @param str
     * @returns True if the string is valid
     */
    export function isValidObjectID(str?: string): boolean;
    /**
     * Generates a random string
     * @param len The size of the string
     */
    export function generateRandString(len: number): string;
}
declare module "models/schema-items/schema-foreign-key" {
    import { ISchemaOptions, IModelEntry, IForeignKeyOptions } from 'modepress';
    import { SchemaItem } from "models/schema-items/schema-item";
    import { ObjectID } from 'mongodb';
    import { Schema } from "models/schema";
    export type FKeyValues = ObjectID | string | IModelEntry | null;
    /**
     * Represents a mongodb ObjectID of a document in separate collection.
     * Foreign keys are used as a way of relating models to one another. They can be required or optional.
     * Required keys will mean that the current document cannot exist if the target does not. Optional keys
     * will simply be nullified if the target no longer exists.
     */
    export class SchemaForeignKey extends SchemaItem<FKeyValues> {
        targetCollection: string;
        keyCanBeNull: boolean;
        canAdapt: boolean;
        curLevel: number;
        private _targetDoc;
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The string representation of the foreign key's _id
         * @param targetCollection The name of the collection to which the target exists
         */
        constructor(name: string, val: string, targetCollection: string, options?: IForeignKeyOptions);
        /**
         * Creates a clone of this item
         */
        clone(copy?: SchemaForeignKey): SchemaForeignKey;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
        /**
         * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
         * doing any post update/insert operations
         * @param instance The model instance that was inserted or updated
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert(schema: Schema<IModelEntry>, collection: string): Promise<void>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param instance The model instance that was deleted
         */
        postDelete(schema: Schema<IModelEntry>, collection: string): Promise<void>;
        /**
         * Gets the value of this item
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        getValue(options: ISchemaOptions): Promise<FKeyValues>;
    }
}
declare module "models/schema-items/schema-id-array" {
    import { ISchemaOptions, IModelEntry } from 'modepress';
    import { SchemaItem } from "models/schema-items/schema-item";
    import { ObjectID } from 'mongodb';
    import { IIdArrOptions } from 'modepress';
    import { Schema } from "models/schema";
    export type IdTypes = string | ObjectID | IModelEntry;
    /**
     * An ID array scheme item for use in Models. Optionally can be used as a foreign key array
     * and return objects of the specified ids. In order for the array to return objects you must
     * specify the targetCollection property. This tells the schema from which model the ids belong to.
     * Currently we only support Id lookups that exist in the same model - i.e. if the ids are of objects
     * in different models we cannot get the object values.
     */
    export class SchemaIdArray extends SchemaItem<IdTypes[]> {
        targetCollection: string;
        minItems: number;
        maxItems: number;
        curLevel: number;
        private _targetDocs;
        /**
         * Creates a new schema item that holds an array of id items
         * @param name The name of this item
         * @param val The array of ids for this schema item
         * @param targetCollection Specify the model name to which all the ids belong. If set the item can expand objects on retreival.
         */
        constructor(name: string, val: Array<string>, targetCollection: string, options?: IIdArrOptions);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         */
        clone(copy?: SchemaIdArray): SchemaIdArray;
        /**
         * Checks the value stored to see if its correct in its current form
         * @returns Returns true if successful or an error message string if unsuccessful
         */
        validate(): Promise<boolean | Error>;
        /**
         * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
         * doing any post update/insert operations
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert(schema: Schema<IModelEntry>, collection: string): Promise<void>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param instance The model instance that was deleted
         */
        postDelete(schema: Schema<IModelEntry>, collection: string): Promise<void>;
        /**
         * Gets the value of this item
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        getValue(options: ISchemaOptions): Promise<Array<string | ObjectID | IModelEntry>>;
    }
}
declare module "models/schema-items/schema-num-array" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { NumType, INumArrOptions } from 'modepress';
    /**
     * A number array scheme item for use in Models
     */
    export class SchemaNumArray extends SchemaItem<Array<number>> {
        minItems: number;
        maxItems: number;
        min: number;
        max: number;
        type: NumType;
        decimalPlaces: number;
        /**
         * Creates a new schema item that holds an array of number items
         * @param name The name of this item
         * @param val The number array of this schema item
         */
        constructor(name: string, val: Array<number>, options?: INumArrOptions);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         */
        clone(copy?: SchemaNumArray): SchemaNumArray;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "models/schema-items/schema-id" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { ObjectID } from 'mongodb';
    /**
     * A mongodb ObjectID scheme item for use in Models
     */
    export class SchemaId extends SchemaItem<ObjectID | string | null> {
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The string representation of the object ID
         */
        constructor(name: string, val: string);
        /**
        * Creates a clone of this item
        * @returns copy A sub class of the copy
        */
        clone(copy?: SchemaId): SchemaId;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "models/schema-items/schema-html" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { IHtmlOptions } from 'modepress';
    /**
    * An html scheme item for use in Models
    */
    export class SchemaHtml extends SchemaItem<string> {
        /**
         * The default tags allowed
         * includes: h3, h4, h5, h6, blockquote, p, a, ul, ol,
         *    nl, li, b, i, strong, em, strike, code, hr, br, div,
         *    table, thead, caption, tbody, tr, th, td, pre
         */
        static defaultTags: Array<string>;
        /**
         * The default allowed attributes for each tag
         */
        static defaultAllowedAttributes: {
            [name: string]: Array<string>;
        };
        allowedTags: Array<string>;
        allowedAttributes: {
            [name: string]: Array<string>;
        };
        errorBadHTML: boolean;
        minCharacters: number;
        maxCharacters: number;
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The text of this item
         */
        constructor(name: string, val: string, options?: IHtmlOptions);
        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         */
        clone(copy?: SchemaHtml): SchemaHtml;
        /**
         * Checks the value stored to see if its correct in its current form
         * @returns Returns true if successful or an error message string if unsuccessful
         */
        validate(): Promise<boolean | Error>;
    }
}
declare module "models/schema-items/schema-item-factory" {
    import * as numbers from "models/schema-items/schema-number";
    import { SchemaText } from "models/schema-items/schema-text";
    import { SchemaBool } from "models/schema-items/schema-bool";
    import { SchemaDate } from "models/schema-items/schema-date";
    import { SchemaTextArray } from "models/schema-items/schema-text-array";
    import { SchemaJSON } from "models/schema-items/schema-json";
    import { SchemaIdArray } from "models/schema-items/schema-id-array";
    import { SchemaNumArray } from "models/schema-items/schema-num-array";
    import { SchemaId } from "models/schema-items/schema-id";
    import { SchemaHtml } from "models/schema-items/schema-html";
    import { SchemaForeignKey } from "models/schema-items/schema-foreign-key";
    export const num: typeof numbers.SchemaNumber;
    export const text: typeof SchemaText;
    export const textArray: typeof SchemaTextArray;
    export const json: typeof SchemaJSON;
    export const idArray: typeof SchemaIdArray;
    export const numArray: typeof SchemaNumArray;
    export const date: typeof SchemaDate;
    export const bool: typeof SchemaBool;
    export const id: typeof SchemaId;
    export const html: typeof SchemaHtml;
    export const foreignKey: typeof SchemaForeignKey;
}
declare module "models/bucket-model" {
    import { Model } from "models/model";
    import { IBucketEntry } from 'modepress';
    /**
     * A model for describing comments
     */
    export class BucketModel extends Model<IBucketEntry> {
        constructor();
    }
}
declare module "models/categories-model" {
    import { Model } from "models/model";
    import { ICategory } from 'modepress';
    /**
     * A model for describing post categories
     */
    export class CategoriesModel extends Model<ICategory> {
        constructor();
    }
}
declare module "models/comments-model" {
    import { Model } from "models/model";
    import { IComment } from 'modepress';
    /**
     * A model for describing comments
     */
    export class CommentsModel extends Model<IComment> {
        constructor();
    }
}
declare module "models/file-model" {
    import { Model } from "models/model";
    import { IFileEntry } from 'modepress';
    /**
     * A model for describing comments
     */
    export class FileModel extends Model<IFileEntry> {
        constructor();
    }
}
declare module "models/posts-model" {
    import { Model } from "models/model";
    import { IPost } from 'modepress';
    /**
     * A model for describing posts
     */
    export class PostsModel extends Model<IPost> {
        constructor();
    }
}
declare module "models/renders-model" {
    import { Model } from "models/model";
    import { IRender } from 'modepress';
    /**
     * Describes a model for page renders that can be served to bots or crawlers
     */
    export class RendersModel extends Model<IRender> {
        constructor();
    }
}
declare module "models/session-model" {
    import { Model } from "models/model";
    import { ISessionEntry } from 'modepress';
    /**
     * A model for describing comments
     */
    export class SessionModel extends Model<ISessionEntry> {
        constructor();
    }
}
declare module "models/storage-stats-model" {
    import { Model } from "models/model";
    import { IStorageStats } from 'modepress';
    /**
     * A model for describing comments
     */
    export class StorageStatsModel extends Model<IStorageStats> {
        constructor();
    }
}
declare module "models/users-model" {
    import { Model } from "models/model";
    import { IUserEntry } from 'modepress';
    /**
     * A model for describing comments
     */
    export class UsersModel extends Model<IUserEntry> {
        constructor();
    }
}
declare module "core/controller-factory" {
    import { IConfig, IModelEntry } from 'modepress';
    import { Db, Collection } from 'mongodb';
    import { Model } from "models/model";
    import { BucketModel } from "models/bucket-model";
    import { CategoriesModel } from "models/categories-model";
    import { CommentsModel } from "models/comments-model";
    import { FileModel } from "models/file-model";
    import { PostsModel } from "models/posts-model";
    import { RendersModel } from "models/renders-model";
    import { SessionModel } from "models/session-model";
    import { StorageStatsModel } from "models/storage-stats-model";
    import { UsersModel } from "models/users-model";
    /**
     * Factory classs for creating & getting models
     */
    export class ControllerFactory {
        private _config;
        private _db;
        private _controllers;
        initialize(config: IConfig, database: Db): void;
        /**
         * Adds the default controllers to the system
         */
        addBaseControllers(): Promise<void>;
        /**
         * Sets up a model's indices
         * @param model The model to setup
         */
        setupIndices(model: Model<IModelEntry>): Promise<Collection<any>>;
        get(type: 'bucket'): BucketModel;
        get(type: 'categories'): CategoriesModel;
        get(type: 'comments'): CommentsModel;
        get(type: 'file'): FileModel;
        get(type: 'posts'): PostsModel;
        get(type: 'renders'): RendersModel;
        get(type: 'session'): SessionModel;
        get(type: 'storage'): StorageStatsModel;
        get(type: 'users'): UsersModel;
        get(type: string): Model<IModelEntry>;
        /**
         * A factory method for creating controllers
         * @param type The type of controller to create
         */
        private create(type);
    }
    const _default: ControllerFactory;
    export default _default;
}
declare module "models/model" {
    import { IModelEntry } from 'modepress';
    import { Collection, Db, ObjectID } from 'mongodb';
    import { Schema } from "models/schema";
    export interface UpdateToken<T extends IModelEntry> {
        error: string | boolean;
        instance: Schema<T>;
    }
    export interface UpdateRequest<T> {
        error: boolean;
        tokens: Array<UpdateToken<T>>;
    }
    export interface ISearchOptions<T> {
        selector?: any;
        sort?: {
            [name: string]: number;
        } | null | T;
        index?: number;
        limit?: number;
        projection?: {
            [name: string]: number;
        };
    }
    /**
     * Models map data in the application/client to data in the database
     */
    export abstract class Model<T extends IModelEntry> {
        collection: Collection<T>;
        schema: Schema<T>;
        private _collectionName;
        /**
           * Creates an instance of a Model
           * @param collection The collection name associated with this model
           */
        constructor(collection: string);
        /**
           * Gets the name of the collection associated with this model
           */
        readonly collectionName: string;
        /**
           * Initializes the model by setting up the database collections
           */
        initialize(collection: Collection, db: Db): Promise<Model<T>>;
        /**
         * Gets the number of DB entries based on the selector
         * @param selector The mongodb selector
         */
        count(selector: any): Promise<number>;
        /**
           * Gets an arrray of instances based on the selector search criteria
           */
        findInstances(options?: ISearchOptions<T>): Promise<Schema<T>[]>;
        /**
         * Gets a model instance based on the selector criteria
         * @param selector The mongodb selector
         * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
         */
        findOne(selector: any, projection?: any): Promise<Schema<T> | null>;
        /**
         * Deletes a instance and all its dependencies are updated or deleted accordingly
         */
        private deleteInstance(schema);
        /**
           * Deletes a number of instances based on the selector. The promise reports how many items were deleted
           */
        deleteInstances(selector: any): Promise<number>;
        /**
         * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
         * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
         * with updating the specific instance.
         * @param selector The selector for updating instances
         * @param data The data object that will attempt to set the instance's schema variables
         * @returns {Promise<UpdateRequest<T>>} An array of objects that contains the field error and instance. Error is false if nothing
         * went wrong when updating the specific instance, and a string message if something did in fact go wrong
         */
        update(selector: any, data: T): Promise<UpdateRequest<T>>;
        /**
         * Checks if the schema item being ammended is unique
         */
        checkUniqueness(schema: Schema<IModelEntry>, id?: ObjectID): Promise<boolean>;
        /**
           * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
           * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
           * by parsing the data object and setting each schema item's value by the name/value in the data object
           */
        createInstance(data?: T): Promise<Schema<IModelEntry>>;
        /**
           * Attempts to insert an array of instances of this model into the database.
           * @param instances An array of instances to save
           */
        insert(instances: Schema<IModelEntry>[]): Promise<Schema<IModelEntry>[]>;
    }
}
declare module "controllers/controller" {
    import { Model } from "models/model";
    import * as mongodb from 'mongodb';
    import * as express from 'express';
    import { IModelEntry } from 'modepress';
    export class Controller {
        private _models;
        constructor(models: Model<IModelEntry>[] | null);
        /**
           * Called to initialize this controller and its related database objects
           */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
           * Gets a model by its collection name
           */
        getModel(collectionName: string): Model<IModelEntry> | null;
    }
}
declare module "core/user" {
    import { IUserEntry } from 'modepress';
    export enum UserPrivileges {
        SuperAdmin = 1,
        Admin = 2,
        Regular = 3,
    }
    export class User {
        dbEntry: IUserEntry;
        /**
           * Creates a new User instance
           * @param dbEntry The data object that represents the user in the DB
           */
        constructor(dbEntry: IUserEntry);
        /**
         * Generates an object that can be sent to clients.
         * @param verbose If true, sensitive database data will be sent (things like passwords will still be obscured)
         */
        generateCleanedData(verbose?: boolean): IUserEntry;
        /**
           * Generates the object to be stored in the database
           */
        generateDbEntry(): IUserEntry;
        /**
           * Creates a random string that is assigned to the dbEntry registration key
           * @param length The length of the password
           */
        generateKey(length?: number): string;
    }
}
declare module "socket-api/socket-event-types" {
    /**
     * Describes the type of token data being sent to connected clients
     */
    export enum ClientInstructionType {
        /**
         * Event sent to clients whenever a user logs in.
         * Event type: IUserToken
         */
        Login = 1,
        /**
         * Event sent to clients whenever a user logs out.
         * Event type: IUserToken
         */
        Logout = 2,
        /**
         * Event sent to clients whenever a user's account is activated.
         * Event type: IUserToken
         */
        Activated = 3,
        /**
         * Event sent to clients whenever a user's account is removed.
         * Event type: IUserToken
         */
        Removed = 4,
        /**
         * Event sent to clients whenever a user uploads a new file.
         * Event type: IFileToken
         */
        FileUploaded = 5,
        /**
         * Event sent to clients whenever a user file is removed.
         * Event type: IFileToken
         */
        FileRemoved = 6,
        /**
         * Event sent to clients whenever a user creates a new bucket
         * Event type: IBucketToken
         */
        BucketUploaded = 7,
        /**
         * Event sent to clients whenever a user removes a bucket
         * Event type: IBucketToken
         */
        BucketRemoved = 8,
        /**
         * Event both sent to the server as well as optionally to clients. Gets or sets user meta data.
         * Event type: IMetaToken
         */
        MetaRequest = 9,
    }
    /**
     * Describes the type of token data being sent to connected clients
     */
    export enum ServerInstructionType {
        /**
         * Event both sent to the server as well as optionally to clients. Gets or sets user meta data.
         * Event type: IMetaToken
         */
        MetaRequest = 9,
    }
}
declare module "core/session" {
    import { ISessionEntry, ISession, IUserEntry } from 'modepress';
    import { ServerRequest } from 'http';
    import { ObjectID } from 'mongodb';
    import { User } from "core/user";
    /**
     * A class to represent session data
     */
    export class Session {
        user: User;
        _id: ObjectID;
        sessionId: string;
        data: any;
        /**
         * The specific time when this session will expire
         */
        expiration: number;
        /**
         * The options of this session system
         */
        options: ISession;
        /**
         * Creates an instance of the session
         */
        constructor(sessionId: string, options: ISession, userEntry: IUserEntry);
        /**
         * Fills in the data of this session from the data saved in the database
         * @param data The data fetched from the database
         */
        deserialize(data: ISessionEntry): void;
        /**
         * Creates an object that represents this session to be saved in the database
         */
        serialize(): ISessionEntry;
        private getHost(request);
        /**
         * This method returns the value to send in the Set-Cookie header which you should send with every request that goes back to the browser, e.g.
         * response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
         */
        getSetCookieHeaderValue(request: ServerRequest): any;
        /**
         * Converts from milliseconds to string, since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
         */
        private dateCookieString(ms);
        /**
         * Pads a string with 0's
         */
        private pad(n);
    }
}
declare module "core/session-manager" {
    import { EventEmitter } from 'events';
    import { ISessionEntry, ISession } from 'modepress';
    import { ServerRequest, ServerResponse } from 'http';
    import { Collection } from 'mongodb';
    import { Session } from "core/session";
    /**
    * A class that manages session data for active users
     */
    export class SessionManager extends EventEmitter {
        private static _singleton;
        private _sessions;
        private _users;
        private _timeout;
        private _cleanupProxy;
        private _options;
        /**
         * Creates an instance of a session manager
         */
        constructor(sessionCollection: Collection, userCollection: Collection, options: ISession);
        /**
         * Gets an array of all active sessions
         */
        numActiveSessions(): Promise<number>;
        /**
         * Gets an array of all active sessions
         * @param startIndex
         * @param limit
         */
        getActiveSessions(startIndex?: number, limit?: number): Promise<ISessionEntry[]>;
        /**
         * Clears the users session cookie so that its no longer tracked
         * @param sessionId The session ID to remove, if null then the currently authenticated session will be used
         * @param request
         * @param response
         */
        clearSession(sessionId: string | null, request: ServerRequest, response: ServerResponse): Promise<boolean>;
        /**
         * Gets and initializes a session by its id
         */
        getSessionById(sessionId: string): Promise<Session | null>;
        /**
         * Attempts to get a session from the request object of the client
         */
        getSession(request: ServerRequest): Promise<Session | null>;
        setSessionHeader(session: Session, request: ServerRequest, response: ServerResponse): Promise<void>;
        /**
         * Attempts to create a session from the request object of the client
         */
        createSession(request: ServerRequest, response: ServerResponse, userId: string): Promise<Session>;
        /**
         * Each time a session is created, a timer is started to check all sessions in the DB.
         * Once the lifetime of a session is up its then removed from the DB and we check for any remaining sessions.
         * @param force If true, this will force a cleanup instead of waiting on the next timer
         */
        cleanup(force?: boolean): Promise<void>;
        /**
         * Looks at the headers from the HTTP request to determine if a session cookie has been asssigned and returns the ID.
         * @param req
         * @returns The ID of the user session, or an empty string
         */
        private getIDFromRequest(req);
        /**
         * Creates a random session ID.
         * The ID is a pseude-random ASCII string which contains at least the specified number of bits of entropy (64 in this case)
         * the return value is a string of length [bits/6] of characters from the base64 alphabet
         * @returns A user session ID
         */
        private createID();
        /**
         * Creates the singlton
         */
        static create(sessionCollection: Collection, userCollection: Collection, options: ISession): SessionManager;
        /**
         * Gets the singleton
         */
        static readonly get: SessionManager;
    }
}
declare module "socket-api/client-connection" {
    import * as ws from 'ws';
    import { User } from "core/user";
    import { CommsController } from "socket-api/comms-controller";
    /**
     * A wrapper class for client connections made to the CommsController
     */
    export class ClientConnection {
        onDisconnected: (connection: ClientConnection) => void;
        ws: ws;
        user: User | null;
        domain: string;
        authorizedThirdParty: boolean;
        private _controller;
        constructor(ws: ws, domain: string, controller: CommsController, authorizedThirdParty: boolean);
        /**
         * Called whenever we recieve a message from a client
         */
        private onMessage(message);
        /**
       * Called whenever a client disconnnects
       */
        private onClose();
        /**
         * Called whenever an error has occurred
         */
        private onError(err);
    }
}
declare module "socket-api/server-instruction" {
    import { ClientConnection } from "socket-api/client-connection";
    /**
     * An instruction that is generated by clients and sent to the server to react to
     */
    export class ServerInstruction<T> {
        /**
         * The client connection who initiated the request
         */
        from: ClientConnection;
        /**
         * The token sent from the client
         */
        token: T;
        constructor(event: T, from: ClientConnection);
    }
}
declare module "socket-api/client-instruction" {
    import { ClientConnection } from "socket-api/client-connection";
    /**
     * An instruction that is generated by the server and sent to relevant clients.
     */
    export class ClientInstruction<T> {
        /**
         * Specify a username that if set, will only send this instruction to authorized clients
         * and/or the spefic user who may be connected
         */
        username: string | null;
        /**
         * An array of clients to send the instruction to. If null, then all clients will be considered
         */
        recipients: ClientConnection[] | null;
        /**
         * The event sent from the client
         */
        token: T;
        constructor(event: T, client?: ClientConnection[] | null, username?: string | null);
    }
}
declare module "socket-api/socket-api" {
    import { CommsController } from "socket-api/comms-controller";
    /**
     * Handles express errors
     */
    export class SocketAPI {
        private _comms;
        constructor(comms: CommsController);
        /**
         * Responds to a meta request from a client
         */
        private onMeta(e);
    }
}
declare module "socket-api/comms-controller" {
    import { IConfig } from 'modepress';
    import * as ws from 'ws';
    import * as events from 'events';
    import * as mongodb from 'mongodb';
    import { ClientInstruction } from "socket-api/client-instruction";
    import { ServerInstruction } from "socket-api/server-instruction";
    /**
     * A controller that deals with any any IPC or web socket communications
     */
    export class CommsController extends events.EventEmitter {
        static singleton: CommsController;
        private _server;
        private _connections;
        private _hashedApiKey;
        private _cfg;
        /**
       * Creates an instance of the Communication server
       */
        constructor(cfg: IConfig);
        /**
         * Checks the header api key against the hash generated from the config
         */
        checkApiKey(key: string): Promise<boolean>;
        /**
       * Sends an instruction to the relevant client connections
         * @param instruction The instruction from the server
       */
        processClientInstruction(instruction: ClientInstruction<any>): void;
        /**
       * Processes an instruction sent from a client. Any listeners of the comms controller will listen & react to the
         * instruction - and in some cases might resond to the client with a ClientInstruction.
         * @param instruction The instruction from the client
       */
        processServerInstruction(instruction: ServerInstruction<any>): Promise<{}> | undefined;
        /**
         * Attempts to send a token to a specific client
         */
        private sendToken(connection, token);
        /**
         * Called whenever a new client connection is made to the WS server
         */
        onWsConnection(ws: ws): Promise<void>;
        /**
         * Initializes the comms controller
         */
        initialize(db: mongodb.Db): Promise<void>;
    }
}
declare module "core/remotes/google-bucket" {
    import { Readable } from 'stream';
    import { IRemote, IGoogleProperties, IUploadOptions } from 'modepress';
    export class GoogleBucket implements IRemote {
        private _zipper;
        private _gcs;
        constructor();
        initialize(options: IGoogleProperties): Promise<void>;
        generateUrl(bucketIdentifier: string, fileIdentifier: string): string;
        createBucket(id: string, options?: any): Promise<string>;
        /**
         * Wraps a source and destination stream in a promise that catches error
         * and completion events
         */
        private handleStreamsEvents(source, dest);
        uploadFile(bucket: string, source: Readable, uploadOptions: IUploadOptions): Promise<string>;
        removeFile(bucket: string, id: string): Promise<void>;
        removeBucket(id: string): Promise<void>;
    }
    export const googleBucket: GoogleBucket;
}
declare module "core/remotes/local-bucket" {
    import { Readable } from 'stream';
    import { IRemote, IUploadOptions, ILocalBucket } from 'modepress';
    export class LocalBucket implements IRemote {
        private _zipper;
        private _path;
        private _url;
        constructor();
        initialize(options: ILocalBucket): Promise<void>;
        createBucket(id: string, options?: any): Promise<string>;
        private exists(path);
        generateUrl(bucketIdentifier: string, fileIdentifier: string): string;
        /**
         * Wraps a source and destination stream in a promise that catches error
         * and completion events
         */
        private handleStreamsEvents(source, dest);
        uploadFile(bucket: string, source: Readable, uploadOptions: IUploadOptions): Promise<string>;
        removeFile(bucket: string, id: string): Promise<void>;
        private deletePath(path);
        removeBucket(id: string): Promise<void>;
    }
    export const localBucket: LocalBucket;
}
declare module "core/bucket-manager" {
    import { IConfig, IBucketEntry, IFileEntry, IStorageStats } from 'modepress';
    import { Collection } from 'mongodb';
    import { Part } from 'multiparty';
    /**
     * Class responsible for managing buckets and uploads to Google storage
     */
    export class BucketManager {
        private static MEMORY_ALLOCATED;
        private static API_CALLS_ALLOCATED;
        private static _singleton;
        private _buckets;
        private _files;
        private _stats;
        private _zipper;
        private _unzipper;
        private _deflater;
        private _activeManager;
        constructor(buckets: Collection, files: Collection, stats: Collection, config: IConfig);
        /**
         * Fetches all bucket entries from the database
         * @param user [Optional] Specify the user. If none provided, then all buckets are retrieved
         * @param searchTerm [Optional] Specify a search term
         */
        getBucketEntries(user?: string, searchTerm?: RegExp): Promise<IBucketEntry[]>;
        /**
         * Fetches the file count based on the given query
         * @param searchQuery The search query to idenfify files
         */
        numFiles(searchQuery: IFileEntry): Promise<number>;
        /**
         * Fetches all file entries by a given query
         * @param searchQuery The search query to idenfify files
         */
        getFiles(searchQuery: any, startIndex?: number, limit?: number): Promise<IFileEntry[]>;
        /**
         * Updates all file entries for a given search criteria with custom meta data
         * @param searchQuery The search query to idenfify files
         * @param meta Optional meta data to associate with the files
         */
        setMeta(searchQuery: any, meta: any): Promise<boolean>;
        /**
         * Fetches all file entries from the database for a given bucket
         * @param bucket Specify the bucket from which he files belong to
         * @param startIndex Specify the start index
         * @param limit Specify the number of files to retrieve
         * @param searchTerm Specify a search term
         */
        getFilesByBucket(bucket: IBucketEntry, startIndex?: number, limit?: number, searchTerm?: RegExp): Promise<IFileEntry[]>;
        /**
         * Fetches the storage/api data for a given user
         * @param user The user whos data we are fetching
         */
        getUserStats(user?: string): Promise<IStorageStats>;
        /**
         * Attempts to create a user usage statistics
         * @param user The user associated with this bucket
         */
        createUserStats(user: string): Promise<IStorageStats>;
        /**
         * Attempts to remove the usage stats of a given user
         * @param user The user associated with this bucket
         * @returns A promise of the number of stats removed
         */
        removeUserStats(user: string): Promise<number>;
        /**
         * Attempts to remove all data associated with a user
         * @param user The user we are removing
         */
        removeUser(user: string): Promise<void>;
        /**
         * Attempts to create a new user bucket by first creating the storage on the cloud and then updating the internal DB
         * @param name The name of the bucket
         * @param user The user associated with this bucket
         */
        createBucket(name: string, user: string): Promise<void>;
        /**
         * Attempts to remove buckets of the given search result. This will also update the file and stats collection.
         * @param searchQuery A valid mongodb search query
         * @returns An array of ID's of the buckets removed
         */
        private removeBuckets(searchQuery);
        /**
         * Attempts to remove buckets by id
         * @param buckets An array of bucket IDs to remove
         * @param user The user to whome these buckets belong
         * @returns An array of ID's of the buckets removed
         */
        removeBucketsByName(buckets: Array<string>, user: string): Promise<Array<string>>;
        /**
         * Attempts to remove a user bucket
         * @param user The user associated with this bucket
         * @returns An array of ID's of the buckets removed
         */
        removeBucketsByUser(user: string): Promise<Array<string>>;
        /**
         * Deletes the bucket from storage and updates the databases
         */
        private deleteBucket(bucketEntry);
        /**
         * Deletes the file from storage and updates the databases
         * @param fileEntry
         */
        private deleteFile(fileEntry);
        /**
         * Attempts to remove files from the cloud and database by a query
         * @param searchQuery The query we use to select the files
         * @returns Returns the file IDs of the files removed
         */
        removeFiles(searchQuery: any): Promise<string[]>;
        /**
         * Attempts to remove files from the cloud and database
        * @param fileIDs The file IDs to remove
        * @param user Optionally pass in the user to refine the search
        * @returns Returns the file IDs of the files removed
        */
        removeFilesByIdentifiers(fileIDs: string[], user?: string): Promise<string[]>;
        /**
         * Attempts to remove files from the cloud and database that are in a given bucket
         * @param bucket The id or name of the bucket to remove
         * @returns Returns the file IDs of the files removed
         */
        removeFilesByBucket(bucket: string): Promise<string[]>;
        /**
         * Gets a bucket entry by its name or ID
         * @param bucket The id of the bucket. You can also use the name if you provide the user
         * @param user The username associated with the bucket (Only applicable if bucket is a name and not an ID)
         */
        getIBucket(bucket: string, user?: string): Promise<IBucketEntry | null>;
        /**
         * Checks to see the user's storage limits to see if they are allowed to upload data
         * @param user The username
         * @param part
         */
        private canUpload(user, part);
        /**
         * Checks to see the user's api limit and make sure they can make calls
         * @param user The username
         */
        withinAPILimit(user: string): Promise<boolean>;
        /**
         * Adds an API call to a user
         * @param user The username
         */
        incrementAPI(user: string): Promise<boolean>;
        /**
         * Registers an uploaded part as a new user file in the local dbs
         * @param identifier The id of the file on the bucket
         * @param bucketID The id of the bucket this file belongs to
         * @param part
         * @param user The username
         * @param isPublic IF true, the file will be set as public
         * @param parentFile Sets an optional parent file - if the parent is removed, then so is this one
         */
        private registerFile(identifier, bucket, part, user, isPublic, parentFile);
        /**
         * Uploads a part stream as a new user file. This checks permissions, updates the local db and uploads the stream to the bucket
         * @param part
         * @param bucket The bucket to which we are uploading to
         * @param user The username
         * @param makePublic Makes this uploaded file public to the world
         * @param parentFile [Optional] Set a parent file which when deleted will detelete this upload as well
         */
        uploadStream(part: Part, bucketEntry: IBucketEntry, user: string, makePublic?: boolean, parentFile?: string | null): Promise<IFileEntry>;
        /**
         * Fetches a file by its ID
         * @param fileID The file ID of the file on the bucket
         * @param user Optionally specify the user of the file
         * @param searchTerm Specify a search term
         */
        getFile(fileID: string, user?: string, searchTerm?: RegExp): Promise<IFileEntry>;
        /**
         * Renames a file
         * @param file The file to rename
         * @param name The new name of the file
         */
        renameFile(file: IFileEntry, name: string): Promise<IFileEntry>;
        /**
         * Finds and downloads a file
         * @param fileID The file ID of the file on the bucket
         * @returns Returns the number of results affected
         */
        updateStorage(user: string, value: IStorageStats): Promise<number>;
        /**
         * Creates the bucket manager singleton
         */
        static create(buckets: Collection, files: Collection, stats: Collection, config: IConfig): BucketManager;
        /**
         * Gets the bucket singleton
         */
        static readonly get: BucketManager;
    }
}
declare module "mailers/gmail" {
    import { IMailer, IGMail } from 'modepress';
    import * as google from 'googleapis';
    /**
     * A simple class for sending mail using Google Mail's API
     */
    export class GMailer implements IMailer {
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
}
declare module "mailers/mailgun" {
    import { IMailer, IMailgun } from 'modepress';
    /**
     * A simple class for sending mail using Google Mail's API
     */
    export class Mailguner implements IMailer {
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
}
declare module "core/user-manager" {
    import { IUserEntry, IConfig } from 'modepress';
    import { Collection } from 'mongodb';
    import { ServerRequest, ServerResponse } from 'http';
    import { Request } from 'express';
    import { User, UserPrivileges } from "core/user";
    import { Session } from "core/session";
    /**
     * Main class to use for managing users
     */
    export class UserManager {
        private static _singleton;
        private _collection;
        private _config;
        private _mailer;
        /**
           * Creates an instance of the user manager
           */
        constructor(userCollection: Collection, config: IConfig);
        /**
         * Called whenever a session is removed from the database
         */
        onSessionRemoved(sessionId: string): Promise<void>;
        /**
           * Initializes the API
           */
        initialize(): Promise<this>;
        /**
           * Attempts to register a new user
           * @param username The username of the user
           * @param pass The users secret password
           * @param email The users email address
         * @param meta Any optional data associated with this user
           * @param request
           * @param response
           */
        register(username: string | undefined, pass: string | undefined, email: string | undefined, activationUrl: string | undefined, meta: any, request: Request): Promise<User>;
        /**
           * Creates the link to send to the user for activation
           * @param user The user we are activating
         * @param resetUrl The url of where the activation link should go
         * @param origin The origin of where the activation link came from
           */
        private createActivationLink(user, resetUrl, origin);
        /**
           * Creates the link to send to the user for password reset
           * @param username The username of the user
         * @param origin The origin of where the password reset link came from
         * @param resetUrl The url of where the password reset link should go
           */
        private createResetLink(user, origin, resetUrl);
        /**
           * Approves a user's activation code so they can login without email validation
           * @param username The username or email of the user
           */
        approveActivation(username: string): Promise<void>;
        /**
         * Attempts to send the an email to the admin user
         * @param message The message body
         * @param name The name of the sender
         * @param from The email of the sender
         */
        sendAdminEmail(message: string, name?: string, from?: string): Promise<boolean>;
        /**
           * Attempts to resend the activation link
           * @param username The username of the user
         * @param resetUrl The url where the reset password link should direct to
         * @param origin The origin of where the request came from (this is emailed to the user)
           */
        resendActivation(username: string, resetUrl: string, origin: string): Promise<boolean>;
        /**
         * Sends the user an email with instructions on how to reset their password
         * @param username The username of the user
         * @param resetUrl The url where the reset password link should direct to
         * @param origin The site where the request came from
         */
        requestPasswordReset(username: string, resetUrl: string, origin: string): Promise<boolean>;
        /**
         * Creates a hashed password
         * @param pass The password to hash
         */
        private hashPassword(pass);
        /**
         * Compares a password to the stored hash in the database
         * @param pass The password to test
         * @param hash The hash stored in the DB
         */
        private comparePassword(pass, hash);
        /**
         * Attempts to reset a user's password.
         * @param username The username of the user
         * @param code The password code
         * @param newPassword The new password
         */
        resetPassword(username: string, code: string, newPassword: string): Promise<boolean>;
        /**
           * Checks the users activation code to see if its valid
           * @param username The username of the user
           */
        checkActivation(username: string, code: string): Promise<boolean>;
        /**
           * Attempts to log the user out
           * @param request
           * @param response
           */
        logOut(request: ServerRequest, response: ServerResponse): Promise<boolean>;
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
        createUser(user: string, email: string, password: string, activateAccount: boolean, privilege?: UserPrivileges, meta?: any, allowAdmin?: boolean): Promise<User>;
        /**
           * Deletes a user from the database
           * @param user The unique username or email of the user to remove
           */
        removeUser(user: string): Promise<void>;
        /**
           * Gets a user by a username or email
           * @param user The username or email of the user to get
           * @param email [Optional] Do a check if the email exists as well
           * @returns Resolves with either a valid user or null if none exists
           */
        getUser(user: string, email?: string): Promise<User | null>;
        /**
           * Attempts to log a user in
           * @param username The username or email of the user
           * @param pass The password of the user
           * @param rememberMe True if the cookie persistence is required
           * @param request
           * @param response
           */
        logIn(username: string | undefined, pass: string | undefined, rememberMe: boolean | undefined, request: ServerRequest, response: ServerResponse): Promise<Session>;
        /**
           * Removes a user by his email or username
           * @param username The username or email of the user
           * @returns True if the user was in the DB or false if they were not
           */
        remove(username?: string): Promise<boolean>;
        /**
         * Sets the meta data associated with the user
         * @param user The user
         * @param data The meta data object to set
         * @returns Returns the data set
         */
        setMeta(user: IUserEntry, data?: any): Promise<any>;
        /**
         * Sets a meta value on the user. This updates the user's meta value by name
         * @param user The user
         * @param name The name of the meta to set
         * @param data The value of the meta to set
         * @returns {Promise<boolean|any>} Returns the value of the set
         */
        setMetaVal(user: IUserEntry, name: string, val: any): Promise<any>;
        /**
         * Gets the value of user's meta by name
         * @param user The user
         * @param name The name of the meta to get
         * @returns The value to get
         */
        getMetaVal(user: IUserEntry, name: string): Promise<any>;
        /**
         * Gets the meta data of a user
         * @param user The user
         * @returns The value to get
         */
        getMetaData(user: IUserEntry): Promise<any>;
        /**
         * Gets the total number of users
         * @param searchPhrases Search phrases
         */
        numUsers(searchPhrases?: RegExp): Promise<number>;
        /**
           * Prints user objects from the database
           * @param limit The number of users to fetch
           * @param startIndex The starting index from where we are fetching users from
         * @param searchPhrases Search phrases
           */
        getUsers(startIndex?: number, limit?: number, searchPhrases?: RegExp): Promise<User[]>;
        /**
         * Creates the user manager singlton
         */
        static create(users: Collection, config: IConfig): UserManager;
        /**
         * Gets the user manager singlton
         */
        static readonly get: UserManager;
    }
}
declare module "utils/errors" {
    /**
     * 403 Forbidden errors: The request was valid, but the server is refusing action.
     * The user might not have the necessary permissions for a resource, or may need an account of some sort.
     */
    export class Error403 extends Error {
        constructor(message: string);
    }
    /**
     * 401 Unorthorized: Similar to 403 Forbidden, but specifically for use when authentication
     * is required and has failed or has not yet been provided.
     */
    export class Error401 extends Error {
        constructor(message: string);
    }
    /**
     * 404 Not Found errors: The requested resource could not be
     * found but may be available in the future. Subsequent requests by the client are permissible.
     */
    export class Error404 extends Error {
        constructor(message: string);
    }
    /**
     * 500 Internal Server Error: A generic error message, given when an unexpected condition was
     * encountered and no more specific message is suitable.
     */
    export class Error500 extends Error {
        constructor(message: string);
    }
}
declare module "utils/serializers" {
    import { IResponse } from 'modepress';
    import * as express from 'express';
    /**
     * A decorator for transforming an async express function handler.
     * Transforms the promise's response into a serialized json with
     * a 200 response code.
     * @param errCode The type of error code to raise for errors
     */
    export function j200(errCode?: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    /**
     * Helper function to return a status 200 json object of type T
     */
    export function okJson<T extends IResponse>(data: T, res: express.Response): void;
    /**
     * Helper function to return a status 500 json object of type T
     */
    export function errJson(err: Error, res: express.Response): void;
}
declare module "utils/permission-controllers" {
    import { IAuthReq } from 'modepress';
    import * as express from 'express';
    import { UserPrivileges } from "core/user";
    /**
     * Checks for an id parameter and that its a valid mongodb ID. Returns an error of type IResponse if no ID is detected, or its invalid
     * @param idName The name of the ID to check for
     * @param optional If true, then an error wont be thrown if it doesnt exist
     */
    export function hasId(idName: string, idLabel?: string, optional?: boolean): (req: express.Request, res: express.Response, next: Function) => void;
    /**
     * This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
     */
    export function canEdit(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
    /**
     * Checks if the request has owner rights (admin/owner). If not, an error is sent back to the user
     */
    export function ownerRights(req: IAuthReq, res: express.Response, next?: Function): any;
    /**
     * Checks if the request has admin rights. If not, an error is sent back to the user
     */
    export function adminRights(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
    /**
     * Checks for session data and fetches the user. Does not throw an error if the user is not present.
     */
    export function identifyUser(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
    /**
     * Checks for session data and fetches the user. Sends back an error if no user present
     */
    export function requireUser(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
    /**
     * Checks a user is logged in and has permission
     * @param level
     * @param req
     * @param res
     * @param existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
     * @param next
     */
    export function requestHasPermission(level: UserPrivileges, req: IAuthReq, res: express.Response, existingUser?: string): Promise<boolean>;
}
declare module "controllers/admin-controller" {
    import express = require('express');
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    import * as mongodb from 'mongodb';
    /**
     * Main class to use for managing users
     */
    export class AdminController extends Controller {
        private _options;
        constructor(options: IBaseControler);
        /**
       * Called to initialize this controller and its related database objects
       */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
       * Attempts to send the webmaster an email message
       */
        private messageWebmaster(req, res);
    }
}
declare module "controllers/bucket-controller" {
    import express = require('express');
    import * as mongodb from 'mongodb';
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    /**
     * Main class to use for managing users
     */
    export class BucketController extends Controller {
        private _allowedFileTypes;
        private _options;
        /**
           * Creates an instance of the user manager
           */
        constructor(options: IBaseControler);
        /**
       * Called to initialize this controller and its related database objects
       */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
         * Removes buckets specified in the URL
         */
        private removeBuckets(req, res);
        /**
         * Fetches all bucket entries from the database
         */
        private getBuckets(req, res);
        private alphaNumericDashSpace(str);
        /**
       * Creates a new user bucket based on the target provided
       */
        private createBucket(req, res);
        /**
         * Checks if a part is allowed to be uploaded
         * @returns {boolean}
         */
        private isPartAllowed(part);
        /**
         * Checks if a file part is allowed to be uploaded
         * @returns {boolean}
         */
        private isFileTypeAllowed(part);
        private uploadMetaPart(part);
        /**
         * Attempts to upload a file to the user's bucket
         */
        private uploadUserFiles(req, res);
        /**
         * After the uploads have been uploaded, we set any meta on the files and send file uploaded events
         * @param meta The optional meta to associate with the uploaded files. The meta can be either a valid JSON or an error. If its
         * an error, then that means the meta could not be parsed
         * @param files The uploaded files
         * @param user The user who uploaded the files
         * @param tokens The upload tokens to be sent back to the client
         */
        private finalizeUploads(meta, files, user, tokens);
    }
}
declare module "controllers/comments-controller" {
    import * as mongodb from 'mongodb';
    import * as express from 'express';
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    /**
     * A controller that deals with the management of comments
     */
    export class CommentsController extends Controller {
        private _options;
        /**
           * Creates a new instance of the controller
           */
        constructor(options: IBaseControler);
        /**
       * Called to initialize this controller and its related database objects
       */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
         * Returns an array of IComment items
         */
        private getComments(req, res);
        /**
         * Returns a single comment
         */
        private getComment(req, res);
        /**
         * Attempts to remove a comment by ID
         */
        private remove(req, res);
        /**
         * Attempts to update a comment by ID
         */
        private update(req, res);
        /**
         * Attempts to create a new comment
         */
        private create(req, res);
    }
}
declare module "controllers/cors-controller" {
    import { Controller } from "controllers/controller";
    import * as express from 'express';
    import * as mongodb from 'mongodb';
    import { IBaseControler } from 'modepress';
    /**
     * Checks all incomming requests to see if they are CORS approved
     */
    export class CORSController extends Controller {
        private _approvedDomains;
        private _options;
        /**
       * Creates an instance of the user manager
       */
        constructor(approvedDomains: string[], options: IBaseControler);
        /**
       * Called to initialize this controller and its related database objects
       */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    }
}
declare module "controllers/emails-controller" {
    import * as express from 'express';
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    import * as mongodb from 'mongodb';
    export class EmailsController extends Controller {
        private _options;
        /**
           * Creates a new instance of the email controller
           */
        constructor(options: IBaseControler);
        /**
       * Called to initialize this controller and its related database objects
       */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
           * Called whenever a post request is caught by this controller
           */
        protected onPost(req: express.Request, res: express.Response): any;
    }
}
declare module "controllers/error-controller" {
    import { Controller } from "controllers/controller";
    import express = require('express');
    import * as mongodb from 'mongodb';
    /**
     * Handles express errors
     */
    export class ErrorController extends Controller {
        /**
       * Creates an instance
       */
        constructor();
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    }
}
declare module "controllers/file-controller" {
    import express = require('express');
    import { Controller } from "controllers/controller";
    import { IFileOptions } from 'modepress';
    import * as mongodb from 'mongodb';
    /**
     * Main class to use for managing users
     */
    export class FileController extends Controller {
        private _allowedFileTypes;
        private _cacheLifetime;
        private _options;
        /**
           * Creates an instance of the user manager
           */
        constructor(options: IFileOptions);
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
         * Removes files specified in the URL
         */
        private removeFiles(req, res);
        /**
         * Renames a file
         */
        private renameFile(req, res);
        /**
         * Fetches all file entries from the database. Optionally specifying the bucket to fetch from.
         */
        private getFiles(req, res);
    }
}
declare module "controllers/page-renderer" {
    import * as mongodb from 'mongodb';
    import * as express from 'express';
    import { Controller } from "controllers/controller";
    import { IRenderOptions } from 'modepress';
    /**
     * Sets up a prerender server and saves the rendered html requests to mongodb.
     * These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
     */
    export class PageRenderer extends Controller {
        private renderQueryFlag;
        private expiration;
        private _options;
        private static crawlerUserAgents;
        private static extensionsToIgnore;
        /**
       * Creates a new instance of the email controller
       */
        constructor(options: IRenderOptions);
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
         * Strips the html page of any script tags
         */
        private stripScripts(html);
        /**
         * Gets the URL of a request
         */
        getUrl(req: express.Request): string;
        /**
         * Fetches a page and strips it of all its script tags
         */
        private renderPage(url);
        /**
         * Determines if the request comes from a bot. If so, a prerendered page is sent back which excludes any script tags
         */
        processBotRequest(req: express.Request, res: express.Response, next: Function): Promise<any>;
        /**
         * Determines if the request comes from a bot
         */
        private shouldShowPrerenderedPage(req);
        /**
         * Attempts to find a render by ID and then display it back to the user
         */
        private previewRender(req, res);
        /**
         * Attempts to remove a render by ID
         */
        private removeRender(req, res);
        /**
         * Returns an array of IPost items
         */
        private getRenders(req, res);
        /**
         * Removes all cache items from the db
         */
        private clearRenders(req, res);
    }
}
declare module "controllers/posts-controller" {
    import * as mongodb from 'mongodb';
    import * as express from 'express';
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    /**
     * A controller that deals with the management of posts
     */
    export class PostsController extends Controller {
        private _options;
        /**
           * Creates a new instance of the controller
           */
        constructor(options: IBaseControler);
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
         * Returns an array of IPost items
         */
        private getPosts(req, res);
        /**
         * Returns a single post
         */
        private getPost(req, res);
        /**
         * Attempts to remove a post by ID
         */
        private removePost(req, res);
        /**
         * Attempts to update a post by ID
         */
        private updatePost(req, res);
        /**
         * Attempts to create a new post
         */
        private createPost(req, res);
    }
}
declare module "controllers/categories-controller" {
    import * as mongodb from 'mongodb';
    import * as express from 'express';
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    /**
     * A controller that deals with the management of categories
     */
    export class CategoriesController extends Controller {
        private _options;
        /**
           * Creates a new instance of the controller
           */
        constructor(options: IBaseControler);
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
         * Returns an array of ICategory items
         */
        private getCategories(req, res);
        /**
         * Attempts to remove a category by ID
         */
        private removeCategory(req, res);
        /**
         * Attempts to create a new category item
         */
        private createCategory(req, res);
    }
}
declare module "controllers/session-controller" {
    import express = require('express');
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    import * as mongodb from 'mongodb';
    /**
     * Main class to use for managing users
     */
    export class SessionController extends Controller {
        private _options;
        /**
           * Creates an instance of the user manager
           */
        constructor(options: IBaseControler);
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
           * Gets a list of active sessions. You can limit the haul by specifying the 'index' and 'limit' query parameters.
           */
        private getSessions(req, res);
        /**
           * Resends the activation link to the user
           */
        private deleteSession(req, res);
    }
}
declare module "controllers/stats-controller" {
    import { IBaseControler } from 'modepress';
    import express = require('express');
    import { Controller } from "controllers/controller";
    import * as mongodb from 'mongodb';
    /**
     * Main class to use for managing users
     */
    export class StatsController extends Controller {
        private _allowedFileTypes;
        private _options;
        /**
           * Creates an instance of the user manager
           * @param e The express app
           * @param The config options of this manager
           */
        constructor(options: IBaseControler);
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
         * Makes sure the target user exists and the numeric value specified is valid
         */
        private verifyTargetValue(req, res, next);
        /**
         * Updates the target user's api calls
         */
        private updateCalls(req, res);
        /**
         * Updates the target user's memory usage
         */
        private updateMemory(req, res);
        /**
         * Updates the target user's allocated api calls
         */
        private updateAllocatedCalls(req, res);
        /**
         * Updates the target user's allocated memory
         */
        private updateAllocatedMemory(req, res);
        /**
         * Fetches the statistic information for the specified user
         */
        private getStats(req, res);
        /**
         * Creates a new user stat entry. This is usually done for you when creating a new user
         */
        private createStats(req, res);
    }
}
declare module "controllers/user-controller" {
    import express = require('express');
    import { Controller } from "controllers/controller";
    import { IBaseControler } from 'modepress';
    import * as mongodb from 'mongodb';
    /**
     * Main class to use for managing user data
     */
    export class UserController extends Controller {
        private _options;
        /**
           * Creates an instance of the user manager
           */
        constructor(options: IBaseControler);
        /**
         * Called to initialize this controller and its related database objects
         */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
       * Gets a specific user by username or email - the 'username' parameter must be set. Some of the user data will be obscured unless the verbose parameter
         * is specified. Specify the verbose=true parameter in order to get all user data.
       */
        private getUser(req, res);
        /**
       * Gets a list of users. You can limit the haul by specifying the 'index' and 'limit' query parameters.
         * Also specify the verbose=true parameter in order to get all user data. You can also filter usernames with the
         * search query
       */
        private getUsers(req, res);
        /**
         * Sets a user's meta data
       */
        private setData(req, res);
        /**
       * Sets a user's meta value
       */
        private setVal(req, res);
        /**
       * Gets a user's meta value
       */
        private getVal(req, res);
        /**
       * Gets a user's meta data
       */
        private getData(req, res);
        /**
           * Removes a user from the database
           */
        private removeUser(req, res);
        /**
           * Allows an admin to create a new user without registration
           */
        private createUser(req, res);
    }
}
declare module "controllers/auth-controller" {
    import express = require('express');
    import { Controller } from "controllers/controller";
    import { IAuthOptions } from 'modepress';
    import * as mongodb from 'mongodb';
    /**
     * Main class to use for managing user authentication
     */
    export class AuthController extends Controller {
        private _options;
        /**
           * Creates an instance of the user manager
           */
        constructor(options: IAuthOptions);
        /**
       * Called to initialize this controller and its related database objects
       */
        initialize(e: express.Express, db: mongodb.Db): Promise<this>;
        /**
           * Activates the user's account
           */
        private activateAccount(req, res);
        /**
           * Resends the activation link to the user
           */
        private resendActivation(req, res);
        /**
       * Resends the activation link to the user
       */
        private requestPasswordReset(req, res);
        /**
       * resets the password if the user has a valid password token
       */
        private passwordReset(req, res);
        /**
           * Approves a user's activation code so they can login without email validation
           */
        private approveActivation(req, res);
        /**
           * Attempts to log the user in. Expects the username, password and rememberMe parameters be set.
           */
        private login(req, res);
        /**
           * Attempts to log the user out
           */
        private logout(req, res);
        /**
           * Attempts to register a new user
           */
        private register(req, res);
        /**
           * Checks to see if the current session is logged in. If the user is, it will be returned redacted. You can specify the 'verbose' query parameter
           */
        private authenticated(req, res);
    }
}
declare module "modepress-api" {
    import * as _Controller from "controllers/controller";
    import * as users from "core/user-manager";
    import * as bucketManager from "core/bucket-manager";
    import * as _Models from "models/model";
    import * as _SchemaFactory from "models/schema-items/schema-item-factory";
    import { isValidObjectID } from "utils/utils";
    import * as permissions from "utils/permission-controllers";
    import { AdminController } from "controllers/admin-controller";
    import { BucketController } from "controllers/bucket-controller";
    import { CommentsController } from "controllers/comments-controller";
    import { CORSController } from "controllers/cors-controller";
    import { EmailsController } from "controllers/emails-controller";
    import { ErrorController } from "controllers/error-controller";
    import { FileController } from "controllers/file-controller";
    import { PageRenderer } from "controllers/page-renderer";
    import { PostsController } from "controllers/posts-controller";
    import { CategoriesController } from "controllers/categories-controller";
    import { SessionController } from "controllers/session-controller";
    import { StatsController } from "controllers/stats-controller";
    import { UserController } from "controllers/user-controller";
    import { AuthController } from "controllers/auth-controller";
    export const Controller: typeof _Controller.Controller;
    export const Model: typeof _Models.Model;
    export const SchemaFactory: typeof _SchemaFactory;
    export const UserManager: typeof users.UserManager;
    export const BucketManager: typeof bucketManager.BucketManager;
    export const isValidID: typeof isValidObjectID;
    export const authentication: typeof permissions;
    export const controllers: {
        admin: typeof AdminController;
        auth: typeof AuthController;
        posts: typeof PostsController;
        categories: typeof CategoriesController;
        comments: typeof CommentsController;
        cors: typeof CORSController;
        email: typeof EmailsController;
        error: typeof ErrorController;
        file: typeof FileController;
        bucket: typeof BucketController;
        renderer: typeof PageRenderer;
        session: typeof SessionController;
        stats: typeof StatsController;
        user: typeof UserController;
    };
}
