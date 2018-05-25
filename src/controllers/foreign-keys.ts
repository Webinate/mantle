import { IConfig } from '../types/config/i-config';
import * as mongodb from 'mongodb';
import Controller from './controller';
import { Collection } from 'mongodb';
import { IForiegnKey } from '../types/models/i-foreign-key';

/**
 * A controller that deals with the management of categories
 */
export class ForeignKeysController extends Controller {
  private collection: Collection<IForiegnKey>;

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
    this.collection = await db.collection( this._config.collections.foreignKeys );
    this.collection;
    return this;
  }


}