declare module Modepress
{
    /*
    * Base interface for all models
    */
    export interface IModelEntry
    {
        _id?: any;
    }

    /*
    * Describes the post model
    */
    export interface IPost extends IModelEntry
    {
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
    * Describes the category model
    */
    export interface ICategory extends IModelEntry
    {
        title?: string;
        slug?: string;
        parent?: string;
        description?: string;
    }

    /*
    * The most basic response from the server. The base type of all responses.
    */
    export interface IResponse
    {
        message: string;
        error: boolean;
    }

    /*
    * A response for when bulk items are deleted
    */
    export interface IRemoveResponse extends IResponse
    {
        itemsRemoved: Array<{ id: string; error: boolean; errorMsg: string; }>;
    }

    export interface UpdateToken<T> { error: string | boolean; instance: ModelInstance<T> }

    /*
    * Describes a token returned from updating instances
    */
    export interface UpdateRequest<T> { error: boolean; tokens: Array<UpdateToken<T>> }

    /*
    * Describes the cache renders model
    */
    export interface IRender extends IModelEntry
    {
        url?: string;
        expiration?: number;
        createdOn?: number;
        updateDate?: number;
        html?: string;
    }

    /*
    * A GET request that returns a data item
    */
    export interface IGetResponse<T> extends IResponse
    {
        data: T;
    }

    /*
    * A GET request that returns an array of data items
    */
    export interface IGetArrayResponse<T> extends IResponse
    {
        count: number;
        data: Array<T>;
    }

    export interface IMessage
    {
        name: string;
        email: string;
        message: string;
        phone?: string;
        website?: string;
    }

    export interface IGetRenders extends IGetArrayResponse<IRender> { }
    export interface IGetPosts extends IGetArrayResponse<IPost> { }
    export interface IGetPost extends IGetResponse<IPost> { }
    export interface IGetCategory extends IGetResponse<ICategory> { }
    export interface IGetCategories extends IGetArrayResponse<ICategory> { }

    /**
    * Describes the controller structure of plugins in the config file
    */
    export interface IControllerPlugin
    {
        path: string;
    }

    /**
    * Defines routes and the paths of a host / port
    */
    export interface IServer
    {
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
        * Set to true if you want SSL turned on
        */
        ssl: boolean;

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

        /**
        * An array of IPath objects that define routes and where they go to
        */
        paths: Array<IPath>

        /**
        * An array of controllers associated with this server
        */
        controllers: Array<IControllerPlugin>
    }

    /**
    * Defines routes and the paths they take
    */
    export interface IPath
    {
        /**
        * The name of this path
        */
        name: string;

        /**
        * The express route to use. E.g. "*" or "/some-route"
        */
        path: string;

        /**
        * The path of where to find jade templates for this route. E.g. "/templates"
        */
        templatePath: string;

        /**
        * The path or name of the template file to use. If a template path is set then the route resolves to
        * templatePath + index if the file exists. If it does then the express render function is used to send that jade file.
        * If not then the index is considered a static file and sent with the sendFile function.
        * e.g. "index"
        */
        index: string;

        /**
        * An array of javascript file paths for modepress plugins
        * e.g. ["./plugins/my-plugin/index.js"]
        */
        plugins: Array<string>;
    }

    /**
    * A server configuration
    */
    export interface IConfig
    {
        /**
        * The length of time the assets should be cached on a user's browser. The default is 30 days.
        */
        cacheLifetime: number;

        /**
        * If true, then modepress will render bot page crawls stripping all javascript source tags after the page is fully loaded. This
        * is accomplished by sending a headless browser request to the page and waiting for it to fully load. Once loaded the page is saved
        * and stripped of scripts. Any subsequent calls to the page will result in the saved page being presented as long as the expiration
        * has not been exceeded - if it has then a new render is done.
        * e.g. "127.0.0.1:3000"
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
        * A secret token to identify this server to the Users service
        */
        usersSecret: string;

        /**
        * The path to use for accessing the admin panel
        */
        adminURL: string;

        /**
        * An array of admin javascript plugin paths
        */
        adminPlugins: Array<string>;

        /**
        * An array of javascript variables that will be inserted on the page
        */
        adminPluginVariables: { [name: string]: string };

        /**
        * An array of servers for each host / route that modepress is supporting
        */
        servers: Array<IServer>;

