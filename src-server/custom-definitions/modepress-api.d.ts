declare module Modepress
{
    /*
    * Describes the post model
    */
    export interface IPost
    {
        _id?: any;
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
    export interface ICategory
    {
        _id?: any;
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
    * Describes the cache renders model
    */
    export interface IRender
    {
        _id?: any;
        url?: string;
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
        * [Optional] If set, modepress will communicate with this URL to serve SEO/social friendly renders of your site
        * e.g. "127.0.0.1:3000"
        */
        modepressRenderURL: string;
    
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
        private _unique: boolean;
        private _indexable: boolean;

        constructor(name: string, value: T, sensitive: boolean);

        /**
        * Creates a clone of this item
        * @returns {SchemaItem} copy A sub class of the copy
        * @returns {SchemaItem}
        */
        public clone(copy?: SchemaItem<T>): SchemaItem<T>;

        /**
        * Gets or sets if this item is indexable by mongodb
        * @returns {boolean}
        */
        public indexable(val?: boolean): boolean;

        /**
        * Gets or sets if this item represents a unique value in the database. An example might be a username
        * @returns {boolean}
        */
        public unique(val?: boolean): boolean;

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
        * @returns {any}
        */
        public generateCleanData(sanitize: boolean): any;

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
    class ModelInstance
    {
        public model: Model;
        public schema: Schema;
        public _id: any;
	
        /**
        * Creates a model instance
        */
        constructor(model: Model);
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
        * Updates the models collection based on the search criteria.
        * @param {any} selector The selector for defining which entries to update
        * @param {any} document The object that defines what has to be updated
        * @returns {Promise<number>} A promise with the number of entities affected
        */
        update(selector: any, document: any): Promise<number>;
	
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
        findInstances(selector: any, sort?: any, startIndex?: number, limit?: number, projection?: any): Promise<Array<ModelInstance>>;
	
        /**
        * Deletes a number of instances based on the selector. The promise reports how many items were deleted
        * @returns {Promise<number>}
        */
        deleteInstances(selector: any): Promise<number>;

        /**
        * Updates an instance by its ID
        * @param {string} id The id of the instance we are updating
        * @param {any} data The data object that will attempt to set the instance's schema variables
        * by parsing the object and setting each schema item's value by the name/value in the data object. 
        * @returns {Promise<ModelInstance>}
        */
        updateInstance(id: string, data: any): Promise<ModelInstance>;

        /**
        * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
        * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
        * by parsing the data object and setting each schema item's value by the name/value in the data object. 
        * @returns {Promise<boolean>}
        */
        checkUniqueness(instance: ModelInstance): Promise<boolean>;

        /**
        * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
        * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
        * by parsing the data object and setting each schema item's value by the name/value in the data object. 
        * @returns {Promise<ModelInstance>}
        */
        createInstance(data?: any): Promise<ModelInstance>;

        /**
        * Attempts to insert an array of instances of this model into the database. 
        * @param {Promise<Array<ModelInstance>>} instances An array of instances to save
        * @returns {Promise<Array<ModelInstance>>}
        */
        insert(instances: Array<ModelInstance>): Promise<Array<ModelInstance>>;

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
        getSanitizedData<T>(instances: Array<ModelInstance>, verbose?: boolean): Array<T>;
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
        hasPermission(user: UsersInterface.IUserEntry, level: UsersInterface.UserPrivileges, existingUser?: string): boolean;

        /**
	    * Attempts to log a user in
        * @param {string} user The email or username
        * @param {string} password The users password
        * @param {boolean} remember
	    * @returns {Promise<UsersInterface.IAuthenticationResponse>}
	    */
        login(user: string, password: string, remember: boolean): Promise<UsersInterface.IAuthenticationResponse>;

        /**
        * Gets the user singleton
        * @returns {UsersService}
        */
        public static getSingleton(usersURL?: string);
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
    * A text scheme item for use in Models
    */
    class SchemaTextArray extends SchemaItem<Array<string>>
    {
        /**
        * Creates a new schema item that holds an array of text items
        * @param {string} name The name of this item
        * @param {Array<string>} val The text array of this schema item
        * @param {number} minCharacters [Optional] Specify the minimum number of characters for each text item
        * @param {number} maxCharacters [Optional] Specify the maximum number of characters for each text item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: Array<string>, minCharacters?: number, maxCharacters?: number, sensitive?: boolean);
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

    export module SchemaFactory
    {
        export var num: typeof SchemaNumber;
        export var text: typeof SchemaText;
        export var textArray: typeof SchemaTextArray;
        export var date: typeof SchemaDate;
        export var bool: typeof SchemaBool;
        export var id: typeof SchemaId;
    }
}

declare module "modepress-api"
{
    export = Modepress;
}