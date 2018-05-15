import { IConfig } from '../types/config/i-config';
import { IModelEntry } from '../types/models/i-model-entry';
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
export class ModelFactory {
  private _db: Db;
  private _models: { [ name: string ]: Model<IModelEntry<'client' | 'server'>> };

  initialize( config: IConfig, database: Db ) {
    this._db = database;
    this._models = {};
  }

  /**
   * Adds the default models to the system
   */
  async addBaseModelFactories() {
    await Promise.all( [
      this.create( 'buckets' ),
      this.create( 'categories' ),
      this.create( 'comments' ),
      this.create( 'files' ),
      this.create( 'posts' ),
      this.create( 'renders' ),
      this.create( 'sessions' ),
      this.create( 'storage' ),
      this.create( 'users' )
    ] );
  }

  /**
   * Sets up a model's indices
   * @param model The model to setup
   */
  async setupIndices( model: Model<IModelEntry<'client' | 'server'>> ) {

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
        const index: any = {};
        index[ item.name ] = 1;
        promises.push( collection.createIndex( index ) );
      }

    await Promise.all( promises );
    return collection;
  }

  get( type: 'buckets' ): BucketModel
  get( type: 'categories' ): CategoriesModel
  get( type: 'comments' ): CommentsModel
  get( type: 'files' ): FileModel
  get( type: 'posts' ): PostsModel
  get( type: 'renders' ): RendersModel
  get( type: 'sessions' ): SessionModel
  get( type: 'storage' ): StorageStatsModel
  get( type: 'users' ): UsersModel
  get( type: string ): Model<IModelEntry<'client' | 'server'>>
  get( type: string ): Model<IModelEntry<'client' | 'server'>> {
    const toRet = this._models[ type ];
    if ( !toRet )
      throw new Error( `Cannot find model '${type}'` );

    return toRet;
  }

  /**
   * A factory method for creating models
   * @param type The type of model to create
   */
  private async create( type: string ): Promise<Model<IModelEntry<'client' | 'server'>>> {
    let newModel: Model<IModelEntry<'client' | 'server'>>;

    if ( this._models[ type ] )
      return this._models[ type ];

    switch ( type ) {
      case 'buckets':
        newModel = new BucketModel();
        break;
      case 'categories':
        newModel = new CategoriesModel();
        break;
      case 'comments':
        newModel = new CommentsModel();
        break;
      case 'files':
        newModel = new FileModel();
        break;
      case 'posts':
        newModel = new PostsModel();
        break;
      case 'renders':
        newModel = new RendersModel();
        break;
      case 'sessions':
        newModel = new SessionModel();
        break;
      case 'storage':
        newModel = new StorageStatsModel();
        break;
      case 'users':
        newModel = new UsersModel();
        break;
      default:
        throw new Error( `Controller '${type}' cannot be created` );
    }

    const collection = await this.setupIndices( newModel );
    await newModel.initialize( collection, this._db );
    this._models[ type ] = newModel;

    return newModel;
  }
}


export default new ModelFactory();