        /**
        * The URL to listen for events from a webinate users socket
        * eg: 'ws://www.webinate.net:123'
        */
        usersSocketURL: string;

        /**
        * Specifies the header 'origin' when connecting to the user socket. This origin must be whitelisted on the users API config file.
        * eg: 'webinate.net'
        */
        usersSocketOrigin: string;
    }

    /**
    * A definition of each item in the model
    */
    class SchemaItem<T>
    {
        public name: string;
        public value: T;
        public sensitive: boolean;

        constructor(name: string, value: T, sensitive: boolean);

        /**
        * Creates a clone of this item
        * @returns {SchemaItem} copy A sub class of the copy
        * @returns {SchemaItem}
        */
        public clone(copy?: SchemaItem<T>): SchemaItem<T>;

        /**
        * Gets if this item is sensitive
        * @returns {boolean}
        */
        public getSensitive(): boolean;

        /**
        * Sets if this item is sensitive
        * @returns {SchemaItem<T>}
        */
        public setSensitive(val: boolean);

        /**
        * Gets if this item is indexable by mongodb
        * @returns {boolean}
        */
        public getIndexable(): boolean;

        /**
        * Gets if this item represents a unique value in the database. An example might be a username
        * @returns {boolean}
        */
        public getUnique(): boolean;

        /**
        * Sets if this item is indexable by mongodb
        * @returns {SchemaItem}
        */
        public setIndexable(val?: boolean): SchemaItem<T>;

        /**
        * Sets if this item represents a unique value in the database. An example might be a username
        * @returns {SchemaItem}
        */
        public setUnique(val?: boolean): SchemaItem<T>;

        /**
        * Checks the value stored to see if its correct in its current form
        * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
        */
        public validate(): boolean | string;

        /**
        * Gets the value of this item
        * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
        * @returns {SchemaValue}
        */
        public getValue(sanitize: boolean): T;

        /**
        * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
        * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
        * a given project. In this case the project item is set as a uniqueIndexer
        * @returns {boolean}
        */
        public getUniqueIndexer(): boolean;

        /**
        * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
        * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
        * a given project. In this case the project item is set as a uniqueIndexer
        * @returns {SchemaItem}
        */
        public setUniqueIndexer(val?: boolean): SchemaItem<T>;
    }

    /**
    * Gives an overall description of each property in a model
    */
    class Schema
    {
        public items: Array<SchemaItem<any>>;
        public error: string;

        constructor();

        /**
        * Creates a copy of the schema
        * @returns {Schema}
        */
        public clone(): Schema;

        /**
        * Sets a schema value by name
        * @param {string} name The name of the schema item
        * @param {any} val The new value of the item
        */
        set(name: string, val: any);

        /**
        * De-serializes the schema items from the mongodb data entry
        * @param {any} data
        */
        public deserialize(data: any): any;

        /**
        * Serializes the schema items into the JSON format for mongodb
        * @returns {any}
        */
        public serialize(): any;

        /**
        * Serializes the schema items into the JSON format for mongodb
        * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
        * @param {any} id The db ID of the instance to clean
        * @returns {any}
        */
        public generateCleanData(sanitize: boolean, id: any): any;

        /**
        * Checks the value stored to see if its correct in its current form
        * @returns {boolean} Returns true if successful
        */
        public validate(): boolean;

        /**
        * Gets a schema item from this schema by name
        * @param {string} val The name of the item
        * @param {SchemaItem}
        */
        public getByName(val: string): SchemaItem<any>;

        /**
        * Adds a schema item to this schema
        * @param {SchemaItem} val The new item to add
        * @returns {SchemaItem}
        */
        public add(val: SchemaItem<any>): SchemaItem<any>;

        /**
        * Removes a schema item from this schema
        * @param {SchemaItem|string} val The name of the item or the item itself
        */
        public remove(val: SchemaItem<any>|string);
    }

    /**
    * An instance of a model with its own unique schema and ID. The initial schema is a clone
    * the parent model's
    */
    class ModelInstance<T>
    {
        public model: Model;
        public schema: Schema;
        public dbEntry: T;
        public _id: any;

        /**
        * Creates a model instance
        */
        constructor(model: Model, dbEntry: T);
    }

