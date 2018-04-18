import { Db } from 'mongodb';
import { IConfig } from '../types/config/i-config';
import { EventEmitter } from 'events';

/**
 * The root class for all controllers
 */
export default abstract class Controller extends EventEmitter {

  protected _config: IConfig;

  constructor( config: IConfig ) {
    super();
    this._config = config;
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  abstract async initialize( db: Db );
}