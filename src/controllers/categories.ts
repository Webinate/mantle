import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import Controller from './controller';
import { isValidObjectID } from '../utils/utils';
import { Schema } from '../models/schema';
import { CategoriesModel } from '../models/categories-model';
import { ICategory } from '../types/models/i-category';
import { ISchemaOptions } from '../types/misc/i-schema-options';

export type GetManyOptions = {
  index: number;
  limit: number;
  root: boolean;
  expanded: boolean,
  depth: number
}

export type GetOneOptions = {
  expanded: boolean,
  depth: number
}

/**
 * A controller that deals with the management of categories
 */
export class CategoriesController extends Controller {
  private _categoriesModel: CategoriesModel;

  /**
	 * Creates a new instance of the controller
	 */
  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( db: mongodb.Db ) {
    this._categoriesModel = Factory.get( 'categories' );
    return this;
  }

  /**
   * Returns an array of category entries
   */
  async getAll( options: Partial<GetManyOptions> = {} ) {
    const categories = this._categoriesModel;
    const index: number = options.index || 0;
    const limit: number = options.limit || -1;
    const expanded = options.expanded || true;
    const depth = options.depth || 1;
    const root = options.root || false;

    const schemas = await categories.findInstances( {
      index: index,
      limit: limit,
      selector: root ? { parent: null } as ICategory : undefined
    } );

    const jsons: Array<Promise<ICategory>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( {
        verbose: true,
        expandMaxDepth: depth,
        expandForeignKeys: expanded,
        expandSchemaBlacklist: [ 'parent' ]
      } ) );

    const sanitizedData = await Promise.all( jsons );
    const count = await categories.count( {} );

    const response: Page<ICategory> = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit
    };
    return response;
  }

  getDefaultsOptions( options: Partial<GetOneOptions> ): ISchemaOptions {
    return {
      verbose: true,
      expandForeignKeys: options.expanded || false,
      expandMaxDepth: options.depth || 1,
      expandSchemaBlacklist: [ 'parent' ]
    }
  }

  /**
   * Gets a single category resource
   * @param id The id of the category to fetch
   * @param options Options for getting the resource
   */
  async getOne( id: string, options: Partial<GetOneOptions> = {} ) {
    if ( !isValidObjectID( id ) )
      throw new Error( `Please use a valid object id` );

    const findToken: ICategory = { _id: new mongodb.ObjectID( id ) };
    const category = await this._categoriesModel.findOne( findToken, this.getDefaultsOptions( options ) );

    if ( !category )
      throw new Error( 'Could not find category' );

    return category;
  }

  /**
  * Gets a single category resource by its slug
  * @param slug The slug of the category to fetch
  * @param options Options for getting the resource
  */
  async getBySlug( slug: string, options: Partial<GetOneOptions> = {} ) {
    const findToken: Partial<ICategory> = { slug: slug };
    const category = await this._categoriesModel.findOne( findToken, this.getDefaultsOptions( options ) );

    if ( !category )
      throw new Error( 'Could not find category' );

    return category;
  }

  /**
   * Removes a category by its id
   * @param id The id of the category
   */
  async remove( id: string ) {
    if ( !isValidObjectID( id ) )
      throw new Error( `Please use a valid object id` );

    const categorys = this._categoriesModel;
    const findToken: ICategory = { _id: new mongodb.ObjectID( id ) };

    const category = await categorys.findOne( findToken, { verbose: true } );

    if ( !category )
      throw new Error( 'Could not find a comment with that ID' );

    // Attempt to delete the instances
    await categorys.deleteInstances( findToken );
  }

  /**
   * Updates a category by id
   * @param id The id of the category
   * @param token The update token of the category
   */
  async update( id: string, token: ICategory ) {
    const categorys = this._categoriesModel;
    const findToken: ICategory = { _id: new mongodb.ObjectID( id ) };
    const updatedCategory = await categorys.update( findToken, token );
    return updatedCategory;
  }

  /**
   * Creates a new category
   * @param token The data of the category to create
   */
  async create( token: ICategory ) {
    const categorys = this._categoriesModel;
    let parent: Schema<ICategory> | null = null;

    if ( token.parent ) {
      parent = await categorys.findOne( <ICategory>{ _id: new mongodb.ObjectID( token.parent ) } );

      if ( !parent )
        throw new Error( `No category exists with the id ${token.parent}` );
    }

    const instance = await categorys.createInstance( token );
    const json = await instance.getAsJson( { verbose: true } );

    // Assign this comment as a child to its parent comment if it exists
    if ( parent ) {
      const children: Array<string | mongodb.ObjectID> = parent.getByName( 'children' )!.value;
      children.push( instance.dbEntry._id );
      await categorys.update( <ICategory>{ _id: parent.dbEntry._id }, <ICategory>{ children: children } )
    }

    return json;
  }
}