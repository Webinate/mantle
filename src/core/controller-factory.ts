import { IConfig } from 'modepress';
import { Db } from 'mongodb';
import Controller from '../controllers/controller';
import { BucketsController } from '../controllers/buckets';
import { PostsController } from '../controllers/posts';
import { SessionsController } from '../controllers/sessions';
import { UsersController } from '../controllers/users';
import { CommentsController } from '../controllers/comments';

/**
 * Factory classs for creating & getting controllers
 */
export class ControllerFactory {
  private _config: IConfig;
  private _db: Db;
  private _controllers: { [ name: string ]: Controller };

  initialize( config: IConfig, database: Db ) {
    this._config = config;
    this._db = database;
    this._controllers = {};
  }

  /**
   * Adds the default models to the system
   */
  async addDefaults() {
    await this.create( 'sessions' );
    await this.create( 'buckets' );
    await this.create( 'posts' );
    await this.create( 'comments' );
    await this.create( 'users' );
  }

  get( type: 'buckets' ): BucketsController
  get( type: 'posts' ): PostsController
  get( type: 'comments' ): CommentsController
  get( type: 'sessions' ): SessionsController
  get( type: 'users' ): UsersController
  get( type: string ): Controller
  get( type: string ): Controller {
    const toRet = this._controllers[ type ];
    if ( !toRet )
      throw new Error( `Cannot find controller '${type}'` );

    return toRet;
  }

  /**
   * A factory method for creating models
   * @param type The type of model to create
   */
  private async create( type: string ): Promise<Controller> {
    let newModel: Controller;

    if ( this._controllers[ type ] )
      return this._controllers[ type ];

    switch ( type ) {
      case 'buckets':
        newModel = new BucketsController( this._config );
        break;
      case 'posts':
        newModel = new PostsController( this._config );
        break;
      case 'comments':
        newModel = new CommentsController( this._config );
        break;
      case 'sessions':
        newModel = new SessionsController( this._config );
        break;
      case 'users':
        newModel = new UsersController( this._config );
        break;
      default:
        throw new Error( `Controller '${type}' cannot be created` );
    }

    await newModel.initialize( this._db );
    this._controllers[ type ] = newModel;

    return newModel;
  }
}


export default new ControllerFactory();