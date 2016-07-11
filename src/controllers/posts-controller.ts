import * as bodyParser from "body-parser";
import * as mongodb from "mongodb";
import * as entities from "entities";
import * as express from "express";
import * as compression from "compression";
import {Controller} from "./controller";
import {Model} from "../models/model";
import {PostsModel} from "../models/posts-model";
import {CategoriesModel} from "../models/categories-model";
import {UsersService} from "../users-service";
import {getUser, isAdmin, hasId} from "../permission-controllers";
import * as mp from "modepress-api";
import * as winston from "winston";
import {okJson, errJson} from "../serializers";

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
        super([  Model.registerModel(PostsModel), Model.registerModel(CategoriesModel)]);

        var router = express.Router();

        router.use(compression());
		router.use(bodyParser.urlencoded({ 'extended': true }));
		router.use(bodyParser.json());
		router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/posts", <any>[getUser, this.getPosts.bind(this)]);
        router.get("/posts/slug/:slug", <any>[getUser, this.getPost.bind(this)]);
        router.get("/posts/:id", <any>[getUser, hasId("id", "ID"), this.getPost.bind(this)]);
        router.delete("/posts/:id", <any>[isAdmin, hasId("id", "ID"), this.removePost.bind(this)]);
        router.put("/posts/:id", <any>[isAdmin, hasId("id", "ID"), this.updatePost.bind(this)]);
        router.post("/posts", <any>[isAdmin, this.createPost.bind(this)]);

        router.get("/categories", this.getCategories.bind(this));
        router.post("/categories", <any>[isAdmin, this.createCategory.bind(this)]);
        router.delete("/categories/:id", <any>[isAdmin, hasId("id", "ID"), this.removeCategory.bind(this)]);

		// Register the path
		e.use( "/api", router );
    }

    /**
    * Returns an array of IPost items
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private async getPosts(req: mp.IAuthReq, res: express.Response, next: Function)
    {
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

        try
        {
            // First get the count
            count = await posts.count(findToken);

            var instances = await posts.findInstances<mp.IPost>(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { content: 0 } : undefined));

            var jsons : Array<Promise<mp.IPost>> = [];
            for (var i = 0, l = instances.length; i < l; i++)
                jsons.push(instances[i].schema.getAsJson<mp.IPost>(instances[i]._id, { verbose : Boolean(req.query.verbose) }));

            var sanitizedData = await Promise.all(jsons);

            okJson<mp.IGetPosts>( {
                error: false,
                count: count,
                message: `Found ${count} posts`,
                data: sanitizedData
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }

    /**
    * Returns a single post
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private async getPost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        var posts = this.getModel("posts");
        var that = this;
        var findToken: mp.IPost;
        var user: UsersInterface.IUserEntry = req._user;

        try
        {
            if (req.params.id)
                findToken = { _id: new mongodb.ObjectID(req.params.id) };
            else
                findToken = { slug: req.params.slug };

            var instances = await posts.findInstances<mp.IPost>(findToken, [], 0, 1);

            if (instances.length == 0)
                throw new Error("Could not find post");

            var users = UsersService.getSingleton();
            var isPublic =  await instances[0].schema.getByName("public").getValue();
            // Only admins are allowed to see private posts
            if (!isPublic && ( !user || users.hasPermission(user, 2) == false ) )
                throw new Error("That post is marked private");

            var jsons : Array<Promise<mp.IPost>> = [];
            for (var i = 0, l = instances.length; i < l; i++)
                jsons.push(instances[i].schema.getAsJson<mp.IPost>(instances[i]._id, { verbose: Boolean(req.query.verbose) } ));

            var sanitizedData = await Promise.all(jsons);

            okJson<mp.IGetPost>( {
                error: false,
                message: `Found ${sanitizedData.length} posts`,
                data: sanitizedData[0]
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }

    /**
    * Returns an array of ICategory items
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private async getCategories(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        var categories = this.getModel("categories");
        var that = this;

        try
        {
            var instances  = await categories.findInstances<mp.ICategory>({}, {}, parseInt(req.query.index), parseInt(req.query.limit));

            var jsons : Array<Promise<mp.ICategory>> = [];
            for (var i = 0, l = instances.length; i < l; i++)
                jsons.push(instances[i].schema.getAsJson<mp.ICategory>(instances[i]._id, { verbose: Boolean(req.query.verbose) }));

            var sanitizedData = await Promise.all(jsons);

            okJson<mp.IGetCategories>( {
                error: false,
                count: sanitizedData.length,
                message: `Found ${sanitizedData.length} categories`,
                data: sanitizedData
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }

    /**
    * Attempts to remove a post by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private async removePost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        var posts = this.getModel("posts");

        try
        {
            // Attempt to delete the instances
            var numRemoved = await posts.deleteInstances(<mp.IPost>{ _id: new mongodb.ObjectID(req.params.id) });

            if (numRemoved == 0)
                throw new Error("Could not find a post with that ID");

            okJson<mp.IResponse>( {
                error: false,
                message: "Post has been successfully removed"
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }

    /**
    * Attempts to remove a category by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private async removeCategory(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        var categories = this.getModel("categories");

        try
        {
            var numRemoved = await categories.deleteInstances(<mp.ICategory>{ _id: new mongodb.ObjectID(req.params.id) });

            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a category with that ID"));

            okJson<mp.IResponse>( {
                error: false,
                message: "Category has been successfully removed"
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }

    /**
    * Attempts to update a post by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private async updatePost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        var token: mp.IPost = req.body;
        var posts = this.getModel("posts");

        try
        {
            var instance = await posts.update(<mp.IPost>{ _id: new mongodb.ObjectID(req.params.id) }, token);

            if (instance.error)
               throw new Error(<string>instance.tokens[0].error);

            if ( instance.tokens.length == 0 )
               throw new Error("Could not find post with that id");

            okJson<mp.IResponse>( {
                error: false,
                message: "Post Updated"
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }

    /**
    * Attempts to create a new post. The
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private async createPost(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        var token: mp.IPost = req.body;
        var posts = this.getModel("posts");

        // User is passed from the authentication function
        token.author = req._user.username;

        try
        {
            var instance = await posts.createInstance(token);
            var json = await instance.schema.getAsJson(instance._id, { verbose: true });

            okJson<mp.IGetPost>( {
                error: false,
                message: "New post created",
                data: json
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }

    /**
   * Attempts to create a new category item.
   * @param {mp.IAuthReq} req
   * @param {express.Response} res
   * @param {Function} next
   */
    private async createCategory(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        var token: mp.ICategory = req.body;
        var categories = this.getModel("categories");

        try
        {
            var instance = await categories.createInstance(token);
            var json = await instance.schema.getAsJson(instance._id, { verbose: true });

            okJson<mp.IGetCategory>( {
                error: false,
                message: "New category created",
                data: json
            }, res);

        } catch ( err ) {
            errJson(err, res);
        };
    }
}