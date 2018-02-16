import { IAuthReq } from '../types/tokens/i-auth-request';
import { ICategory } from '../types/models/i-category';
import { CategoriesTokens } from '../types/tokens/standard-tokens';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Serializer } from './serializer';
import { adminRights, hasId } from '../utils/permission-controllers';
import { j200 } from '../utils/response-decorators';
import { IBaseControler } from '../types/misc/i-base-controller';
import Factory from '../core/model-factory';
import { Model } from '../models/model';

/**
 * A controller that deals with the management of categories
 */
export class CategoriesSerializer extends Serializer {

  private _options: IBaseControler;

  /**
	 * Creates a new instance of the controller
	 */
  constructor( options: IBaseControler ) {
    super( [ Factory.get( 'posts' ), Factory.get( 'categories' ) ] );
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ) {

    const router = express.Router();

    router.use( compression() );
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    router.get( '/', this.getCategories.bind( this ) );
    router.post( '/', <any>[ adminRights, this.createCategory.bind( this ) ] );
    router.delete( '/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.removeCategory.bind( this ) ] );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/categories', router );

    await super.initialize( e, db );
    return this;
  }

  /**
   * Returns an array of ICategory items
   */
  @j200()
  private async getCategories( req: IAuthReq, res: express.Response ) {
    const categories = this.getModel( 'categories' )! as Model<ICategory>;
    const index = parseInt( req.query.index );
    const limit = parseInt( req.query.limit );

    const schemas = await categories.findInstances( { index: index, limit: limit } );

    const jsons: Array<Promise<ICategory>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( { verbose: Boolean( req.query.verbose ) } ) );

    const sanitizedData = await Promise.all( jsons );

    const response: CategoriesTokens.GetAll.Response = {
      count: sanitizedData.length,
      data: sanitizedData,
      index: index,
      limit: limit
    };
    return response;
  }

  /**
   * Attempts to remove a category by ID
   */
  @j200( 204 )
  private async removeCategory( req: IAuthReq, res: express.Response ) {
    const categories = this.getModel( 'categories' )!;

    const numRemoved = await categories.deleteInstances( <ICategory>{ _id: new mongodb.ObjectID( req.params.id ) } );

    if ( numRemoved === 0 )
      return Promise.reject( new Error( 'Could not find a category with that ID' ) );

    return;
  }

  /**
   * Attempts to create a new category item
   */
  @j200()
  private async createCategory( req: IAuthReq, res: express.Response ) {
    const token: CategoriesTokens.Post.Body = req.body;
    const categories = this.getModel( 'categories' )!;

    const schema = await categories.createInstance( token );
    const json = await schema.getAsJson( { verbose: true } );

    const response: CategoriesTokens.Post.Response = json;
    return response;
  }
}