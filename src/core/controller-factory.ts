import { IConfig } from 'modepress';
import { Db, Collection } from 'mongodb';
import { Model } from '../models/model';
import { BucketModel } from '../models/bucket-model';
import { CategoriesModel } from '../models/categories-model';
import { CommentsModel } from '../models/comments-model';
import { FileModel } from '../models/file-model';
import { PostsModel } from '../models/posts-model';
import { RendersModel } from '../models/renders-model';
import { SessionModel } from '../models/session-model';
import { StorageStatsModel } from '../models/storage-stats-model';
import { UsersModel } from '../models/users-model';

type Index = {
  name: string;
  key: { [ name: string ]: number }
};

export class ControllerFactory {
  private _config: IConfig;
  private _db: Db;
  private _controllers: { [ name: string ]: Model };

  initialize( config: IConfig, database: Db ) {
    this._config = config;
    this._db = database;
    this._controllers = {};
  }

  /**
   * Adds the default controllers to the system
   */
  async addBaseControllers() {
    await Promise.all( [
      this.create( 'bucket' ),
      this.create( 'categories' ),
      this.create( 'comments' ),
      this.create( 'file' ),
      this.create( 'posts' ),
      this.create( 'renders' ),
      this.create( 'session' ),
      this.create( 'storage' ),
      this.create( 'users' )
    ] );
  }

  /**
   * Sets up a model's indices
   * @param model The model to setup
   */
  async setupIndices( model: Model ) {

    // The collection does not exist - so create it
    let collection: Collection = await this._db.createCollection( model.collectionName );

    // Now re-create the models who need index supports
    let promises: Array<Promise<string>> = [];
    const items = model.defaultSchema.getItems();
    const indices = await collection.listIndexes();
    const indexArr: Index[] = await indices.toArray();

    // Remove any unused indexes
    for ( const indexObj of indexArr ) {
      const keys = Object.keys( indexObj.key );
      const key = keys[ 0 ];

      let indexNeeded = false;
      for ( const item of items ) {
        if ( item.getIndexable() && item.name === key ) {
          indexNeeded = true;
          break;
        }
      }

      if ( !indexNeeded && key !== '_id' )
        promises.push( collection.dropIndex( indexObj.name ) );
    }

    try {
      await Promise.all( promises );
    } catch ( err ) {
      await collection.dropIndexes();
    }

    promises = promises.slice( 0 );

    // Now add the indices we do need
    for ( const item of items )
      if ( item.getIndexable() && !indexArr.find( i => i.key.hasOwnProperty( item.name ) ) ) {
        promises.push( collection.createIndex( item.name ) );
      }

    await Promise.all( promises );
    return collection;
  }

  get( type: 'bucket' ): BucketModel
  get( type: 'categories' ): CategoriesModel
  get( type: 'comments' ): CommentsModel
  get( type: 'file' ): FileModel
  get( type: 'posts' ): PostsModel
  get( type: 'renders' ): RendersModel
  get( type: 'session' ): SessionModel
  get( type: 'storage' ): StorageStatsModel
  get( type: 'users' ): UsersModel
  get( type: string ): Model
  get( type: string ): Model {
    const toRet = this._controllers[ type ];
    if ( !toRet )
      throw new Error( `Cannot find controller '${type}'` );

    return toRet;
  }

  /**
   * A factory method for creating controllers
   * @param type The type of controller to create
   */
  private async create( type: string ): Promise<Model> {
    let newController: Model;

    if ( this._controllers[ type ] )
      return this._controllers[ type ];

    switch ( type ) {
      case 'bucket':
        newController = new BucketModel();
        break;
      case 'categories':
        newController = new CategoriesModel();
        break;
      case 'comments':
        newController = new CommentsModel();
        break;
      case 'file':
        newController = new FileModel();
        break;
      case 'posts':
        newController = new PostsModel();
        break;
      case 'renders':
        newController = new RendersModel();
        break;
      case 'session':
        newController = new SessionModel();
        break;
      case 'storage':
        newController = new StorageStatsModel();
        break;
      case 'users':
        newController = new UsersModel();
        break;
      default:
        throw new Error( `Controller '${type}' cannot be created` );
    }

    const collection = await this.setupIndices( newController );
    await newController.initialize( collection, this._db );
    this._controllers[ type ] = newController;

    return newController;
  }
}

const factory = new ControllerFactory();
export default factory;