    /**
    * Models map data in the application/client to data in the database
    */
    export class Model
    {
        public collection: any;
        public defaultSchema: Schema;

        /**
        * Creates an instance of a Model
        * @param {string} collection The collection name associated with this model
        */
        constructor(collection: string);

        /**
        * Gets the name of the collection associated with this model
        * @returns {string}
        */
        collectionName: string;

        /**
        * Initializes the model by setting up the database collections
        * @param {mongodb.Db} db The database used to create this model
        * @returns {Promise<mongodb.Db>}
        */
        initialize(db: any): Promise<Model>;

        /**
        * Gets the number of DB entries based on the selector
        * @param {any} selector The mongodb selector
        * @returns {Promise<Array<ModelInstance>>}
        */
        count(selector: any): Promise<number>;

        /**
        * Gets an arrray of instances based on the selector search criteria
        * @param {any} selector The mongodb selector
        * @param {any} sort Specify an array of items to sort.
        * Each item key represents a field, and its associated number can be either 1 or -1 (asc / desc)
        * @param {number} startIndex The start index of where to select from
        * @param {number} limit The number of results to fetch
        * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
        * @returns {Promise<Array<ModelInstance>>}
        */
        findInstances<T>(selector: any, sort?: any, startIndex?: number, limit?: number, projection?: any): Promise<Array<ModelInstance<T>>>;

        /**
        * Gets a model instance based on the selector criteria
        * @param {any} selector The mongodb selector
        * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
        * @returns {Promise<ModelInstance<T>>}
        */
        findOne<T>(selector: any, projection?: any): Promise<ModelInstance<T>>;

        /**
        * Deletes a number of instances based on the selector. The promise reports how many items were deleted
        * @returns {Promise<number>}
        */
        deleteInstances(selector: any): Promise<number>;

        /**
        * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
        * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
        * with updating the specific instance.
        * @param {any} selector The selector for updating instances
        * @param {any} data The data object that will attempt to set the instance's schema variables
        * @returns {Promise<UpdateRequest<T>>} An array of objects that contains the field error and instance. Error is false if nothing
        * went wrong when updating the specific instance, and a string message if something did in fact go wrong
        */
        update<T>(selector: any, data: T): Promise<UpdateRequest<T>>

        /**
        * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
        * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
        * by parsing the data object and setting each schema item's value by the name/value in the data object.
        * @returns {Promise<boolean>}
        */
        checkUniqueness<T>(instance: ModelInstance<T>): Promise<boolean>;

        /**
        * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
        * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
        * by parsing the data object and setting each schema item's value by the name/value in the data object.
        * @returns {Promise<ModelInstance>}
        */
        createInstance<T>(data?: any): Promise<ModelInstance<T>>;

        /**
        * Attempts to insert an array of instances of this model into the database.
        * @param {Promise<Array<ModelInstance>>} instances An array of instances to save
        * @returns {Promise<Array<ModelInstance>>}
        */
        insert<T>(instances: Array<ModelInstance<T>>): Promise<Array<ModelInstance<T>>>;

    }

    export class Controller
    {
        constructor(models: Array<Model>);

        /**
        * Called to initialize this controller and its related database objects
        * @param {mongodb.Db} db The mongo database to use
        * @returns {Promise<Controller>}
        */
        initialize(db: any): Promise<Controller>;

        /**
        * Gets a model by its collection name
        * returns {models.Model}
        */
        getModel(collectionName: string): Model;

        /**
        * Transforms an array of model instances to its data ready state that can be sent to the client
        * @param {ModelInstance} instances The instances to transform
        * @param {boolean} instances If true, sensitive data will not be sanitized
        * @returns {Array<T>}
        */
        getSanitizedData<T>(instances: Array<ModelInstance<T>>, verbose?: boolean): Array<T>;
    }

    /**
    * Singleton service for communicating with a webinate-users server
    */
    export class UsersService
    {
        public static usersURL: string;

        /**
        * Creates an instance of the service
        * @param {string} usersURL The URL of the user management service
        */
        constructor(usersURL: string);

        /**
        * Sends an email to the admin account
        * @param {string} message The message to send
        * @returns {Promise<any>}
        */
        sendAdminEmail(message: string): Promise<any>;

