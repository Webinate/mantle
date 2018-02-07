import { ISchemaOptions } from '../types/misc/i-schema-options';
import { IModelEntry } from '../types/models/i-model-entry';
import { Collection, Db, ObjectID } from 'mongodb';
import { Schema } from './schema';
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
export declare abstract class Model<T extends IModelEntry> {
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
     * @param selector The selector object for selecting files
     * @param options [Optional] If options provided, the resource itself is returned instead of its schema
     */
    findOne(selector: any): Promise<Schema<T> | null>;
    findOne(selector: any, options: ISchemaOptions): Promise<T | null>;
    /**
     * Deletes a instance and all its dependencies are updated or deleted accordingly
     */
    private deleteInstance(schema);
    /**
       * Deletes a number of instances based on the selector. The promise reports how many items were deleted
       */
    deleteInstances(selector: any): Promise<number>;
    /**
     * Updates an instance with new data. The update process will validate the new data and check that
     * unique fields are still being respected.
     * @param selector The selector to determine which model to update
     * @param data The data to update the model with
     */
    update(selector: any, data: Partial<T>, options?: ISchemaOptions): Promise<T>;
    /**
     * Checks if the schema item being ammended is unique
     */
    checkUniqueness(schema: Schema<IModelEntry>, id?: ObjectID): Promise<boolean>;
    /**
       * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
       * @param data [Optional] You can pass a data object that will attempt to set the instance's schema variables
       * by parsing the data object and setting each schema item's value by the name/value in the data object
       */
    createInstance(data?: T): Promise<Schema<T>>;
    /**
       * Attempts to insert an array of instances of this model into the database.
       * @param instances An array of instances to save
       */
    insert(instances: Schema<IModelEntry>[]): Promise<Schema<IModelEntry>[]>;
}
