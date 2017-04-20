declare namespace Modepress {

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