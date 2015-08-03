import * as mongodb from "mongodb";

/**
* The base controller for all controllers
*/
export class Controller
{
    constructor(models: Array<Model>);

    /**
	* Called to initialize this controller and its related database objects
	* @param {mongodb.Db} db The mongo database to use
	* @returns {Promise<Controller>}
	*/
    initialize(db: mongodb.Db): Promise<Controller>;

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
* A definition of each item in the model
*/
export class SchemaItem<T>
{
    name: string;
    value: T;
    sensitive: boolean;

    constructor(name: string, value: T, sensitive: boolean);

	/**
	* Creates a clone of this item
	* @returns {SchemaItem} copy A sub class of the copy
	* @returns {SchemaItem}
	*/
    clone(copy?: SchemaItem<T>): SchemaItem<T>;

    /**
    * Gets or sets if this item is indexable by mongodb
    * @returns {boolean}
    */
    indexable(val?: boolean): boolean;

    /**
	* Gets or sets if this item represents a unique value in the database. An example might be a username
	* @returns {boolean}
	*/
    unique(val?: boolean): boolean;

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
	*/
    validate(): boolean | string;

    /**
	* Gets the value of this item
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
    * @returns {SchemaValue}
	*/
    getValue(sanitize: boolean): T;
}

/**
* Gives an overall description of each property in a model
*/
export class Schema
{
    items: Array<SchemaItem<any>>;
    error: string;

    constructor();
	
	/**
	* Creates a copy of the schema
	* @returns {Schema}
	*/
    clone(): Schema;

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
    deserialize(data: any): any;

	/**
	* Serializes the schema items into the JSON format for mongodb
	* @returns {any}
	*/
    serialize(): any;

    /**
	* Serializes the schema items into the JSON format for mongodb
    * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
	* @returns {any}
	*/
    generateCleanData(sanitize: boolean): any;

	/**
	* Checks the value stored to see if its correct in its current form
	* @returns {boolean} Returns true if successful
	*/
    validate(): boolean;

	/**
	* Gets a schema item from this schema by name
	* @param {string} val The name of the item
	* @param {SchemaItem}
	*/
    getByName(val: string): SchemaItem<any>;

	/**
	* Adds a schema item to this schema
	* @param {SchemaItem} val The new item to add
    * @returns {SchemaItem}
	*/
    add(val: SchemaItem<any>): SchemaItem<any>;
    
	/**
	* Removes a schema item from this schema
	* @param {SchemaItem|string} val The name of the item or the item itself
	*/
    remove(val: SchemaItem<any>|string);
}

/**
* A bool scheme item for use in Models
*/
export class SchemaBool extends SchemaItem<boolean>
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
export class SchemaDate extends SchemaItem<number>
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
* Describes the type of number to store
*/
export enum NumberType
{
    Integer,
    Float
}

/**
* A numeric schema item for use in Models
*/
export class SchemaNumber extends SchemaItem<number>
{
    public min: number;
    public max: number;
    public type: NumberType;
    public decimalPlaces: number;

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
    constructor(name: string, val: number, min?: number, max?: number, type?: NumberType, decimalPlaces?: number, sensitive?: boolean);
}

/**
* A text scheme item for use in Models
*/
export class SchemaText extends SchemaItem<string>
{
    public minCharacters: number;
    public maxCharacters: number;

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
export class SchemaTextArray extends SchemaItem<Array<string>>
{
    public minCharacters: number;
    public maxCharacters: number;

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

export class SchemaFactory
{
    num: typeof SchemaNumber;
    text: typeof SchemaText;
    textArray: typeof SchemaTextArray;
    date: typeof SchemaDate;
    bool: typeof SchemaBool;
}

/**
* An instance of a model with its own unique schema and ID. The initial schema is a clone
* the parent model's
*/
export interface ModelInstance
{
    model: Model;
    schema: Schema;
    _id: mongodb.ObjectID;
	
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
    collection: mongodb.Collection;
    defaultSchema: Schema;
	
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
    initialize(db: mongodb.Db): Promise<Model>;
    
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