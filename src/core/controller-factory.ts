import { IConfig } from 'modepress';
import { Db, Collection } from 'mongodb';
import { Model } from '../models/model';
import { BucketModel } from '../models/bucket-model';

class ControllerFactory {
  private _config: IConfig;
  private _db: Db;
  private _collections: { [ name: string ]: Collection };

  initialize( config: IConfig, database: Db ) {
    this._config = config;
    this._db = database;
    this._collections = {};
  }

  async setupIndices( model: Model ) {

    // The collection does not exist - so create it
    let collection: Collection;
    if ( this._collections[ model.collectionName ] )
      collection = this._collections[ model.collectionName ];
    else {
      collection = await this._db.createCollection( model.collectionName );
      this._collections[ model.collectionName ] = collection;
    }

    // Now re-create the models who need index supports
    const promises: Array<Promise<string>> = [];
    const items = model.defaultSchema.getItems();
    const indices = await collection.listIndexes();
    const indexArr: { key: { [ name: string ]: number } }[] = await indices.toArray();

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
        promises.push( collection.dropIndex( key + '_1' ) );
    }


    // Now add the indices we do need
    for ( const item of items )
      if ( item.getIndexable() && !indexArr.find( i => i.key.hasOwnProperty( item.name ) ) ) {
        promises.push( collection.createIndex( item.name ) );
      }


    await Promise.all( promises );
  }

  async create( type: 'bucket' ): Promise<BucketModel>;
  async create( type: string ): Promise<Model> {
    let newController: Model;

    switch ( type ) {
      case 'bucket':
        newController = new BucketModel();
        break;
      default:
        throw new Error( `Controller '${type}' cannot be created` );
    }

    await this.setupIndices( newController );
    await newController.initialize( this._db );

    return newController;
  }
}

const factory = new ControllerFactory();
export default factory;