declare namespace Modepress {

    /*
     * Base interface for all models
     */
    export interface IModelEntry {
        _id?: any;
        _requiredDependencies?: Array<{ collection: string, _id: any }>
        _optionalDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
        _arrayDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
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

    /*
     * Describes the category model
     */
    export interface ICategory extends IModelEntry {
        title?: string;
        slug?: string;
        parent?: string;
        description?: string;
    }

    /*
     * The most basic response from the server. The base type of all responses.
     */
    export interface IResponse {
        message: string;
        error: boolean;
    }

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

    /*
     * An interface to describe the data stored in the database from the sessions
     */
    export interface ISessionEntry {
        _id?: any;
        sessionId?: string;
        data?: any;
        expiration?: number;
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

    /*
     * The token used for logging in
     */
    export interface ILoginToken {
        username: string;
        password: string;
        rememberMe: boolean;
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

    export interface IMessage {
        name: string;
        email: string;
        message: string;
        phone?: string;
        website?: string;
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

    /**
     * Describes the controller structure of plugins in the config file
     */
    export interface IControllerPlugin {
        path: string;
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

    /**
     * A definition of each item in the model
     */
    class SchemaItem<T> {
        public name: string;
        public value: T;

        constructor( name: string, value: T );

        /**
         * Creates a clone of this item
         * @returns copy A sub class of the copy
         */
        public clone( copy?: SchemaItem<T> ): SchemaItem<T>;

        /**
         * Gets if this item is sensitive
         */
        public getSensitive(): boolean;

        /**
         * Sets if this item is sensitive
         */
        public setSensitive( val: boolean ): SchemaItem<T>;

        /**
         * Gets if this item is required. This will throw an error on the item if the value is not set before validation
         */
        public getRequired(): boolean;

        /**
         * Sets if this item is required. This will throw an error on the item if the value is not set before validation
         */
        public setRequired( val: boolean ): SchemaItem<T>;

        /**
         * Gets if this item is read only. If true, then the value can only be set when the item is created
         * and any future updates are ignored
         */
        public getReadOnly(): boolean;

        /**
         * Sets if this item is required. If true, then the value can only be set when the item is created
         * and any future updates are ignored
         */
        public setReadOnly( val: boolean ): SchemaItem<T>;

        /**
         * Gets if this item is indexable by mongodb
         */
        public getIndexable(): boolean;

        /**
         * Gets if this item represents a unique value in the database. An example might be a username
         */
        public getUnique(): boolean;

        /**
         * Sets if this item is indexable by mongodb
         */
        public setIndexable( val?: boolean ): SchemaItem<T>;

        /**
         * Sets if this item represents a unique value in the database. An example might be a username
         */
        public setUnique( val?: boolean ): SchemaItem<T>;

        /**
         * Checks the value stored to see if its correct in its current form
         */
        public validate(): Promise<boolean>;

        /**
         * Gets the value of this item in a database safe format
         */
        public getDbValue(): T

        /**
         * Gets the value of this item
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        public getValue( options?: ISchemaOptions ): T | Promise<T>;

        /**
         * Called once a model instance and its schema has been validated and inserted/updated into the database. Useful for
         * doing any post update/insert operations
         * @param instance The model instance that was inserted or updated
         * @param collection The DB collection that the model was inserted into
         */
        public postUpsert<T extends Modepress.IModelEntry>( instance: ModelInstance<T>, collection: string ): Promise<void>;

        /**
         * Called after a model instance is deleted. Useful for any schema item cleanups.
         * @param instance The model instance that was deleted
         * @param collection The DB collection that the model was deleted from
         */
        public postDelete<T extends Modepress.IModelEntry>( instance: ModelInstance<T>, collection: string ): Promise<Schema>;

        /**
         * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
         * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
         * a given project. In this case the project item is set as a uniqueIndexer
         */
        public getUniqueIndexer(): boolean;

        /**
         * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
         * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
         * a given project. In this case the project item is set as a uniqueIndexer
         */
        public setUniqueIndexer( val?: boolean ): SchemaItem<T>;
    }

    /**
     * Gives an overall description of each property in a model
     */
    class Schema {
        constructor();

        /**
         * Gets the schema items associated with this schema
         */
        public getItems: Array<SchemaItem<any>>;

