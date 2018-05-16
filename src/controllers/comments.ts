import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IComment } from '../types/models/i-comment';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import { CommentsModel } from '../models/comments-model';
import Controller from './controller';
import { ObjectID } from 'mongodb';
import { isValidObjectID } from '../utils/utils';
import { Schema } from '../models/schema';
import { ICategory } from '..';

export type GetManyOptions = {
  public?: boolean;
  parentId?: string;
  keyword?: string;
  user?: string;
  sort?: boolean;
  verbose?: boolean;
  expanded?: boolean;
  depth?: number;
  sortType?: 'updated';
  sortOrder?: 'asc' | 'desc';
  index?: number;
  limit?: number;
}

export type GetOneOptions = {
  verbose?: boolean,
  expanded?: boolean,
  depth?: number
}

/**
 * A controller that deals with the management of comments
 */
export class CommentsController extends Controller {
  private _commentsModel: CommentsModel;

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
    this._commentsModel = Factory.get( 'comments' );
    return this;
  }

  /**
   * Returns an array of comment entries
   */
  async getAll( options: GetManyOptions = { verbose: true } ) {
    const comments = this._commentsModel;
    const findToken: Partial<IComment<'server'>> & { $or: Partial<IComment<'server'>>[] } = { $or: [] };

    // Set the parent filter
    if ( options.parentId )
      findToken.parent = new ObjectID( options.parentId ) as any;

    // Set the user property if its provided
    if ( options.user )
      findToken.author = new RegExp( options.user, 'i' ) as any;

    // Check for keywords
    if ( options.keyword )
      findToken.$or.push( { content: <any>new RegExp( options.keyword, 'i' ) } );

    // Add the or conditions for visibility
    if ( options.public )
      findToken.public = options.public;

    // Set the default sort order to ascending
    let sortOrder = -1;
    if ( options.sortOrder ) {
      if ( options.sortOrder.toLowerCase() === 'asc' )
        sortOrder = 1;
      else
        sortOrder = -1;
    }

    // Sort by the date created
    let sort: Partial<IComment<'server'>> = { createdOn: sortOrder };

    // Optionally sort by the last updated
    if ( options.sort && options.sortType ) {
      if ( options.sortType === 'updated' )
        sort = { lastUpdated: sortOrder };
    }

    if ( findToken.$or.length === 0 )
      delete findToken.$or;

    // First get the count
    const count = await comments.count( findToken );

    const schemas = await comments.findInstances( {
      selector: findToken,
      sort: sort,
      index: options.index,
      limit: options.limit
    } ) as Schema<IComment<'server'>>[];

    const jsons: Array<Promise<IComment<'client'>>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].downloadToken( {
        verbose: options.verbose || true,
        expandForeignKeys: options.expanded || false,
        expandMaxDepth: options.depth || 1,
        expandSchemaBlacklist: [ 'parent' ]
      } ) );

    const sanitizedData = await Promise.all( jsons );
    const response: Page<IComment<'client'>> = {
      count: count,
      data: sanitizedData,
      index: options.index || 0,
      limit: options.limit || 10
    };

    return response;
  }

  /**
   * Gets a single comment resource
   * @param id The id of the comment to fetch
   * @param options Options for getting the resource
   */
  async getOne( id: string, options: GetOneOptions = { verbose: true } ) {
    const comments = this._commentsModel;
    const findToken: IComment<'server'> = { _id: new mongodb.ObjectID( id ) };
    const comment = await comments.download<IComment<'client'>>( findToken, {
      verbose: options.verbose || true,
      expandForeignKeys: options.expanded || false,
      expandMaxDepth: options.depth || 1,
      expandSchemaBlacklist: [ 'parent' ]
    } );

    if ( !isValidObjectID( id ) )
      throw new Error( `Please use a valid object id` );

    if ( !comment )
      throw new Error( 'Could not find comment' );

    const sanitizedData = await comment;
    return sanitizedData;
  }

  /**
   * Removes a comment by its id
   * @param id The id of the comment
   */
  async remove( id: string ) {
    if ( !isValidObjectID( id ) )
      throw new Error( `Please use a valid object id` );

    const comments = this._commentsModel;
    const findToken: IComment<'server'> = { _id: new mongodb.ObjectID( id ) };

    const comment = await comments.download( findToken, { verbose: true } );

    if ( !comment )
      throw new Error( 'Could not find a comment with that ID' );

    // Attempt to delete the instances
    await comments.deleteInstances( findToken );
  }

  /**
   * Updates a comment by id
   * @param id The id of the comment
   * @param token The update token of the comment
   */
  async update( id: string, token: Partial<IComment<'client'>> ) {
    const comments = this._commentsModel;
    const findToken: IComment<'server'> = { _id: new mongodb.ObjectID( id ) };
    const updatedComment = await comments.update<IComment<'client'>>( findToken, token );
    return updatedComment;
  }

  /**
   * Creates a new comment
   * @param token The data of the comment to create
   */
  async create( token: Partial<IComment<'client'>> ) {
    const comments = this._commentsModel;
    let parent: Schema<IComment<'server'>> | null = null;

    if ( token.parent ) {
      parent = await comments.findOne( <IComment<'server'>>{ _id: new mongodb.ObjectID( token.parent as string ) } );

      if ( !parent )
        throw new Error( `No comment exists with the id ${token.parent}` );
    }

    const instance = await comments.createInstance( token ) as Schema<ICategory<'client'>>;
    const json = await instance.downloadToken<IComment<'client'>>( { verbose: true } );

    // Assign this comment as a child to its parent comment if it exists
    if ( parent ) {
      const children = parent.getByName( 'children' )!.value!;
      children.push( new ObjectID( instance.dbEntry._id ) );
      await comments.update( <IComment<'server'>>{ _id: parent.dbEntry._id }, <IComment<'server'>>{ children: children } )
    }

    return json;
  }
}