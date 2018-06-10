import { IConfig } from '../types/config/i-config';
import * as mongodb from 'mongodb';
import Controller from './controller';
import { Collection, ObjectID } from 'mongodb';
import { IForiegnKey } from '../types/models/i-foreign-key';

/**
 * A controller that deals with the management of categories
 */
export class ForeignKeysController extends Controller {
  private collection: Collection<IForiegnKey>;
  private db: mongodb.Db;

  /**
	 * Creates a new instance of the controller
	 */
  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( db: mongodb.Db ) {
    this.db = db;
    this.collection = await db.collection( this._config.collections.foreignKeys );
    this.collection;
    return this;
  }

  async nullifyTargets( target: ObjectID ) {
    const cursor = await this.collection.find( { target: target } as IForiegnKey );
    const results: IForiegnKey[] = await cursor.toArray();
    const db = this.db;
    const promises: Promise<any>[] = [];

    for ( const result of results ) {
      const setter = { $set: {} as any };
      setter.$set[ result.targetProperty ] = null;
      promises.push( db.collection( result.targetCollection ).updateOne( { _id: result.source }, setter ) );
      promises.push( this.collection.deleteOne( { _id: result.source } as IForiegnKey ) )
    }

    await Promise.all( promises );
  }

  async createNullTarget( source: ObjectID, target: ObjectID, targetProperty: string, targetCollection: string ) {
    const toAdd: Partial<IForiegnKey> = {
      source: source,
      targetCollection: targetCollection,
      target: target,
      targetProperty: targetProperty
    };

    await this.collection.insertOne( toAdd );
  }
}