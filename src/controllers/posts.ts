import { IPost, Page, IConfig } from 'modepress';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';
import { PostsModel } from '../models/posts-model';
import Controller from './controller';

export type SearchOptions = {
  verbose?: boolean;
  keyword?: RegExp;
  author?: string;
  public?: boolean;
  tags?: string[];
  requiredTags?: string[];
  categories?: string[];
  sort?: boolean;
  sortOrder?: 'asc' | 'desc';
  minimal?: boolean;
  index?: number;
  limit?: number;
}

/**
 * A controller that deals with the management of posts
 */
export class PostsController extends Controller {
  private _postsModel: PostsModel;

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
    this._postsModel = Factory.get( 'posts' );
    return this;
  }

  /**
   * Returns an array of IPost items
   */
  public async getPosts( options: SearchOptions = { verbose: true } ) {
    const posts = this._postsModel;
    let count = 0;

    const findToken = { $or: [] as IPost[] };
    if ( options.author )
      ( <any>findToken ).author = new RegExp( options.author, 'i' );

    // Check for keywords
    if ( options.keyword ) {
      findToken.$or.push( <IPost>{ title: <any>options.keyword } );
      findToken.$or.push( <IPost>{ content: <any>options.keyword } );
      findToken.$or.push( <IPost>{ brief: <any>options.keyword } );
    }

    // Add the or conditions for visibility
    if ( options.public )
      ( <IPost>findToken ).public = options.public;

    // Check for tags (an OR request with tags)
    if ( options.tags && options.tags.length > 0 ) {
      ( <any>findToken ).tags = { $in: options.tags };
    }

    // Check for required tags (an AND request with tags)
    if ( options.requiredTags && options.requiredTags.length > 0 ) {
      if ( !( <any>findToken ).tags )
        ( <any>findToken ).tags = { $all: options.requiredTags };
      else
          ( <any>findToken ).tags.$all = options.requiredTags;
    }

    // Check for categories
    if ( options.categories && options.categories.length > 0 )
      ( <any>findToken ).categories = { $in: options.categories };


    // Set the default sort order to ascending
    let sortOrder = -1;

    if ( options.sortOrder ) {
      if ( options.sortOrder.toLowerCase() === 'asc' )
        sortOrder = 1;
      else
        sortOrder = -1;
    }

    // Sort by the date created
    let sort: IPost = { createdOn: sortOrder };

    // Optionally sort by the last updated
    if ( options.sort )
      sort = { lastUpdated: sortOrder };

    let getContent: boolean = true;
    if ( options.minimal )
      getContent = false;

    // Stephen is lovely
    if ( findToken.$or.length === 0 )
      delete findToken.$or;

    // First get the count
    count = await posts!.count( findToken );

    let index: number = options.index || 0;
    let limit: number = options.limit || 10;

    const schemas = await posts!.findInstances( {
      selector: findToken,
      sort: sort,
      index: index,
      limit: limit,
      projection: ( getContent === false ? { content: 0 } : undefined )
    } );

    const jsons: Array<Promise<IPost>> = [];
    for ( let i = 0, l = schemas.length; i < l; i++ )
      jsons.push( schemas[ i ].getAsJson( { verbose: options.verbose !== undefined ? options.verbose : true } ) );

    const sanitizedData = await Promise.all( jsons );
    const response: Page<IPost> = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit
    };

    return response;
  }
}