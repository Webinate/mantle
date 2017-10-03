import { IConfig, IModelEntry } from 'modepress';
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

/**
 * Factory classs for creating & getting models
 */
export class ControllerFactory {
  private _config: IConfig;
  private _db: Db;
  private _controllers: { [ name: string ]: Model<IModelEntry> };

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
  async setupIndices( model: Model<IModelEntry> ) {

    // The collection does not exist - so create it
    let collection: Collection = await this._db.createCollection( model.collectionName );

    const indexInfo = await collection.indexInformation( { full: true } );
    indexInfo;

    // Now re-create the models who need index supports
    let promises: Array<Promise<string>> = [];
    const items = model.schema.getItems();
    const indices = await collection.indexInformation();
    const activeIndices = Object.keys( indices );

    // Remove any unused indexes
    for ( const key of activeIndices ) {
      let indexNeeded = false;
      for ( const item of items ) {
        if ( item.getIndexable() && item.name === indices[ key ][ 0 ][ 0 ] ) {
          indexNeeded = true;
          break;
        }
      }

      if ( !indexNeeded && key !== '_id_' )
        promises.push( collection.dropIndex( key ) );
    }

    await Promise.all( promises );

    promises = [];

    // Now add the indices we do need
    for ( const item of items )
      if ( item.getIndexable() && !activeIndices.find( key => indices[ key ][ 0 ][ 0 ] === item.name ) ) {
        const index = {};
        index[ item.name ] = 1;
        promises.push( collection.createIndex( index ) );
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
  get( type: string ): Model<IModelEntry>
  get( type: string ): Model<IModelEntry> {
    const toRet = this._controllers[ type ];
    if ( !toRet )
      throw new Error( `Cannot find controller '${type}'` );

    return toRet;
  }

  /**
   * A factory method for creating controllers
   * @param type The type of controller to create
   */
  private async create( type: string ): Promise<Model<IModelEntry>> {
    let newController: Model<IModelEntry>;

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


export default new ControllerFactory();