        /**
        * Sets a meta value by name for the specified user
        * @param {string} name The name of the meta value
        * @param {any} val The value to set
        * @param {string} user The username of the target user
        * @param {Request} req
        * @param {Response} res
        * @returns {Promise<UsersInterface.IResponse>}
        */
        setMetaValue(name: string, val: any, user: string, req, res): Promise<UsersInterface.IResponse>;

        /**
        * Checks if a user is logged in and authenticated
        * @param {express.Request} req
        * @param {express.Request} res
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
        */
        authenticated(req: any, res: any): Promise<UsersInterface.IAuthenticationResponse>;

        /**
        * Checks a user has the desired permission
        * @param {UsersInterface.IUserEntry} user The user we are checking
        * @param {UsersInterface.UserPrivileges} level The level we are checking against
        * @param {string} existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
        * @returns {boolean}
        */
        hasPermission(user: UsersInterface.IUserEntry, level: number, existingUser?: string): boolean;

        /**
	    * Attempts to log a user in
        * @param {string} user The email or username
        * @param {string} password The users password
        * @param {boolean} remember
	    * @returns {Promise<UsersInterface.IAuthenticationResponse>}
	    */
        login(user: string, password: string, remember: boolean): Promise<UsersInterface.IAuthenticationResponse>;

        /**
        * Attempts to get a user by username or email
        * @param {string} user The username or email
        * @param {Request} req
        */
        getUser(user: string, req: Express.Request): Promise<UsersInterface.IGetUser>;

        /**
        * Gets the user singleton
        * @returns {UsersService}
        */
        public static getSingleton(usersURL?: string): UsersService;
    }

    /**
    * Describes the type of number to store
    */
    enum NumberType
    {
        Integer,
        Float
    }

