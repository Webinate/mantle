import { IAuthReq, ICategory, CategoriesTokens } from 'modepress';

import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Controller } from './controller';
import { adminRights, hasId } from '../utils/permission-controllers';
import { j200 } from '../utils/serializers';
import { IBaseControler } from 'modepress';
import Factory from '../core/controller-factory';

/**
 * A controller that deals with the management of categories
 */
export class CategoriesController extends Controller {

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
    const categories = this.getModel( 'categories' )!;

    const instances = await categories.findInstances<ICategory>( { index: parseInt( req.query.index ), limit: parseInt( req.query.limit ) } );

    const jsons: Array<Promise<ICategory>> = [];
    for ( let i = 0, l = instances.length; i < l; i++ )
      jsons.push( instances[ i ].schema.getAsJson<ICategory>( instances[ i ]._id, { verbose: Boolean( req.query.verbose ) } ) );

    const sanitizedData = await Promise.all( jsons );

    return {
      count: sanitizedData.length,
      message: `Found ${sanitizedData.length} categories`,
      data: sanitizedData
    } as CategoriesTokens.GetAll.Response;
  }

  /**
   * Attempts to remove a category by ID
   */
  @j200()
  private async removeCategory( req: IAuthReq, res: express.Response ) {
    const categories = this.getModel( 'categories' )!;

    const numRemoved = await categories.deleteInstances( <ICategory>{ _id: new mongodb.ObjectID( req.params.id ) } );

    if ( numRemoved === 0 )
      return Promise.reject( new Error( 'Could not find a category with that ID' ) );

    return { message: 'Category has been successfully removed' } as CategoriesTokens.DeleteOne.Response;
  }

  /**
   * Attempts to create a new category item
   */
  @j200()
  private async createCategory( req: IAuthReq, res: express.Response ) {
    const token: CategoriesTokens.Post.Body = req.body;
    const categories = this.getModel( 'categories' )!;

    const instance = await categories.createInstance( token );
    const json = await instance.schema.getAsJson( instance._id, { verbose: true } );

    return {
      message: 'New category created',
      data: json
    } as CategoriesTokens.Post.Response;
  }
}