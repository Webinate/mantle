import { IConfig } from '../types/config/i-config';
import { IModelEntry } from '../types/models/i-model-entry';
import { Db, Collection } from 'mongodb';
import { Model } from '../models/model';
import { VolumeModel } from '../models/volume-model';
import { CategoriesModel } from '../models/categories-model';
import { CommentsModel } from '../models/comments-model';
import { FileModel } from '../models/file-model';
import { PostsModel } from '../models/posts-model';
import { RendersModel } from '../models/renders-model';
import { SessionModel } from '../models/session-model';
import { UsersModel } from '../models/users-model';
import { DocumentsModel } from '../models/documents-model';
import { DraftsModel } from '../models/drafts-model';
import { TemplatesModel } from '../models/templates-model';
import { DraftElements } from '../types/models/i-draft-elements';
import { ElmParagraph } from '../models/draft-elements/elm-paragraph';
import { ElmHeader } from '../models/draft-elements/elm-header';
import { ElmImg } from '../models/draft-elements/elm-img';
import { ElmList } from '../models/draft-elements/elm-list';
import { ElmCode } from '../models/draft-elements/elm-code';

export type CommonModelType = 'volumes' | 'categories' |
  'comments' | 'files' | 'posts' | 'renders' | 'sessions' |
  'users' | 'documents' | 'drafts' | 'templates' |
  DraftElements;

/**
 * Factory classs for creating & getting models
 */
export class ModelFactory {
  private _db: Db;
  private _models: { [ name: string ]: Model<IModelEntry<'server'>, IModelEntry<'client'>> };

  initialize( config: IConfig, database: Db ) {
    this._db = database;
    this._models = {};
  }

  /**
   * Adds the default models to the system
   */
  async addBaseModelFactories() {
    await Promise.all( [
      this.create( 'volumes' ),
      this.create( 'categories' ),
      this.create( 'comments' ),
      this.create( 'files' ),
      this.create( 'posts' ),
      this.create( 'renders' ),
      this.create( 'sessions' ),
      this.create( 'users' ),
      this.create( 'documents' ),
      this.create( 'drafts' ),
      this.create( 'templates' ),
      this.create( 'elm-paragraph' ),
      this.create( 'elm-header-1' ),
      this.create( 'elm-header-2' ),
      this.create( 'elm-header-3' ),
      this.create( 'elm-header-4' ),
      this.create( 'elm-header-5' ),
      this.create( 'elm-header-6' ),
      this.create( 'elm-list' ),
      this.create( 'elm-image' ),
      this.create( 'elm-code' )
    ] );
  }

  /**
   * Sets up a model's indices
   * @param model The model to setup
   */
  async setupIndices( model: Model<IModelEntry<'server'>, IModelEntry<'client'>> ) {

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

  get( type: 'volumes' ): VolumeModel
  get( type: 'categories' ): CategoriesModel
  get( type: 'comments' ): CommentsModel
  get( type: 'files' ): FileModel
  get( type: 'posts' ): PostsModel
  get( type: 'renders' ): RendersModel
  get( type: 'sessions' ): SessionModel
  get( type: 'users' ): UsersModel
  get( type: 'templates' ): TemplatesModel
  get( type: 'drafts' ): DraftsModel
  get( type: 'documents' ): DocumentsModel
  get( type: 'elm-paragraph' ): ElmParagraph
  get( type: 'elm-header-1' ): ElmHeader
  get( type: 'elm-header-2' ): ElmHeader
  get( type: 'elm-header-3' ): ElmHeader
  get( type: 'elm-header-4' ): ElmHeader
  get( type: 'elm-header-5' ): ElmHeader
  get( type: 'elm-header-6' ): ElmHeader
  get( type: 'elm-list' ): ElmList
  get( type: 'elm-image' ): ElmImg
  get( type: 'elm-code' ): ElmCode
  get( type: string ): Model<IModelEntry<'server'>, IModelEntry<'client'>>
  get( type: string ): Model<IModelEntry<'server'>, IModelEntry<'client'>> {
    const toRet = this._models[ type ];
    if ( !toRet )
      throw new Error( `Cannot find model '${type}'` );

    return toRet;
  }

  /**
   * A factory method for creating models
   * @param type The type of model to create
   */
  private async create( type: CommonModelType ): Promise<Model<IModelEntry<'server'>, IModelEntry<'client'>>> {
    let newModel: Model<IModelEntry<'server'>, IModelEntry<'client'>>;

    if ( this._models[ type ] )
      return this._models[ type ];

    switch ( type ) {
      case 'volumes':
        newModel = new VolumeModel();
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
      case 'users':
        newModel = new UsersModel();
        break;
      case 'drafts':
        newModel = new DraftsModel();
        break;
      case 'documents':
        newModel = new DocumentsModel();
        break;
      case 'templates':
        newModel = new TemplatesModel();
        break;
      case 'elm-paragraph':
        newModel = new ElmParagraph();
        break;
      case 'elm-header-1':
        newModel = new ElmHeader( 'elm-header-1' );
        break;
      case 'elm-header-2':
        newModel = new ElmHeader( 'elm-header-2' );
        break;
      case 'elm-header-3':
        newModel = new ElmHeader( 'elm-header-3' );
        break;
      case 'elm-header-4':
        newModel = new ElmHeader( 'elm-header-4' );
        break;
      case 'elm-header-5':
        newModel = new ElmHeader( 'elm-header-5' );
        break;
      case 'elm-header-6':
        newModel = new ElmHeader( 'elm-header-6' );
        break;
      case 'elm-image':
        newModel = new ElmImg();
        break;
      case 'elm-list':
        newModel = new ElmList();
        break;
      case 'elm-code':
        newModel = new ElmCode();
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