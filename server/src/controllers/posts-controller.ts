import * as bodyParser from "body-parser";
import * as mongodb from "mongodb";
import * as entities from "entities";
import * as express from "express";
import * as compression from "compression";
import {Controller} from "./controller";
import {PostsModel} from "../models/posts-model";
import {CategoriesModel} from "../models/categories-model";
import {UsersService} from "../users-service";
import {getUser, isAdmin, hasId} from "../permission-controllers";
import * as mp from "modepress-api";
import * as winston from "winston";

/**
* A controller that deals with the management of posts
*/
export default class PostsController extends Controller
{
	/**
	* Creates a new instance of the controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
	*/
    constructor(server: mp.IServer, config: mp.IConfig, e: express.Express)
    {
        super([new PostsModel(), new CategoriesModel()]);

        var router = express.Router();

        router.use(compression());
		router.use(bodyParser.urlencoded({ 'extended': true }));
		router.use(bodyParser.json());
		router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/get-posts", <any>[getUser, this.getPosts.bind(this)]);
        router.get("/get-post/:slug", <any>[getUser, this.getPost.bind(this)]);
        router.get("/get-categories", this.getCategories.bind(this));
        router.delete("/remove-post/:id", <any>[isAdmin, hasId, this.removePost.bind(this)]);
        router.delete("/remove-category/:id", <any>[isAdmin, hasId, this.removeCategory.bind(this)]);
        router.put("/update-post/:id", <any>[isAdmin, hasId, this.updatePost.bind(this)]);
        router.post("/create-post", <any>[isAdmin, this.createPost.bind(this)]);
        router.post("/create-category", <any>[isAdmin, this.createCategory.bind(this)]);

		// Register the path
		e.use( "/api/posts", router );
    }