        /**
         * Creates a copy of the schema
         */
        public clone(): Schema;

        /**
         * Sets a schema value by name
         * @param name The name of the schema item
         * @param val The new value of the item
         */
        set( name: string, val: any );

        /**
         * De-serializes the schema items from the mongodb data entry
         * @param data
         */
        public deserialize( data: any ): any;

        /**
         * Serializes the schema items into the JSON format for mongodb
         */
        public serialize(): any;

        /**
         * Serializes the schema items into the JSON format for mongodb
         * @param id The models dont store the _id property directly, and so this has to be passed for serialization
         * @param options [Optional] A set of options that can be passed to control how the data must be returned
         */
        public getAsJson<T>( id: any, options?: ISchemaOptions ): Promise<T>;

        /**
         * Checks the values stored in the items to see if they are correct
         * @returns Returns true if successful
         */
        public validate(): Promise<boolean>;

        /**
         * Gets a schema item from this schema by name
         * @param val The name of the item
         */
        public getByName( val: string ): SchemaItem<any>;

        /**
         * Adds a schema item to this schema
         * @param val The new item to add
         */
        public add( val: SchemaItem<any> ): SchemaItem<any>;

        /**
         * Removes a schema item from this schema
         * @param val The name of the item or the item itself
         */
        public remove( val: SchemaItem<any> | string );
    }

    export interface UpdateToken<T> { error: string | boolean; instance: ModelInstance<T> }

    /*
     * Describes a token returned from updating instances
     */
    export interface UpdateRequest<T> { error: boolean; tokens: Array<UpdateToken<T>> }

    /**
     * An instance of a model with its own unique schema and ID. The initial schema is a clone
     * the parent model's
     */
    class ModelInstance<T> {
        public model: Model;
        public schema: Schema;
        public dbEntry: T;
        public _id: any;

        /**
         * Creates a model instance
         */
        constructor( model: Model, dbEntry: T );
    }

    /**
     * Models map data in the application/client to data in the database
     */
    export class Model {
        public collection: any;
        public defaultSchema: Schema;

        /**
         * Creates an instance of a Model
         * @param collection The collection name associated with this model
         */
        constructor( collection: string );

        /**
         * Returns a registered model by its name
         * @param name The name of the model to fetch
         * @returns Returns the registered model or null if none exists
         */
        static getByName( name: string ): Model;

        /**
         * Returns a new model of a given type. However if the model was already registered before,
         * then the previously created model is returned.
         * @param modelConstructor The model class
         * @returns Returns the registered model
         */
        static registerModel<T extends Model>( modelConstructor: any ): T;

        /**
         * Gets the name of the collection associated with this model
         */
        collectionName: string;

        /**
         * Initializes the model by setting up the database collections
         * @param db The database used to create this model
         */
        initialize( db: any ): Promise<Model>;

        /**
         * Gets the number of DB entries based on the selector
         * @param selector The mongodb selector
         */
        count( selector: any ): Promise<number>;

        /**
         * Gets an arrray of instances based on the selector search criteria
         * @param selector The mongodb selector
         * @param sort Specify an array of items to sort.
         * Each item key represents a field, and its associated number can be either 1 or -1 (asc / desc)
         * @param startIndex The start index of where to select from
         * @param limit The number of results to fetch
         * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
        */
        findInstances<T>( selector: any, sort?: any, startIndex?: number, limit?: number, projection?: any ): Promise<Array<ModelInstance<T>>>;

        /**
         * Gets a model instance based on the selector criteria
         * @param selector The mongodb selector
         * @param projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
         */
        findOne<T>( selector: any, projection?: any ): Promise<ModelInstance<T>>;

        /**
         * Deletes a number of instances based on the selector. The promise reports how many items were deleted
         */
        deleteInstances( selector: any ): Promise<number>;

        /**
         * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
         * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
         * with updating the specific instance.
         * @param selector The selector for updating instances
         * @param data The data object that will attempt to set the instance's schema variables
         * @returns {Promise<UpdateRequest<T>>} An array of objects that contains the field error and instance. Error is false if nothing
         * went wrong when updating the specific instance, and a string message if something did in fact go wrong
         */
        update<T>( selector: any, data: T ): Promise<UpdateRequest<T>>

