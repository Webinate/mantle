import { IAuthReq, IPost, IUserEntry, ICategory, IGetCategory, IGetCategories, IGetPost, IGetPosts, IResponse } from 'modepress';

import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Controller } from './controller';
import { Model } from '../models/model';
import { PostsModel } from '../models/posts-model';
import { CategoriesModel } from '../models/categories-model';
import { identifyUser, checkVerbosity, adminRights, hasId } from '../utils/permission-controllers';
import { okJson, errJson } from '../utils/serializers';
import { UserPrivileges } from '../core/users';
import { IControllerOptions } from 'modepress';

/**
 * A controller that deals with the management of posts
 */
export class PostsController extends Controller {
	/**
	 * Creates a new instance of the controller
	 */
    constructor( options: IControllerOptions ) {
        super( [ Model.registerModel( PostsModel ), Model.registerModel( CategoriesModel ) ] );
    }

    /**
     * Called to initialize this controller and its related database objects
     */
    async initialize( e: express.Express, db: mongodb.Db ): Promise<Controller> {
        await super.initialize( e, db );

        const router = express.Router();

        router.use( compression() );
        router.use( bodyParser.urlencoded( { 'extended': true } ) );
        router.use( bodyParser.json() );
        router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

        router.get( '/posts', <any>[ identifyUser, checkVerbosity, this.getPosts.bind( this ) ] );
        router.get( '/posts/slug/:slug', <any>[ identifyUser, checkVerbosity, this.getPost.bind( this ) ] );
        router.get( '/posts/:id', <any>[ identifyUser, checkVerbosity, hasId( 'id', 'ID' ), this.getPost.bind( this ) ] );
        router.delete( '/posts/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.removePost.bind( this ) ] );
        router.put( '/posts/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.updatePost.bind( this ) ] );
        router.post( '/posts', <any>[ adminRights, this.createPost.bind( this ) ] );

        router.get( '/categories', this.getCategories.bind( this ) );
        router.post( '/categories', <any>[ adminRights, this.createCategory.bind( this ) ] );
        router.delete( '/categories/:id', <any>[ adminRights, hasId( 'id', 'ID' ), this.removeCategory.bind( this ) ] );

        // Register the path
        e.use( '/api', router );

        return this;
    }

    /**
     * Returns an array of IPost items
     */
    private async getPosts( req: IAuthReq, res: express.Response ) {
        const posts = this.getModel( 'posts' );
        let count = 0;
        let visibility: string | undefined = undefined;
        const user = req._user;

        const findToken = { $or: [] as IPost[] };
        if ( req.query.author )
            ( <any>findToken ).author = new RegExp( req.query.author, 'i' );

        // Check for keywords
        if ( req.query.keyword ) {
            findToken.$or.push( <IPost>{ title: <any>new RegExp( req.query.keyword, 'i' ) } );
            findToken.$or.push( <IPost>{ content: <any>new RegExp( req.query.keyword, 'i' ) } );
            findToken.$or.push( <IPost>{ brief: <any>new RegExp( req.query.keyword, 'i' ) } );
        }

        // Check for visibility
        if ( req.query.visibility ) {
            if ( ( <string>req.query.visibility ).toLowerCase() === 'all' )
                visibility = 'all';
            else if ( ( <string>req.query.visibility ).toLowerCase() === 'private' )
                visibility = 'private';
            else
                visibility = 'public';
        }

        // If no user we only allow public
        if ( !user )
            visibility = 'public';
        // If an admin - we do not need visibility
        else if ( user.privileges! < UserPrivileges.Admin )
            visibility = undefined;
        // Regular users only see public
        else
            visibility = 'public';

        // Add the or conditions for visibility
        if ( visibility )
            ( <IPost>findToken ).public = visibility === 'public' ? true : false;


        // Check for tags (an OR request with tags)
        if ( req.query.tags ) {
            const tags = req.query.tags.split( ',' );
            if ( tags.length > 0 )
                ( <any>findToken ).tags = { $in: tags };
        }

        // Check for required tags (an AND request with tags)
        if ( req.query.rtags ) {
            const rtags = req.query.rtags.split( ',' );
            if ( rtags.length > 0 ) {
                if ( !( <any>findToken ).tags )
                    ( <any>findToken ).tags = { $all: rtags };
                else
                    ( <any>findToken ).tags.$all = rtags;
            }
        }

        // Check for categories
        if ( req.query.categories ) {
            const categories = req.query.categories.split( ',' );
            if ( categories.length > 0 )
                ( <any>findToken ).categories = { $in: categories };
        }

        // Set the default sort order to ascending
        let sortOrder = -1;

        if ( req.query.sortOrder ) {
            if ( ( <string>req.query.sortOrder ).toLowerCase() === 'asc' )
                sortOrder = 1;
            else
                sortOrder = -1;
        }

        // Sort by the date created
        let sort: IPost = { createdOn: sortOrder };

        // Optionally sort by the last updated
        if ( req.query.sort ) {
            if ( req.query.sort === 'true' )
                sort = { lastUpdated: sortOrder };
        }

        let getContent: boolean = true;
        if ( req.query.minimal )
            getContent = false;

        // Stephen is lovely
        if ( findToken.$or.length === 0 )
            delete findToken.$or;

        try {
            // First get the count
            count = await posts!.count( findToken );

            let index: number | undefined;
            let limit: number | undefined;
            if ( req.query.index !== undefined )
                index = parseInt( req.query.index );
            if ( req.query.limit !== undefined )
                limit = parseInt( req.query.limit );

            const instances = await posts!.findInstances<IPost>( {
                selector: findToken,
                sort: sort,
                index: index,
                limit: limit,
                projection: ( getContent === false ? { content: 0 } : undefined )
            } );

            const jsons: Array<Promise<IPost>> = [];
            for ( let i = 0, l = instances.length; i < l; i++ )
                jsons.push( instances[ i ].schema.getAsJson<IPost>( instances[ i ]._id, { verbose: Boolean( req.query.verbose ) } ) );

            const sanitizedData = await Promise.all( jsons );

            okJson<IGetPosts>( {
                error: false,
                count: count,
                message: `Found ${count} posts`,
                data: sanitizedData
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }

    /**
     * Returns a single post
     */
    private async getPost( req: IAuthReq, res: express.Response ) {
        const posts = this.getModel( 'posts' );
        let findToken: IPost;
        const user: IUserEntry = req._user!;

        try {
            if ( req.params.id )
                findToken = { _id: new mongodb.ObjectID( req.params.id ) };
            else
                findToken = { slug: req.params.slug };

            const instances = await posts!.findInstances<IPost>( { selector: findToken, index: 0, limit: 1 } );

            if ( instances.length === 0 )
                throw new Error( 'Could not find post' );


            const isPublic = await instances[ 0 ].schema.getByName( 'public' )!.getValue();
            // Only admins are allowed to see private posts
            if ( !isPublic && ( !user || ( user && user.privileges! > UserPrivileges.Admin ) ) )
                throw new Error( 'That post is marked private' );

            const jsons: Array<Promise<IPost>> = [];
            for ( let i = 0, l = instances.length; i < l; i++ )
                jsons.push( instances[ i ].schema.getAsJson<IPost>( instances[ i ]._id, { verbose: Boolean( req.query.verbose ) } ) );

            const sanitizedData = await Promise.all( jsons );

            okJson<IGetPost>( {
                error: false,
                message: `Found ${sanitizedData.length} posts`,
                data: sanitizedData[ 0 ]
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }

    /**
     * Returns an array of ICategory items
     */
    private async getCategories( req: IAuthReq, res: express.Response ) {
        const categories = this.getModel( 'categories' )!;

        try {
            const instances = await categories.findInstances<ICategory>( { index: parseInt( req.query.index ), limit: parseInt( req.query.limit ) } );

            const jsons: Array<Promise<ICategory>> = [];
            for ( let i = 0, l = instances.length; i < l; i++ )
                jsons.push( instances[ i ].schema.getAsJson<ICategory>( instances[ i ]._id, { verbose: Boolean( req.query.verbose ) } ) );

            const sanitizedData = await Promise.all( jsons );

            okJson<IGetCategories>( {
                error: false,
                count: sanitizedData.length,
                message: `Found ${sanitizedData.length} categories`,
                data: sanitizedData
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }

    /**
     * Attempts to remove a post by ID
     */
    private async removePost( req: IAuthReq, res: express.Response ) {
        const posts = this.getModel( 'posts' )!;

        try {
            // Attempt to delete the instances
            const numRemoved = await posts.deleteInstances( <IPost>{ _id: new mongodb.ObjectID( req.params.id ) } );

            if ( numRemoved === 0 )
                throw new Error( 'Could not find a post with that ID' );

            okJson<IResponse>( {
                error: false,
                message: 'Post has been successfully removed'
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }

    /**
     * Attempts to remove a category by ID
     */
    private async removeCategory( req: IAuthReq, res: express.Response ) {
        const categories = this.getModel( 'categories' )!;

        try {
            const numRemoved = await categories.deleteInstances( <ICategory>{ _id: new mongodb.ObjectID( req.params.id ) } );

            if ( numRemoved === 0 )
                return Promise.reject( new Error( 'Could not find a category with that ID' ) );

            okJson<IResponse>( {
                error: false,
                message: 'Category has been successfully removed'
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }

    /**
     * Attempts to update a post by ID
     */
    private async updatePost( req: IAuthReq, res: express.Response ) {
        const token: IPost = req.body;
        const posts = this.getModel( 'posts' )!;

        try {
            const instance = await posts.update( <IPost>{ _id: new mongodb.ObjectID( req.params.id ) }, token );

            if ( instance.error )
                throw new Error( <string>instance.tokens[ 0 ].error );

            if ( instance.tokens.length === 0 )
                throw new Error( 'Could not find post with that id' );

            okJson<IResponse>( {
                error: false,
                message: 'Post Updated'
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }

    /**
     * Attempts to create a new post
     */
    private async createPost( req: IAuthReq, res: express.Response ) {
        const token: IPost = req.body;
        const posts = this.getModel( 'posts' )!;

        // User is passed from the authentication function
        token.author = req._user!.username;

        try {
            const instance = await posts.createInstance( token );
            const json = await instance.schema.getAsJson( instance._id, { verbose: true } );

            okJson<IGetPost>( {
                error: false,
                message: 'New post created',
                data: json
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }

    /**
     * Attempts to create a new category item
     */
    private async createCategory( req: IAuthReq, res: express.Response ) {
        const token: ICategory = req.body;
        const categories = this.getModel( 'categories' )!;

        try {
            const instance = await categories.createInstance( token );
            const json = await instance.schema.getAsJson( instance._id, { verbose: true } );

            okJson<IGetCategory>( {
                error: false,
                message: 'New category created',
                data: json
            }, res );

        } catch ( err ) {
            errJson( err, res );
        };
    }
}