    /**
    * Returns an array of IPost items
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private getPosts(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        var that = this;
        var count = 0;
        var visibility = "public";
        var user: UsersInterface.IUserEntry = req._user;

        var findToken = { $or : [] };
        if (req.query.author)
            (<any>findToken).author = new RegExp(req.query.author, "i");

        // Check for keywords
        if (req.query.keyword)
        {
            findToken.$or.push(<mp.IPost>{ title: <any>new RegExp(req.query.keyword, "i") });
            findToken.$or.push(<mp.IPost>{ content: <any> new RegExp(req.query.keyword, "i") });
            findToken.$or.push(<mp.IPost>{ brief: <any> new RegExp(req.query.keyword, "i") });
        }

        // Check for visibility
        if (req.query.visibility)
        {
            if ((<string>req.query.visibility).toLowerCase() == "all")
                visibility = "all";
            else if ((<string>req.query.visibility).toLowerCase() == "private")
                 visibility = "private";
        }
        else
            visibility = "all";

        var users = UsersService.getSingleton();

        // Only admins are allowed to see private posts
        if ( !user || ( ( visibility == "all" || visibility == "private" ) && users.hasPermission(user, 2) == false ) )
            visibility = "public";

        // Add the or conditions for visibility
        if (visibility != "all")
        {
            if (visibility == "public")
                (<mp.IPost>findToken).public = true;
            else
                (<mp.IPost>findToken).public = false;
        }

        // Check for tags (an OR request with tags)
        if (req.query.tags)
        {
            var tags = req.query.tags.split(",");
            if (tags.length > 0)
                (<any>findToken).tags = { $in: tags };
        }

        // Check for 'r'equired tags (an AND request with tags)
        if (req.query.rtags)
        {
            var rtags = req.query.rtags.split(",");
            if (rtags.length > 0)
            {
                if (!(<any>findToken).tags)
                    (<any>findToken).tags = { $all: rtags };
                else
                    (<any>findToken).tags.$all = rtags;
            }
        }

        // Check for categories
        if (req.query.categories)
        {
            var categories = req.query.categories.split(",");
            if (categories.length > 0)
                (<any>findToken).categories = { $in: categories };
        }

        // Set the default sort order to ascending
        var sortOrder = -1;

        if (req.query.sortOrder)
        {
            if ((<string>req.query.sortOrder).toLowerCase() == "asc")
                sortOrder = 1;
            else
                sortOrder = -1;
        }

        // Sort by the date created
        var sort: mp.IPost = { createdOn: sortOrder };

        // Optionally sort by the last updated
        if (req.query.sort)
        {
            if (req.query.sort == "updated")
                sort = { lastUpdated: sortOrder };
        }

        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;


        // Stephen is lovely
        if (findToken.$or.length == 0)
            delete findToken.$or;

        // First get the count
        posts.count(findToken).then(function (num)
        {
            count = num;
            return posts.findInstances<mp.IPost>(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { content: 0 } : undefined));

        }).then(function (instances)
       {
            return that.getSanitizedData(instances, Boolean(req.query.verbose));

       }).then(function(sanitizedData){

           res.end(JSON.stringify(<mp.IGetPosts>{
                error: false,
                count: count,
                message: `Found ${count} posts`,
                data: sanitizedData
            }));

       }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Returns a single post
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private getPost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        var that = this;
        var findToken: mp.IPost = { slug: req.params.slug };
        var user: UsersInterface.IUserEntry = req._user;

        posts.findInstances<mp.IPost>(findToken, [], 0, 1).then(function (instances)
        {
            if (instances.length == 0)
                return Promise.reject(new Error("Could not find post"));

            var users = UsersService.getSingleton();

            // Only admins are allowed to see private posts
            if (!instances[0].schema.getByName("public").getValue() && ( !user || users.hasPermission(user, 2) == false ) )
                return Promise.reject(new Error("That post is marked private"));

            return that.getSanitizedData<mp.IPost>(instances, Boolean(req.query.verbose));

        }).then(function(sanitizedData){

            res.end(JSON.stringify(<mp.IGetPost>{
                error: false,
                message: `Found ${sanitizedData.length} posts`,
                data: sanitizedData[0]
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Returns an array of ICategory items
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private getCategories(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var categories = this.getModel("categories");
        var that = this;

        categories.findInstances<mp.ICategory>({}, {}, parseInt(req.query.index), parseInt(req.query.limit)).then(function (instances)
        {
            return that.getSanitizedData(instances, Boolean(req.query.verbose));

        }).then(function(sanitizedData){

          res.end(JSON.stringify(<mp.IGetCategories>{
                error: false,
                count: sanitizedData.length,
                message: `Found ${sanitizedData.length} categories`,
                data: sanitizedData
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to remove a post by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private removePost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");

        // Attempt to delete the instances
        posts.deleteInstances(<mp.IPost>{ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved)
        {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a post with that ID"));

            res.end(JSON.stringify(<mp.IResponse>{
                error: false,
                message: "Post has been successfully removed"
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to remove a category by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private removeCategory(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var categories = this.getModel("categories");

        categories.deleteInstances(<mp.ICategory>{ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved)
        {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a category with that ID"));

            res.end(JSON.stringify(<mp.IResponse>{
                error: false,
                message: "Category has been successfully removed"
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to update a post by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private updatePost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: mp.IPost = req.body;
        var posts = this.getModel("posts");

        posts.update(<mp.IPost>{ _id: new mongodb.ObjectID(req.params.id) }, token).then(function (instance)
        {
            if (instance.error)
                return Promise.reject(new Error(<string>instance.tokens[0].error));

            if ( instance.tokens.length == 0 )
                return Promise.reject(new Error("Could not find post with that id"));

            res.end(JSON.stringify(<mp.IResponse>{ error: false, message: "Post Updated" }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to create a new post. The
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private createPost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: mp.IPost = req.body;
        var posts = this.getModel("posts");

        // User is passed from the authentication function
        token.author = req._user.username;

        posts.createInstance(token).then(function (instance)
        {
            return instance.schema.getAsJson(false, instance._id);

        }).then(function(json){

            res.end(JSON.stringify(<mp.IGetPost>{
                error: false,
                message: "New post created",
                data: json
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
   * Attempts to create a new category item.
   * @param {mp.IAuthReq} req
   * @param {express.Response} res
   * @param {Function} next
   */
    private createCategory(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: mp.ICategory = req.body;
        var categories = this.getModel("categories");

        categories.createInstance(token).then(function (instance)
        {
            return instance.schema.getAsJson(true, instance._id);

        }).then(function(json){

            res.end(JSON.stringify(<mp.IGetCategory>{
                error: false,
                message: "New category created",
                data: json
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}