    /**
    * A numeric schema item for use in Models
    */
    class SchemaNumber extends SchemaItem<number>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {number} val The default value of this item
        * @param {number} min [Optional] The minimum value the value can be
        * @param {number} max [Optional] The maximum value the value can be
        * @param {NumberType} type [Optional] The type of number the schema represents
        * @param {number} decimalPlaces [Optional] The number of decimal places to use if the type is a Float
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: number, min?: number, max?: number, type?: NumberType, decimalPlaces?: number, sensitive?: boolean)
    }

    /**
    * A text scheme item for use in Models
    */
    class SchemaText extends SchemaItem<string>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {string} val The text of this item
        * @param {number} minCharacters [Optional] Specify the minimum number of characters for use with this text item
        * @param {number} maxCharacters [Optional] Specify the maximum number of characters for use with this text item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: string, minCharacters?: number, maxCharacters?: number, sensitive?: boolean);
    }

    /**
    * A n ID array scheme item for use in Models
    */
    export class SchemaIdArray extends SchemaItem<Array<any>>
    {
        /**
        * Creates a new schema item that holds an array of id items
        * @param {string} name The name of this item
        * @param {Array<string|ObjectID>} val The array of ids for this schema item
        * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
        * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: Array<string>, minItems?: number, maxItems?: number, sensitive?: boolean);
    }

    /**
    * A number array scheme item for use in Models
    */
    export class SchemaNumArray extends SchemaItem<Array<number>>
    {
        /**
        * Creates a new schema item that holds an array of number items
        * @param {string} name The name of this item
        * @param {Array<number>} val The number array of this schema item
        * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
        * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
        * @param {number} min [Optional] Specify the minimum a number can be
        * @param {number} max [Optional] Specify the maximum a number can be
        * @param {NumberType} type [Optional] What type of numbers to expect
        * @param {number} decimalPlaces [Optional] The number of decimal places to use if the type is a Float
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: Array<number>, minItems?: number, maxItems?: number, min?: number, max?: number, type?: NumberType, decimalPlaces?, sensitive?: boolean)
    }

    /**
    * A text scheme item for use in Models
    */
    class SchemaTextArray extends SchemaItem<Array<string>>
    {
        /**
        * Creates a new schema item that holds an array of text items
        * @param {string} name The name of this item
        * @param {Array<string>} val The text array of this schema item
        * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
        * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
        * @param {number} minCharacters [Optional] Specify the minimum number of characters for each text item
        * @param {number} maxCharacters [Optional] Specify the maximum number of characters for each text item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: Array<string>, minItems?: number, maxItems?: number, minCharacters?: number, maxCharacters?: number, sensitive?: boolean);
    }

    /**
    * A bool scheme item for use in Models
    */
    class SchemaBool extends SchemaItem<boolean>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {boolean} val The value of this item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: boolean, sensitive?: boolean);
    }

    /**
    * A json scheme item for use in Models
    */
    class SchemaJSON extends SchemaItem<any>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {any} val The text of this item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: any, sensitive: boolean);
    }

    /**
    * A date scheme item for use in Models
    */
    class SchemaDate extends SchemaItem<number>
    {
        public useNow: boolean;

        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {number} val The date of this item. If none is specified the Date.now() number is used.
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        * @param {boolean} useNow [Optional] If true, the date will always be updated to use the current date
        */
        constructor(name: string, val?: number, sensitive?: boolean, useNow?: boolean);
    }

    /**
    * A mongodb ObjectID scheme item for use in Models
    */
    export class SchemaId extends SchemaItem<any>
    {
        private _str: string;

        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {string} val The string representation of the object ID
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: string, sensitive?: boolean );
    }

    /**
    * An html scheme item for use in Models
    */
    export class SchemaHtml extends SchemaItem<string>
    {
        /**
        * The default tags allowed
        */
        public static defaultTags: Array<string>;

        /**
        * The default allowed attributes for each tag
        */
        public static defaultAllowedAttributes: { [name: string]: Array<string> };

        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {string} val The text of this item
        * @param {Array<string>} allowedTags The tags allowed by the html parser
        * @param {[name: string] : Array<string>} allowedAttributes The attributes allowed by each attribute
        * @param {boolean} errorBadHTML If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you
        * @param {number} minCharacters [Optional] Specify the minimum number of characters for use with this text item
        * @param {number} maxCharacters [Optional] Specify the maximum number of characters for use with this text item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        * @param {boolean} htmlClean [Optional] If true, the text is cleaned of HTML before insertion. The default is true
        */
        constructor(name: string, val: string, allowedTags?: Array<string>,
            allowedAttributes?: { [name: string]: Array<string> },
            errorBadHTML?: boolean, minCharacters?: number, maxCharacters?: number, sensitive?: boolean, htmlClean?: boolean);
    }

    /**
    * A list of helper functions for creating schema items
    */
    export module SchemaFactory
    {
        export var num: typeof SchemaNumber;
        export var text: typeof SchemaText;
        export var textArray: typeof SchemaTextArray;
        export var json: typeof SchemaJSON;
        export var numArray: typeof SchemaNumArray;
        export var idArray: typeof SchemaIdArray;
        export var date: typeof SchemaDate;
        export var bool: typeof SchemaBool;
        export var id: typeof SchemaId;
        export var html: typeof SchemaHtml;
    }

    /**
    * The type of user event
    */
    export enum UserEventType
    {
        Login,
        Logout,
        Activated,
        Removed,
        FilesUploaded,
        FilesRemoved
    }

    /**
    * Describes the user event sent to plugins
    */
    export interface UserEvent
    {
        username: string;
        eventType: UserEventType;
    }

    /**
    * A class for handling events sent from a webinate user server
    */
    export class EventManager implements NodeJS.EventEmitter
    {
        static singleton: EventManager;

        addListener(event: string, listener: Function): this;
        on(event: string, listener: Function): this;
        once(event: string, listener: Function): this;
        removeListener(event: string, listener: Function): this;
        removeAllListeners(event?: string): this;
        setMaxListeners(n: number): this;
        getMaxListeners(): number;
        listeners(event: string): Function[];
        emit(event: string, ...args: any[]): boolean;
        listenerCount(type: string): number;
    }

    export interface IAuthReq extends Express.Request
    {
        _isAdmin: boolean;
        _verbose: boolean;
        _user: UsersInterface.IUserEntry;
        body: any;
        headers: any;
        params: any;
        query: any;
    }

    /**
    * This funciton checks if user is logged in
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function isAdmin(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function canEdit(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * This funciton checks if user is logged in
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function getUser(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * This funciton checks the logged in user is an admin. If not an error is thrown
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function isAuthenticated(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * Checks a string to see if its a valid mongo id
    * @param {string} str
    * @returns {boolean} True if the string is valid
    */
    export function isValidID(str: string): boolean;
}

declare module "modepress-api"
{
    export = Modepress;
}