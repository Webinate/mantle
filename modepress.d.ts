/// <reference types="ws" />
/// <reference types="node" />
/// <reference types="express" />
declare module 'modepress' {
    interface IAdminUser {
        username: string;
        email: string;
        password: string;
    }
    /**
     * Describes the controller structure of plugins in the config file
     */
    interface IControllerPlugin {
        path: string;
    }
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
        };
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
        };
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
        };
        sessionSettings: {
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
        };
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
}
declare module 'modepress' {
    interface IGoogleProperties {
        keyFile: string;
        bucket: {
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
        };
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
    /**
     * Defines routes and the paths they take
     */
    interface IPath {
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
        variables: {
            [name: string]: string;
        };
    }
}
declare module 'modepress' {
    /**
     * Defines routes and the paths of a host / port
     */
    interface IServer {
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
        paths: Array<IPath>;
        /**
         * An array of controllers associated with this server
         */
        controllers: Array<IControllerPlugin>;
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
        children?: Array<string>;
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
    interface ISessionEntry {
        _id?: any;
        sessionId?: string;
        data?: any;
        expiration?: number;
    }
}
declare module 'modepress' {
    /**
      * The interface for describing each user's bucket
      */
    interface IStorageStats {
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
}
declare module 'modepress' {
    /**
     * An interface used to describe requests that have been authenticated by a session id
     */
    interface IAuthReq extends Express.Request {
        _isAdmin: boolean;
        _verbose: boolean;
        _user: IUserEntry | null;
        _target: IUserEntry | null;
        body: any;
        headers: any;
        params: any;
        query: any;
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
        error: boolean;
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
    interface IGetRenders extends IGetArrayResponse<IRender> {
    }
    interface IGetPosts extends IGetArrayResponse<IPost> {
    }
    interface IGetComments extends IGetArrayResponse<IComment> {
    }
    interface IGetPost extends IGetResponse<IPost> {
    }
    interface IGetComment extends IGetResponse<IComment> {
    }
    interface IGetCategory extends IGetResponse<ICategory> {
    }
    interface IGetCategories extends IGetArrayResponse<ICategory> {
    }
    interface IGetUser extends IGetResponse<IUserEntry> {
    }
    interface IGetUserStorageData extends IGetResponse<IStorageStats> {
    }
    interface IGetUsers extends IGetArrayResponse<IUserEntry> {
        count: number;
    }
    interface IGetSessions extends IGetArrayResponse<ISessionEntry> {
    }
    interface IGetBuckets extends IGetArrayResponse<IBucketEntry> {
    }
    interface IGetFile extends IGetResponse<IFileEntry> {
    }
    interface IGetFiles extends IGetArrayResponse<IFileEntry> {
    }
    interface IRemoveFiles extends IGetArrayResponse<string> {
    }
}
declare module "models/schema-items/schema-item" {
    import { ISchemaOptions, IModelEntry } from 'modepress';
    import { ModelInstance } from "models/model";
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
         * @param instance The model instance that was inserted or updated
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert<T extends IModelEntry>(instance: ModelInstance<T>, collection: string): Promise<void>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param instance The model instance that was deleted
         * @param collection The DB collection that the model was deleted from
         */
        postDelete<T extends IModelEntry>(instance: ModelInstance<T>, collection: string): Promise<void>;
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
    import * as mongodb from 'mongodb';
    import { ModelInstance } from "models/model";
    /**
     * Gives an overall description of each property in a model
     */
    export class Schema {
        private _items;
        constructor();
        /**
         * Creates a copy of the schema
         */
        clone(): Schema;
        /**
         * Sets a schema value by name
         * @param data The data object we are setting
         * @param allowReadOnlyValues If true, then readonly values can be overwritten (Usually the case when the item is first created)
         */
        set(data: any, allowReadOnlyValues: boolean): void;
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
         * @param id The models dont store the _id property directly, and so this has to be passed for serialization
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        getAsJson<T extends IModelEntry>(id: mongodb.ObjectID, options: ISchemaOptions): Promise<T>;
        /**
         * Checks the values stored in the items to see if they are correct
         * @param checkForRequiredFields If true, then required fields must be present otherwise an error is flagged
         * @returns Returns true if successful
         */
        validate(checkForRequiredFields: boolean): Promise<Schema>;
        /**
         * Called after a model instance and its schema has been validated and inserted/updated into the database. Useful for
         * doing any post update/insert operations
         * @param instance The model instance that was inserted or updated
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert<T extends IModelEntry>(instance: ModelInstance<T>, collection: string): Promise<Schema>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param instance The model instance that was deleted
         * @param collection The DB collection that the model was deleted from
         */
        postDelete<T extends IModelEntry>(instance: ModelInstance<T>, collection: string): Promise<Schema>;
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
declare module "models/model" {
    import { IModelEntry } from 'modepress';
    import * as mongodb from 'mongodb';
    import { Schema } from "models/schema";
    export interface UpdateToken<T> {
        error: string | boolean;
        instance: ModelInstance<T>;
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
     * An instance of a model with its own unique schema and ID. The initial schema is a clone
     * the parent model's
     */
    export class ModelInstance<T extends IModelEntry | null> {
        model: Model;
        schema: Schema;
        _id: mongodb.ObjectID;
        dbEntry: T;
        /**
         * Creates a model instance
         */
        constructor(model: Model, dbEntry: T);
        /**
         * Gets a string representation of all fields that are unique
         */
        uniqueFieldNames(): string;
    }
    /**
     * Models map data in the application/client to data in the database
     */
    export abstract class Model {
        collection: mongodb.Collection;
        defaultSchema: Schema;
        private _collectionName;
        private _initialized;
        private static _registeredModels;
        /**
         * Creates an instance of a Model
         * @param collection The collection name associated with this model
         */
        constructor(collection: string);
        /**
         * Returns a new model of a given type. However if the model was already registered before,
         * then the previously created model is returned.
         * @param modelConstructor The model class
         * @returns Returns the registered model
         */
        static registerModel<T extends Model>(modelConstructor: any): T;
        /**
         * Returns a registered model by its name
         * @param name The name of the model to fetch
         * @returns Returns the registered model or null if none exists
         */
        static getByName(name: string): Model;
        /**
         * Creates an index for a collection
         * @param name The name of the field we are setting an index of
         * @param collection The collection we are setting the index on
         */
        private createIndex(name, collection);
        /**
         * Gets the name of the collection associated with this model
         */
        readonly collectionName: string;
        /**
         * Initializes the model by setting up the database collections
         * @param db The database used to create this model
         */
        initialize(db: mongodb.Db): Promise<Model>;
        /**
         * Gets the number of DB entries based on the selector
         * @param selector The mongodb selector
         */
        count(selector: any): Promise<number>;
        /**
         * Gets an arrray of instances based on the selector search criteria
         * @param selector The mongodb selector
         * @param sort Specify an array of items to sort.
         * Each item key represents a field, and its associated number can be either 1 or -1 (asc / desc)
         * @param startIndex The start index of where to select from
         * @param limit The number of results to fetch
         * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
         */
        findInstances<T>(options?: ISearchOptions<T>): Promise<Array<ModelInstance<T>>>;
        /**
         * Gets a model instance based on the selector criteria
         * @param selector The mongodb selector
         * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
         */
        findOne<T>(selector: any, projection?: any): Promise<ModelInstance<T> | null>;
        /**
         * Deletes a instance and all its dependencies are updated or deleted accordingly
         */
        private deleteInstance(instance);
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
        update<T>(selector: any, data: T): Promise<UpdateRequest<T>>;
        /**
         * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
         * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
         * by parsing the data object and setting each schema item's value by the name/value in the data object.
         */
        checkUniqueness<T>(instance: ModelInstance<T>): Promise<boolean>;
        /**
         * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
         * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
         * by parsing the data object and setting each schema item's value by the name/value in the data object
         */
        createInstance<T>(data?: T): Promise<ModelInstance<T | null>>;
        /**
         * Attempts to insert an array of instances of this model into the database.
         * @param instances An array of instances to save
         */
        insert<T>(instances: Array<ModelInstance<T>>): Promise<Array<ModelInstance<T>>>;
    }
}
declare module "controllers/controller" {
    import { Model } from "models/model";
    import * as mongodb from 'mongodb';
    export class Controller {
        private static _models;
        private _models;
        constructor(models: Array<Model> | null);
        /**
         * Called to initialize this controller and its related database objects
         * @param db The mongo database to use
         */
        initialize(db: mongodb.Db): Promise<Controller>;
        /**
         * Gets a model by its collection name
         */
        getModel(collectionName: string): Model | null;
    }
}
declare module "models/schema-items/schema-number" {
    import { SchemaItem } from "models/schema-items/schema-item";
    /**
     * Describes the type of number to store
     */
    export enum NumberType {
        Integer = 0,
        Float = 1,
    }
    /**
     * A numeric schema item for use in Models
     */
    export class SchemaNumber extends SchemaItem<number> {
        min: number;
        max: number;
        type: NumberType;
        decimalPlaces: number;
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The default value of this item
         * @param min [Optional] The minimum value the value can be
         * @param max [Optional] The maximum value the value can be
         * @param type [Optional] The type of number the schema represents
         * @param decimalPlaces [Optional] The number of decimal places to use if the type is a Float
         */
        constructor(name: string, val: number, min?: number, max?: number, type?: NumberType, decimalPlaces?: number);
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
         * @param minCharacters [Optional] Specify the minimum number of characters for use with this text item
         * @param maxCharacters [Optional] Specify the maximum number of characters for use with this text item
         * @param htmlClean [Optional] If true, the text is cleaned of HTML before insertion. The default is true
         */
        constructor(name: string, val: string, minCharacters?: number, maxCharacters?: number, htmlClean?: boolean);
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
    /**
     * A date scheme item for use in Models
     */
    export class SchemaDate extends SchemaItem<number> {
        useNow: boolean;
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The date of this item. If none is specified the Date.now() number is used.
         * @param useNow [Optional] If true, the date will always be updated to use the current date
         */
        constructor(name: string, val?: number, useNow?: boolean);
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
         * @param minItems [Optional] Specify the minimum number of items that can be allowed
         * @param maxItems [Optional] Specify the maximum number of items that can be allowed
         * @param minCharacters [Optional] Specify the minimum number of characters for each text item
         * @param maxCharacters [Optional] Specify the maximum number of characters for each text item
         */
        constructor(name: string, val: Array<string>, minItems?: number, maxItems?: number, minCharacters?: number, maxCharacters?: number);
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
}
declare module "models/schema-items/schema-foreign-key" {
    import { ISchemaOptions, IModelEntry } from 'modepress';
    import { SchemaItem } from "models/schema-items/schema-item";
    import { ModelInstance } from "models/model";
    import { ObjectID } from 'mongodb';
    /**
     * Represents a mongodb ObjectID of a document in separate collection.
     * Foreign keys are used as a way of relating models to one another. They can be required or optional.
     * Required keys will mean that the current document cannot exist if the target does not. Optional keys
     * will simply be nullified if the target no longer exists.
     */
    export class SchemaForeignKey extends SchemaItem<ObjectID | string | IModelEntry | null> {
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
         * @param keyCanBeNull If true, then the key is allowed to be null
         * @param canAdapt If true, then key will only be nullified if the target is removed. If false, then the instance that
         * owns this item must be removed as it cannot exist without the target.
         */
        constructor(name: string, val: string, targetCollection: string, keyCanBeNull: boolean, canAdapt: boolean);
        /**
         * Creates a clone of this item
         */
        clone(copy?: SchemaForeignKey): SchemaForeignKey;
        /**
         * Checks the value stored to see if its correct in its current form
         */
        validate(): Promise<boolean | Error | null>;
        /**
         * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
         * doing any post update/insert operations
         * @param instance The model instance that was inserted or updated
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert<T extends IModelEntry>(instance: ModelInstance<T>, collection: string): Promise<void>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param instance The model instance that was deleted
         */
        postDelete<T extends IModelEntry>(instance: ModelInstance<T>): Promise<void>;
        /**
         * Gets the value of this item
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        getValue(options: ISchemaOptions): Promise<ObjectID | IModelEntry | null>;
    }
}
declare module "models/schema-items/schema-id-array" {
    import { ISchemaOptions, IModelEntry } from 'modepress';
    import { SchemaItem } from "models/schema-items/schema-item";
    import { ModelInstance } from "models/model";
    import { ObjectID } from 'mongodb';
    /**
     * An ID array scheme item for use in Models. Optionally can be used as a foreign key array
     * and return objects of the specified ids. In order for the array to return objects you must
     * specify the targetCollection property. This tells the schema from which model the ids belong to.
     * Currently we only support Id lookups that exist in the same model - i.e. if the ids are of objects
     * in different models we cannot get the object values.
     */
    export class SchemaIdArray extends SchemaItem<Array<string | ObjectID | IModelEntry>> {
        targetCollection: string;
        minItems: number;
        maxItems: number;
        curLevel: number;
        private _targetDocs;
        /**
         * Creates a new schema item that holds an array of id items
         * @param name The name of this item
         * @param val The array of ids for this schema item
         * @param minItems [Optional] Specify the minimum number of items that can be allowed
         * @param maxItems [Optional] Specify the maximum number of items that can be allowed
         * @param targetCollection [Optional] Specify the model name to which all the ids belong. If set
         * the item can expand objects on retreival.
         */
        constructor(name: string, val: Array<string>, minItems: number | undefined, maxItems: number | undefined, targetCollection: string);
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
         * @param instance The model instance that was inserted or updated
         * @param collection The DB collection that the model was inserted into
         */
        postUpsert<T extends IModelEntry>(instance: ModelInstance<T>, collection: string): Promise<void>;
        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param instance The model instance that was deleted
         */
        postDelete<T extends IModelEntry>(instance: ModelInstance<T>): Promise<void>;
        /**
         * Gets the value of this item
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        getValue(options: ISchemaOptions): Promise<Array<string | ObjectID | IModelEntry>>;
    }
}
declare module "models/schema-items/schema-num-array" {
    import { SchemaItem } from "models/schema-items/schema-item";
    import { NumberType } from "models/schema-items/schema-number";
    /**
     * A number array scheme item for use in Models
     */
    export class SchemaNumArray extends SchemaItem<Array<number>> {
        minItems: number;
        maxItems: number;
        min: number;
        max: number;
        type: NumberType;
        decimalPlaces: number;
        /**
         * Creates a new schema item that holds an array of number items
         * @param name The name of this item
         * @param val The number array of this schema item
         * @param minItems [Optional] Specify the minimum number of items that can be allowed
         * @param maxItems [Optional] Specify the maximum number of items that can be allowed
         * @param min [Optional] Specify the minimum a number can be
         * @param max [Optional] Specify the maximum a number can be
         * @param type [Optional] What type of numbers to expect
         * @param decimalPlaces [Optional] The number of decimal places to use if the type is a Float
         */
        constructor(name: string, val: Array<number>, minItems?: number, maxItems?: number, min?: number, max?: number, type?: NumberType, decimalPlaces?: number);
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
         * @param allowedTags The tags allowed by the html parser
         * @param allowedAttributes The attributes allowed by each attribute
         * @param errorBadHTML If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you
         * @param minCharacters [Optional] Specify the minimum number of characters for use with this text item
         * @param maxCharacters [Optional] Specify the maximum number of characters for use with this text item
         */
        constructor(name: string, val: string, allowedTags?: Array<string>, allowedAttributes?: {
            [name: string]: Array<string>;
        }, errorBadHTML?: boolean, minCharacters?: number, maxCharacters?: number);
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
    export const NumberType: typeof numbers.NumberType;
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
declare module "models/posts-model" {
    import { Model } from "models/model";
    /**
     * A model for describing posts
     */
    export class PostsModel extends Model {
        constructor();
    }
}
declare module "models/categories-model" {
    import { Model } from "models/model";
    /**
     * A model for describing post categories
     */
    export class CategoriesModel extends Model {
        constructor();
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
declare module "socket-api/client-connection" {
    import * as ws from 'ws';
    import { User } from "core/users";
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
declare module "core/session" {
    import { ISessionEntry } from 'modepress';
    import * as http from 'http';
    import * as mongodb from 'mongodb';
    import { EventEmitter } from 'events';
    export interface ISessionOptions {
        path?: string;
        /**
         * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
         * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
         * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
         */
        domain?: string;
        /**
         * A persistent connection is one that will last after the user closes the window and visits the site again (true).
         * A non-persistent that will forget the user once the window is closed (false)
         */
        persistent?: boolean;
        /**
         * If true, the cookie will be encrypted
         */
        secure?: boolean;
        /**
         * If you wish to create a persistent session (one that will last after the user closes the window and visits the site again) you must specify a lifetime as a number of seconds.
         * The lifetime controls both when the browser's cookie will expire, and when the session object will be freed by the sessions module.
         * By default, the browser cookie will expire when the window is closed, and the session object will be freed 24 hours after the last request is seen.
         */
        lifetime?: number;
        /**
         * Same as lifetime, but the extended version.
         */
        lifetimeExtended?: number;
    }
    /**
    * A class that manages session data for active users
     */
    export class SessionManager extends EventEmitter {
        private _dbCollection;
        private _timeout;
        private _cleanupProxy;
        private _options;
        /**
         * Creates an instance of a session manager
         * @param sessionCollection The mongoDB collection to use for saving sessions
         */
        constructor(dbCollection: mongodb.Collection, options: ISessionOptions);
        /**
         * Gets an array of all active sessions
         */
        numActiveSessions(): Promise<number>;
        /**
         * Gets an array of all active sessions
         * @param startIndex
         * @param limit
         */
        getActiveSessions(startIndex?: number, limit?: number): Promise<Array<ISessionEntry>>;
        /**
         * Clears the users session cookie so that its no longer tracked
         * @param sessionId The session ID to remove, if null then the currently authenticated session will be used
         * @param request
         * @param response
         */
        clearSession(sessionId: string | null, request: http.ServerRequest, response: http.ServerResponse): Promise<boolean>;
        /**
         * Attempts to get a session from the request object of the client
         * @param request
         * @param response
         * @returns Returns a session or null if none can be found
         */
        getSession(request: http.ServerRequest, response: http.ServerResponse | null): Promise<Session | null>;
        /**
         * Attempts to create a session from the request object of the client
         * @param shortTerm If true, we use the short term cookie. Otherwise the longer term one is used. (See session options)
         * @param response
         */
        createSession(shortTerm: boolean, response: http.ServerResponse): Promise<Session>;
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
    }
    /**
     * A class to represent session data
     */
    export class Session {
        _id: mongodb.ObjectID;
        sessionId: string;
        data: {
            shortTerm: boolean;
        };
        /**
         * The specific time when this session will expire
         */
        expiration: number;
        /**
         * The options of this session system
         */
        options: ISessionOptions;
        /**
         * Creates an instance of the session
         * @param sessionId The ID of the session
         * @param options The options associated with this session
         * @param data The data of the session in the database
         */
        constructor(sessionId: string, options: ISessionOptions);
        /**
         * Fills in the data of this session from the data saved in the database
         * @param data The data fetched from the database
         */
        open(data: ISessionEntry): void;
        /**
         * Creates an object that represents this session to be saved in the database
         */
        save(): ISessionEntry;
        /**
         * This method returns the value to send in the Set-Cookie header which you should send with every request that goes back to the browser, e.g.
         * response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
         */
        getSetCookieHeaderValue(): any;
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
declare module "core/bucket-manager" {
    import { IConfig, IBucketEntry, IFileEntry, IStorageStats } from 'modepress';
    import * as gcloud from 'gcloud';
    import * as mongodb from 'mongodb';
    import * as multiparty from 'multiparty';
    import express = require('express');
    /**
     * Class responsible for managing buckets and uploads to Google storage
     */
    export class BucketManager {
        private static MEMORY_ALLOCATED;
        private static API_CALLS_ALLOCATED;
        private static _singleton;
        private _gcs;
        private _buckets;
        private _files;
        private _stats;
        private _zipper;
        private _unzipper;
        private _deflater;
        constructor(buckets: mongodb.Collection, files: mongodb.Collection, stats: mongodb.Collection, config: IConfig);
        /**
         * Fetches all bucket entries from the database
         * @param user [Optional] Specify the user. If none provided, then all buckets are retrieved
         * @param searchTerm [Optional] Specify a search term
         */
        getBucketEntries(user?: string, searchTerm?: RegExp): Promise<Array<IBucketEntry>>;
        /**
         * Fetches the file count based on the given query
         * @param searchQuery The search query to idenfify files
         */
        numFiles(searchQuery: IFileEntry): Promise<number>;
        /**
         * Fetches all file entries by a given query
         * @param searchQuery The search query to idenfify files
         */
        getFiles(searchQuery: any, startIndex?: number, limit?: number): Promise<Array<IFileEntry>>;
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
        getFilesByBucket(bucket: IBucketEntry, startIndex?: number, limit?: number, searchTerm?: RegExp): Promise<Array<IFileEntry>>;
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
         * Attempts to create a new google storage bucket
         * @param bucketID The id of the bucket entry
         */
        private createGBucket(bucketID);
        /**
         * Attempts to create a new user bucket by first creating the storage on the cloud and then updating the internal DB
         * @param name The name of the bucket
         * @param user The user associated with this bucket
         */
        createBucket(name: string, user: string): Promise<gcloud.IBucket>;
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
        private deleteGBucket(bucketId);
        /**
         * Deletes the bucket from storage and updates the databases
         */
        private deleteBucket(bucketEntry);
        /**
         * Deletes a file from google storage
         * @param bucketId
         * @param fileId
         */
        private deleteGFile(bucketId, fileId);
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
        removeFiles(searchQuery: any): Promise<Array<string>>;
        /**
         * Attempts to remove files from the cloud and database
        * @param fileIDs The file IDs to remove
        * @param user Optionally pass in the user to refine the search
        * @returns Returns the file IDs of the files removed
        */
        removeFilesByIdentifiers(fileIDs: Array<string>, user?: string): Promise<Array<string>>;
        /**
         * Attempts to remove files from the cloud and database that are in a given bucket
         * @param bucket The id or name of the bucket to remove
         * @returns Returns the file IDs of the files removed
         */
        removeFilesByBucket(bucket: string): Promise<Array<string> | Error>;
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
         * Makes a google file publicly or private
         * @param bucketId
         * @param fileId
         * @param val
         */
        private makeGFilePublic(bucketId, fileId, val);
        /**
         * Makes a file publicly available
         * @param file
         */
        makeFilePublic(file: IFileEntry): Promise<IFileEntry>;
        /**
         * Makes a file private
         * @param file
         */
        makeFilePrivate(file: IFileEntry): Promise<IFileEntry>;
        /**
         * Registers an uploaded part as a new user file in the local dbs
         * @param fileID The id of the file on the bucket
         * @param bucketID The id of the bucket this file belongs to
         * @param part
         * @param user The username
         * @param isPublic IF true, the file will be set as public
         * @param parentFile Sets an optional parent file - if the parent is removed, then so is this one
         */
        private registerFile(fileID, bucket, part, user, isPublic, parentFile);
        private generateRandString(len);
        /**
         * Uploads a part stream as a new user file. This checks permissions, updates the local db and uploads the stream to the bucket
         * @param part
         * @param bucket The bucket to which we are uploading to
         * @param user The username
         * @param makePublic Makes this uploaded file public to the world
         * @param parentFile [Optional] Set a parent file which when deleted will detelete this upload as well
         */
        uploadStream(part: multiparty.Part, bucketEntry: IBucketEntry, user: string, makePublic?: boolean, parentFile?: string | null): Promise<IFileEntry>;
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
         * Downloads the data from the cloud and sends it to the requester. This checks the request for encoding and
         * sets the appropriate headers if and when supported
         * @param request The request being made
         * @param response The response stream to return the data
         * @param file The file to download
         */
        downloadFile(request: express.Request, response: express.Response, file: IFileEntry): void;
        /**
         * Finds and downloads a file
         * @param fileID The file ID of the file on the bucket
         * @returns Returns the number of results affected
         */
        updateStorage(user: string, value: IStorageStats): Promise<number>;
        /**
         * Creates the bucket manager singleton
         */
        static create(buckets: mongodb.Collection, files: mongodb.Collection, stats: mongodb.Collection, config: IConfig): BucketManager;
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
declare module "core/users" {
    import { IUserEntry, IConfig } from 'modepress';
    import * as mongodb from 'mongodb';
    import * as http from 'http';
    import * as express from 'express';
    import { SessionManager } from "core/session";
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
    /**
     * Main class to use for managing users
     */
    export class UserManager {
        private static _singleton;
        sessionManager: SessionManager;
        private _userCollection;
        private _config;
        private _mailer;
        /**
         * Creates an instance of the user manager
         * @param userCollection The mongo collection that stores the users
         * @param sessionCollection The mongo collection that stores the session data
         * @param The config options of this manager
         */
        constructor(userCollection: mongodb.Collection, sessionCollection: mongodb.Collection, config: IConfig);
        /**
         * Called whenever a session is removed from the database
         */
        onSessionRemoved(sessionId: string): Promise<void>;
        /**
         * Initializes the API
         */
        initialize(): Promise<void>;
        /**
         * Attempts to register a new user
         * @param username The username of the user
         * @param pass The users secret password
         * @param email The users email address
         * @param meta Any optional data associated with this user
         * @param request
         * @param response
         */
        register(username: string | undefined, pass: string | undefined, email: string | undefined, activationUrl: string | undefined, meta: any, request: express.Request): Promise<User>;
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
        sendAdminEmail(message: string, name?: string, from?: string): Promise<any>;
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
         * Checks to see if a user is logged in
         * @param request
         * @param response
         * @param Gets the user or null if the user is not logged in
         */
        loggedIn(request: http.ServerRequest, response: http.ServerResponse | null): Promise<User | null>;
        /**
         * Attempts to log the user out
         * @param request
         * @param response
         */
        logOut(request: http.ServerRequest, response: http.ServerResponse): Promise<boolean>;
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
        logIn(username: string | undefined, pass: string | undefined, rememberMe: boolean | undefined, request: http.ServerRequest, response: http.ServerResponse): Promise<User>;
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
        setMeta(user: IUserEntry, data?: any): Promise<boolean | any>;
        /**
         * Sets a meta value on the user. This updates the user's meta value by name
         * @param user The user
         * @param name The name of the meta to set
         * @param data The value of the meta to set
         * @returns {Promise<boolean|any>} Returns the value of the set
         */
        setMetaVal(user: IUserEntry, name: string, val: any): Promise<boolean | any>;
        /**
         * Gets the value of user's meta by name
         * @param user The user
         * @param name The name of the meta to get
         * @returns The value to get
         */
        getMetaVal(user: IUserEntry, name: string): Promise<boolean | any>;
        /**
         * Gets the meta data of a user
         * @param user The user
         * @returns The value to get
         */
        getMetaData(user: IUserEntry): Promise<boolean | any>;
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
        getUsers(startIndex?: number, limit?: number, searchPhrases?: RegExp): Promise<Array<User>>;
        /**
         * Creates the user manager singlton
         */
        static create(users: mongodb.Collection, sessions: mongodb.Collection, config: IConfig): UserManager;
        /**
         * Gets the user manager singlton
         */
        static readonly get: UserManager;
    }
}
declare module "utils/serializers" {
    import { IResponse } from 'modepress';
    import * as express from 'express';
    /**
     * Helper function to return a status 200 json object of type T
     */
    export function okJson<T extends IResponse>(data: T, res: express.Response): void;
    /**
     * Helper function to return a status 200 json object of type T
     */
    export function errJson(err: Error, res: express.Response): void;
}
declare module "utils/permission-controllers" {
    import { IAuthReq } from 'modepress';
    import * as express from 'express';
    import { UserPrivileges } from "core/users";
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
    export function adminRights(req: IAuthReq, res: express.Response, next?: Function): any;
    export function checkVerbosity(req: IAuthReq, res: express.Response, next?: Function): any;
    /**
     * Checks for session data and fetches the user. Does not throw an error if the user is not present.
     */
    export function identifyUser(req: IAuthReq, res: express.Response, next?: Function): any;
    /**
     * Checks for session data and fetches the user. Sends back an error if no user present
     */
    export function requireUser(req: IAuthReq, res: express.Response, next?: Function): any;
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
declare module "controllers/posts-controller" {
    import { IConfig, IServer } from 'modepress';
    import * as express from 'express';
    import { Controller } from "controllers/controller";
    /**
     * A controller that deals with the management of posts
     */
    export class PostsController extends Controller {
        /**
         * Creates a new instance of the controller
         * @param server The server configuration options
         * @param config The configuration options
         * @param e The express instance of this server
         */
        constructor(server: IServer, config: IConfig, e: express.Express);
        /**
         * Returns an array of IPost items
         */
        private getPosts(req, res);
        /**
         * Returns a single post
         */
        private getPost(req, res);
        /**
         * Returns an array of ICategory items
         */
        private getCategories(req, res);
        /**
         * Attempts to remove a post by ID
         */
        private removePost(req, res);
        /**
         * Attempts to remove a category by ID
         */
        private removeCategory(req, res);
        /**
         * Attempts to update a post by ID
         */
        private updatePost(req, res);
        /**
         * Attempts to create a new post
         */
        private createPost(req, res);
        /**
         * Attempts to create a new category item
         */
        private createCategory(req, res);
    }
}
declare module "models/comments-model" {
    import { Model } from "models/model";
    /**
     * A model for describing comments
     */
    export class CommentsModel extends Model {
        constructor();
    }
}
declare module "controllers/comments-controller" {
    import { IConfig, IServer } from 'modepress';
    import * as express from 'express';
    import { Controller } from "controllers/controller";
    /**
     * A controller that deals with the management of comments
     */
    export class CommentsController extends Controller {
        /**
         * Creates a new instance of the controller
         * @param server The server configuration options
         * @param config The configuration options
         * @param e The express instance of this server
         */
        constructor(server: IServer, config: IConfig, e: express.Express);
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
declare module "models/bucket-model" {
    import { Model } from "models/model";
    /**
     * A model for describing comments
     */
    export class BucketModel extends Model {
        constructor();
    }
}
declare module "controllers/bucket-controller" {
    import { IConfig } from 'modepress';
    import express = require('express');
    import { Controller } from "controllers/controller";
    /**
     * Main class to use for managing users
     */
    export class BucketController extends Controller {
        private _config;
        private _allowedFileTypes;
        /**
         * Creates an instance of the user manager
         * @param e The express app
         * @param The config options of this manager
         */
        constructor(e: express.Express, config: IConfig);
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
declare module "models/users-model" {
    import { Model } from "models/model";
    /**
     * A model for describing comments
     */
    export class UsersModel extends Model {
        constructor();
    }
}
declare module "controllers/auth-controller" {
    import { IConfig, IServer } from 'modepress';
    import express = require('express');
    import { Controller } from "controllers/controller";
    /**
     * Main class to use for managing users
     */
    export class AuthController extends Controller {
        private _config;
        private _server;
        /**
         * Creates an instance of the user manager
         * @param userCollection The mongo collection that stores the users
         * @param sessionCollection The mongo collection that stores the session data
         * @param The config options of this manager
         */
        constructor(e: express.Express, config: IConfig, server: IServer);
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
declare module "controllers/cors-controller" {
    import { IServer } from 'modepress';
    import { Controller } from "controllers/controller";
    import * as express from 'express';
    /**
     * Checks all incomming requests to see if they are CORS approved
     */
    export class CORSController extends Controller {
        /**
         * Creates an instance of the user manager
         */
        constructor(e: express.Express, config: IServer);
    }
}
declare module "controllers/emails-controller" {
    import { IConfig, IServer } from 'modepress';
    import * as express from 'express';
    import * as controllerModule from "controllers/controller";
    export class EmailsController extends controllerModule.Controller {
        /**
         * Creates a new instance of the email controller
         * @param server The server configuration options
         * @param config The configuration options
         * @param e The express instance of this server
         */
        constructor(server: IServer, config: IConfig, e: express.Express);
        /**
         * Called whenever a post request is caught by this controller
         */
        protected onPost(req: express.Request, res: express.Response): any;
    }
}
declare module "controllers/error-controller" {
    import { Controller } from "controllers/controller";
    import express = require('express');
    /**
     * Handles express errors
     */
    export class ErrorController extends Controller {
        /**
         * Creates an instance
         */
        constructor(e: express.Express);
    }
}
declare module "controllers/file-controller" {
    import { IConfig } from 'modepress';
    import express = require('express');
    import { Controller } from "controllers/controller";
    /**
     * Main class to use for managing users
     */
    export class FileController extends Controller {
        private _config;
        private _allowedFileTypes;
        /**
         * Creates an instance of the user manager
         * @param e The express app
         * @param The config options of this manager
         */
        constructor(e: express.Express, config: IConfig);
        /**
         * Removes files specified in the URL
         */
        private removeFiles(req, res);
        /**
         * Renames a file
         */
        private renameFile(req, res);
        /**
         * Attempts to download a file from the server
         */
        private getFile(req, res);
        /**
         * Attempts to make a file public
         */
        private makePublic(req, res);
        /**
         * Attempts to make a file private
         */
        private makePrivate(req, res);
        /**
         * Fetches all file entries from the database. Optionally specifying the bucket to fetch from.
         */
        private getFiles(req, res);
    }
}
declare module "modepress" {
    import * as _Controller from "controllers/controller";
    import * as _PostController from "controllers/posts-controller";
    import * as _CommentsController from "controllers/comments-controller";
    import * as _BucketController from "controllers/bucket-controller";
    import * as _AuthController from "controllers/auth-controller";
    import * as _CorsController from "controllers/cors-controller";
    import * as _EmailsController from "controllers/emails-controller";
    import * as _ErrorController from "controllers/error-controller";
    import * as _FileController from "controllers/file-controller";
    import * as users from "core/users";
    import * as bucketManager from "core/bucket-manager";
    import * as _Models from "models/model";
    import * as _SchemaFactory from "models/schema-items/schema-item-factory";
    import { isValidObjectID } from "utils/utils";
    export const Controller: typeof _Controller.Controller;
    export const PostController: typeof _PostController.PostsController;
    export const CommentsController: typeof _CommentsController.CommentsController;
    export const BucketController: typeof _BucketController.BucketController;
    export const AuthController: typeof _AuthController.AuthController;
    export const CorsController: typeof _CorsController.CORSController;
    export const EmailsController: typeof _EmailsController.EmailsController;
    export const ErrorController: typeof _ErrorController.ErrorController;
    export const FileController: typeof _FileController.FileController;
    export const Model: typeof _Models.Model;
    export const SchemaFactory: typeof _SchemaFactory;
    export const UserManager: typeof users.UserManager;
    export const BucketManager: typeof bucketManager.BucketManager;
    export const isValidID: typeof isValidObjectID;
}
