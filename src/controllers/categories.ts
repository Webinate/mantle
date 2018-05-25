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
import { ObjectID } from 'mongodb';

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

    const sanitizedData = await categories.downloadMany<ICategory<'client'>>( {
      index: index,
      limit: limit,
      selector: root ? { parent: null } as ICategory<'server'> : undefined
    }, {
        verbose: true,
        expandMaxDepth: depth,
        expandForeignKeys: expanded,
        expandSchemaBlacklist: [ 'parent' ]
      } );


    const count = await categories.count( {} );
    const response: Page<ICategory<'client'>> = {
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

    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectID( id ) };
    const category = await this._categoriesModel.downloadOne<ICategory<'client'>>( findToken, this.getDefaultsOptions( options ) );

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
    const findToken: Partial<ICategory<'server'>> = { slug: slug };
    const category = await this._categoriesModel.downloadOne<ICategory<'client'>>( findToken, this.getDefaultsOptions( options ) );

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
    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectID( id ) };

    const category = await categorys.downloadOne( findToken, { verbose: true } );

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
  async update( id: string, token: Partial<ICategory<'client'>> ) {
    const categorys = this._categoriesModel;
    let parent: Schema<ICategory<'server'>> | null = null;

    // Check if target parent exists
    if ( token.parent ) {
      parent = await categorys.findOne( <ICategory<'server'>>{ _id: new mongodb.ObjectID( token.parent ) } ) as Schema<ICategory<'server'>>;

      if ( !parent )
        throw new Error( `No category exists with the id ${token.parent}` );
    }

    const findToken: Partial<ICategory<'server'>> = { _id: new mongodb.ObjectID( id ) };
    const curCategory = await categorys.downloadOne<ICategory<'client'>>( findToken, { expandForeignKeys: false, verbose: true } );

    // If it has a parent - then remove it from the current parent
    if ( curCategory && curCategory.parent && curCategory.parent.toString() !== token.parent ) {
      const curParent = await categorys.findOne<ICategory<'server'>>( { _id: curCategory.parent } );
      const children = curParent!.dbEntry.children.map( id => id.toString() );
      const tokenId = new mongodb.ObjectID( token._id );
      const index = children.findIndex( it => tokenId.equals( new ObjectID( it ) ) )
      if ( index !== -1 ) {
        children.splice( index, 1 );
        await categorys.update( { _id: curParent!.dbEntry._id } as ICategory<'server'>, { children: children } as ICategory<'client'> );
      }
    }

    const updatedCategory = await categorys.update<ICategory<'client'>>( findToken, token );

    // Assign this comment as a child to its parent comment if it exists
    if ( parent ) {
      const children = parent.getByName( 'children' )!.getDbValue().map( id => id.toString() );
      const newId = updatedCategory._id;
      const index = children.findIndex( it => newId === it );
      if ( index === -1 ) {
        children.push( newId );
        await categorys.update( <ICategory<'server'>>{ _id: parent.dbEntry._id }, <ICategory<'client'>>{ children: children } );
      }
    }

    return updatedCategory;
  }

  /**
   * Creates a new category
   * @param token The data of the category to create
   */
  async create( token: Partial<ICategory<'client'>> ) {
    const categorys = this._categoriesModel;
    let parent: Schema<ICategory<'server'>> | null = null;

    if ( token.parent ) {
      parent = await categorys.findOne( <ICategory<'server'>>{ _id: new mongodb.ObjectID( token.parent ) } ) as Schema<ICategory<'server'>>;

      if ( !parent )
        throw new Error( `No category exists with the id ${token.parent}` );
    }

    const instance = await categorys.createInstance( token );
    const json = await instance.downloadToken<ICategory<'client'>>( { verbose: true } );

    // Assign this comment as a child to its parent comment if it exists
    if ( parent ) {
      const children = parent.getByName( 'children' )!.getDbValue().map( id => id.toString() );
      children.push( instance.dbEntry._id.toString() );
      await categorys.update<ICategory<'client'>>( <ICategory<'server'>>{ _id: parent.dbEntry._id }, { children: children } )
    }

    return json;
  }
}