        /**
         * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
         * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
         * by parsing the data object and setting each schema item's value by the name/value in the data object
         */
        checkUniqueness<T>( instance: ModelInstance<T> ): Promise<boolean>;

        /**
         * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
         * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
         * by parsing the data object and setting each schema item's value by the name/value in the data object
         */
        createInstance<T>( data?: any ): Promise<ModelInstance<T>>;

        /**
         * Attempts to insert an array of instances of this model into the database.
         * @param instances An array of instances to save
         */
        insert<T>( instances: Array<ModelInstance<T>> ): Promise<Array<ModelInstance<T>>>;

    }

    export class Controller {
        constructor( models: Array<Model> | null );

        /**
         * Called to initialize this controller and its related database objects
         * @param db The mongo database to use
         */
        initialize( db: any ): Promise<Controller>;

        /**
         * Gets a model by its collection name
         */
        getModel( collectionName: string ): Model;
    }

    /**
     * Singleton service for communicating with a webinate-users server
     */
    export class UsersService {
        public static usersURL: string;

        /**
         * Creates an instance of the service
         * @param usersURL The URL of the user management service
         */
        constructor( usersURL: string );

        /**
         * Sends an email to the admin account
         * @param message The message to send
         */
        sendAdminEmail( message: string ): Promise<any>;

        /**
         * Checks if a user is logged in and authenticated
         */
        authenticated( req: any, res: any ): Promise<IAuthenticationResponse>;

        /**
         * Checks a user has admin rights
         * @param user The user we are checking
         */
        isAdmin( user: IUserEntry ): boolean;

        /**
         * Checks a user has the desired permission
         * @param user The user we are checking
         * @param level The level we are checking against
         * @param existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
         */
        hasPermission( user: IUserEntry, level: number, existingUser?: string ): boolean;

        /**
         * Attempts to log a user in
         * @param user The email or username
         * @param password The users password
         */
        login( user: string, password: string, remember: boolean ): Promise<IAuthenticationResponse>;

        /**
         * Attempts to get a user by username or email
         * @param user The username or email
         */
        getUser( user: string, req: Express.Request ): Promise<IGetUser>;

        /**
         * Gets the user singleton
         */
        public static getSingleton( usersURL?: string ): UsersService;
    }

    /**
     * Describes the type of number to store
     */
    enum NumberType {
        Integer,
        Float
    }

    /**
     * A numeric schema item for use in Models
     */
    class SchemaNumber extends SchemaItem<number> {
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The default value of this item
         * @param min [Optional] The minimum value the value can be
         * @param max [Optional] The maximum value the value can be
         * @param type [Optional] The type of number the schema represents
         * @param decimalPlaces [Optional] The number of decimal places to use if the type is a Float
         */
        constructor( name: string, val: number, min?: number, max?: number, type?: NumberType, decimalPlaces?: number )
    }

    /**
     * Represents a mongodb ObjectID of a document in separate collection.
     * Foreign keys are used as a way of relating models to one another. They can be required or optional.
     * Required keys will mean that the current document cannot exist if the target does not. Optional keys
     * will simply be nullified if the target no longer exists.
     */
    export class SchemaForeignKey extends SchemaItem<any | string | Modepress.IModelEntry> {
        public targetCollection: string;
        public optionalKey: boolean;

        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The string representation of the foreign key's _id
         * @param targetCollection The name of the collection to which the target exists
         * @param optionalKey If true, then this key will only be nullified if the target is removed
         */
        constructor( name: string, val: string, targetCollection: string, optionalKey?: boolean );
    }


    /**
     * A text scheme item for use in Models
     */
    class SchemaText extends SchemaItem<string> {
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The text of this item
         * @param minCharacters [Optional] Specify the minimum number of characters for use with this text item
         * @param maxCharacters [Optional] Specify the maximum number of characters for use with this text item
         */
        constructor( name: string, val: string, minCharacters?: number, maxCharacters?: number );
    }

    /**
     * A n ID array scheme item for use in Models
     */
    export class SchemaIdArray extends SchemaItem<Array<any>> {
        /**
         * Creates a new schema item that holds an array of id items
         * @param name The name of this item
         * @param val The array of ids for this schema item
         * @param minItems [Optional] Specify the minimum number of items that can be allowed
         * @param maxItems [Optional] Specify the maximum number of items that can be allowed
         */
        constructor( name: string, val: Array<string>, minItems?: number, maxItems?: number );
    }

