import * as bodyParser from "body-parser";
import * as mongodb from "mongodb";
import * as entities from "entities";
import * as express from "express";
import {Controller} from "./Controller";
import {PostsModel} from "../models/PostsModel";
import {CategoriesModel} from "../models/CategoriesModel";
import {UsersService} from "../UsersService"

/**
* A controller that deals with the management of posts
*/
export class PostsController extends Controller
{
	/**
	* Creates a new instance of the email controller
	* @param {express.Express} e The express instance of this server
	*/
	constructor(e: express.Express )
	{
        super([new PostsModel(), new CategoriesModel()]);
        
		var router = express.Router();
		router.use(bodyParser.urlencoded({ 'extended': true }));
		router.use(bodyParser.json());
		router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        
        router.get("/get-posts", this.getPosts.bind(this));
        router.get("/get-post/:slug", this.getPost.bind(this));
        router.get("/get-categories", this.getCategories.bind(this));
        router.delete("/remove-post/:id", <any>[this.authenticateAdmin.bind(this), this.removePost.bind(this)]);
        router.delete("/remove-category/:id", <any>[this.authenticateAdmin.bind(this), this.removeCategory.bind(this)]);
        router.put("/update-post/:id", <any>[this.authenticateAdmin.bind(this), this.updatePost.bind(this)]);
        router.post("/create-post", <any>[this.authenticateAdmin.bind(this), this.createPost.bind(this)]);
        router.post("/create-category", <any>[this.authenticateAdmin.bind(this), this.createCategory.bind(this)]);

		// Register the path
		e.use( "/api/posts", router );
    }

    /**
    * Returns an array of IPost items
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getPosts(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        var that = this;
        var count = 0;

        var findToken = { $or : [] };
        if (req.query.author)
            findToken.$or.push(<modepress.IPost>{ author: <any>new RegExp(req.query.author, "i") });

        // Check for keywords
        if (req.query.keyword)
        {
            findToken.$or.push(<modepress.IPost>{ title: <any>new RegExp(req.query.keyword, "i") });
            findToken.$or.push(<modepress.IPost>{ content: <any > new RegExp(req.query.keyword, "i") });
        }

        // Check for tags
        if (req.query.tags)
        {
            var tags = req.query.tags.split(",");
            if (tags.length > 0)
                (<any>findToken).tags = { $in: tags };
        }

        // Check for categories
        if (req.query.categories)
        {
            var tags = req.query.categories.split(",");
            if (tags.length > 0)
                (<any>findToken).categories = { $in: tags };
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
        var sort: modepress.IPost = { createdOn: sortOrder };

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
            return posts.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { content: 0 } : undefined));

        }).then(function (instances)
       {
            var sanitizedData: Array<modepress.IPost> = that.getSanitizedData(instances, Boolean(req.query.verbose));
           res.end(JSON.stringify(<modepress.IGetPosts>{
                error: false,
                count: count,
                message: `Found ${count} posts`,
                data: sanitizedData
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Returns a single post
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getPost(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        var that = this;
        var count = 0;
        var findToken: modepress.IPost = { slug: req.params.slug };
        
        posts.findInstances(findToken, [], 0, 1).then(function (instances)
        {
            if (instances.length == 0)
                return Promise.reject(new Error("Could not find post"));

            var sanitizedData: Array<modepress.IPost> = that.getSanitizedData(instances, Boolean(req.query.verbose));

            res.end(JSON.stringify(<modepress.IGetPost>{
                error: false,
                message: `Found ${count} posts`,
                data: sanitizedData[0]
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Returns an array of ICategory items
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getCategories(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var categories = this.getModel("categories");
        var that = this;

        categories.findInstances({}, parseInt(req.query.index), parseInt(req.query.limit)).then(function (instances)
        {
            var sanitizedData: Array<modepress.ICategory> = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify(<modepress.IGetCategories>{
                error: false,
                count: sanitizedData.length,
                message: `Found ${instances.length} categories`,
                data: sanitizedData
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * This funciton checks the logged in user is an admin. If not an admin it returns an error, 
    * if true it passes the scope onto the next function in the queue
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private authenticateAdmin(req: express.Request, res: express.Response, next: Function)
    {
        var users = UsersService.getSingleton();

        users.authenticated(req, res).then(function(auth)
        {
            if (!auth.authenticated)
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(<modepress.IResponse>{
                    error: true,
                    message: "You must be logged in to make this request"
                }));
            }
            else if (!users.hasPermission(auth.user, 2))
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(<modepress.IResponse>{
                    error: true,
                    message: "You do not have permission"
                }));
            }
            else
            {
                req.params.user = auth.user;
                next();
            }

        }).catch(function (error: Error)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: "You do not have permission"
            }));
        });
    }

    /**
    * Attempts to remove a post by ID
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private removePost(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        
        posts.deleteInstances(<modepress.IPost>{ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved)
        {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a post with that ID"));

            res.end(JSON.stringify(<modepress.IResponse>{
                error: false,
                message: "Post has been successfully removed"
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to remove a category by ID
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private removeCategory(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var categories = this.getModel("categories");

        categories.deleteInstances(<modepress.ICategory>{ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved)
        {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a category with that ID"));

            res.end(JSON.stringify(<modepress.IResponse>{
                error: false,
                message: "Category has been successfully removed"
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to update a post by ID
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private updatePost(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: modepress.IPost = req.body;
        var posts = this.getModel("posts");

        posts.updateInstance(req.params.id, token).then(function (instance)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: false,
                message: "Post Updated"
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
    
    /**
    * Attempts to create a new post. The 
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private createPost(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: modepress.IPost = req.body;
        var posts = this.getModel("posts");

        // User is passed from the authentication function
        token.author = (<UsersInterface.IUserEntry>req.params.user).username;
    
        posts.createInstance(token).then(function (instance)
        {
            var newPost: modepress.IPost = instance.schema.generateCleanData(true);
            newPost._id = instance._id;

            res.end(JSON.stringify(<modepress.IGetPost>{
                error: false,
                message: "New post created",
                data: newPost
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
   * Attempts to create a new category item.
   * @param {express.Request} req 
   * @param {express.Response} res
   * @param {Function} next 
   */
    private createCategory(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: modepress.ICategory = req.body;
        var categories = this.getModel("categories");

        categories.createInstance(token).then(function (instance)
        {
            var newCategory: modepress.ICategory = instance.schema.generateCleanData(true);
            newCategory._id = instance._id;

            res.end(JSON.stringify(<modepress.IGetCategory>{
                error: false,
                message: "New category created",
                data: newCategory
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}