import { IConfig } from '../types/config/i-config';
import { Db } from 'mongodb';
import Controller from '../controllers/controller';
import { VolumesController } from '../controllers/volumes';
import { FilesController } from '../controllers/files';
import { PostsController } from '../controllers/posts';
import { SessionsController } from '../controllers/sessions';
import { UsersController } from '../controllers/users';
import { CommentsController } from '../controllers/comments';
import { CategoriesController } from '../controllers/categories';
import { TemplatesController } from '../controllers/templates';
import { DocumentsController } from '../controllers/documents';

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
    const controllers: Controller[] = [];
    controllers.push( await this.create( 'sessions' ) );
    controllers.push( await this.create( 'categories' ) );
    controllers.push( await this.create( 'volumes' ) );
    controllers.push( await this.create( 'files' ) );
    controllers.push( await this.create( 'posts' ) );
    controllers.push( await this.create( 'comments' ) );
    controllers.push( await this.create( 'users' ) );
    controllers.push( await this.create( 'templates' ) );
    controllers.push( await this.create( 'documents' ) );

    for ( const controller of controllers )
      await controller.initialize( this._db );
  }

  get( type: 'volumes' ): VolumesController
  get( type: 'posts' ): PostsController
  get( type: 'comments' ): CommentsController
  get( type: 'sessions' ): SessionsController
  get( type: 'users' ): UsersController
  get( type: 'files' ): FilesController
  get( type: 'categories' ): CategoriesController
  get( type: 'templates' ): TemplatesController
  get( type: 'documents' ): DocumentsController
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
      case 'volumes':
        newModel = new VolumesController( this._config );
        break;
      case 'files':
        newModel = new FilesController( this._config );
        break;
      case 'categories':
        newModel = new CategoriesController( this._config );
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
      case 'templates':
        newModel = new TemplatesController( this._config );
        break;
      case 'documents':
        newModel = new DocumentsController( this._config );
        break;
      default:
        throw new Error( `Controller '${type}' cannot be created` );
    }

    this._controllers[ type ] = newModel;
    return newModel;
  }
}


export default new ControllerFactory();