    /**
     * A number array scheme item for use in Models
     */
    export class SchemaNumArray extends SchemaItem<Array<number>> {
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
        constructor( name: string, val: Array<number>, minItems?: number, maxItems?: number, min?: number, max?: number, type?: NumberType, decimalPlaces?)
    }

    /**
     * A text scheme item for use in Models
     */
    class SchemaTextArray extends SchemaItem<Array<string>> {
        /**
         * Creates a new schema item that holds an array of text items
         * @param name The name of this item
         * @param val The text array of this schema item
         * @param minItems [Optional] Specify the minimum number of items that can be allowed
         * @param maxItems [Optional] Specify the maximum number of items that can be allowed
         * @param minCharacters [Optional] Specify the minimum number of characters for each text item
         * @param maxCharacters [Optional] Specify the maximum number of characters for each text item
         */
        constructor( name: string, val: Array<string>, minItems?: number, maxItems?: number, minCharacters?: number, maxCharacters?: number );
    }

    /**
     * A bool scheme item for use in Models
     */
    class SchemaBool extends SchemaItem<boolean> {
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The value of this item
         */
        constructor( name: string, val: boolean );
    }

    /**
     * A json scheme item for use in Models
     */
    class SchemaJSON extends SchemaItem<any> {
        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The text of this item
         */
        constructor( name: string, val: any );
    }

    /**
    * A date scheme item for use in Models
     */
    class SchemaDate extends SchemaItem<number> {
        public useNow: boolean;

        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The date of this item. If none is specified the Date.now() number is used.
         * @param useNow [Optional] If true, the date will always be updated to use the current date
         */
        constructor( name: string, val?: number, useNow?: boolean );
    }

    /**
     * A mongodb ObjectID scheme item for use in Models
     */
    export class SchemaId extends SchemaItem<any> {
        private _str: string;

        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The string representation of the object ID
         */
        constructor( name: string, val: string );
    }

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
        public static defaultTags: Array<string>;

        /**
         * The default allowed attributes for each tag
         */
        public static defaultAllowedAttributes: { [ name: string ]: Array<string> };

        /**
         * Creates a new schema item
         * @param name The name of this item
         * @param val The text of this item
         * @param allowedTags The tags allowed by the html parser
         * @param allowedAttributes The attributes allowed by each attribute
         * @param errorBadHTML If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you
         * @param minCharacters [Optional] Specify the minimum number of characters for use with this text item
         * @param maxCharacters [Optional] Specify the maximum number of characters for use with this text item
         * @param htmlClean [Optional] If true, the text is cleaned of HTML before insertion. The default is true
         */
        constructor( name: string, val: string, allowedTags?: Array<string>,
            allowedAttributes?: { [ name: string ]: Array<string> },
            errorBadHTML?: boolean, minCharacters?: number, maxCharacters?: number, htmlClean?: boolean );
    }

    /**
     * A list of helper functions for creating schema items
     */
    export namespace SchemaFactory {
        export const num: typeof SchemaNumber;
        export const text: typeof SchemaText;
        export const textArray: typeof SchemaTextArray;
        export const json: typeof SchemaJSON;
        export const numArray: typeof SchemaNumArray;
        export const idArray: typeof SchemaIdArray;
        export const date: typeof SchemaDate;
        export const bool: typeof SchemaBool;
        export const id: typeof SchemaId;
        export const html: typeof SchemaHtml;
        export const foreignKey: typeof SchemaForeignKey;
    }

    /**
     * A class for handling events sent from a webinate user server
     */
    export class EventManager implements NodeJS.EventEmitter {
        static singleton: EventManager;

        addListener( event: string, listener: Function ): this;
        on( event: string, listener: Function ): this;
        once( event: string, listener: Function ): this;
        removeListener( event: string, listener: Function ): this;
        removeAllListeners( event?: string ): this;
        setMaxListeners( n: number ): this;
        getMaxListeners(): number;
        listeners( event: string ): Function[];
        emit( event: string, ...args: any[] ): boolean;
        listenerCount( type: string ): number;
    }

    /**
     * Checks a string to see if its a valid mongo id
     */
    export function isValidID( str: string ): boolean;
}

declare module 'modepress-api' {
    export = Modepress;
}