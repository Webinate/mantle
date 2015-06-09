var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var express = require("express");
var Controller_1 = require("./Controller");
var PostsModel_1 = require("../models/PostsModel");
var CategoriesModel_1 = require("../models/CategoriesModel");
var UsersService_1 = require("../UsersService");
/**
* A controller that deals with the management of posts
*/
var PostsController = (function (_super) {
    __extends(PostsController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {express.Express} e The express instance of this server
    */
    function PostsController(e) {
        _super.call(this, [new PostsModel_1.PostsModel(), new CategoriesModel_1.CategoriesModel()]);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/get-posts", this.getPosts.bind(this));
        router.get("/get-post/:slug", this.getPost.bind(this));
        router.get("/get-categories", this.getCategories.bind(this));
        router.delete("/remove-post/:id", [this.authenticateAdmin.bind(this), this.removePost.bind(this)]);
        router.delete("/remove-category/:id", [this.authenticateAdmin.bind(this), this.removeCategory.bind(this)]);
        router.put("/update-post/:id", [this.authenticateAdmin.bind(this), this.updatePost.bind(this)]);
        router.post("/create-post", [this.authenticateAdmin.bind(this), this.createPost.bind(this)]);
        router.post("/create-category", [this.authenticateAdmin.bind(this), this.createCategory.bind(this)]);
        // Register the path
        e.use("/api/posts", router);
    }
    /**
    * Returns an array of IPost items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.getPosts = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        var that = this;
        var count = 0;
        var visibility = "public";
        var findToken = { $or: [] };
        if (req.query.author)
            findToken.$or.push({ author: new RegExp(req.query.author, "i") });
        // Check for keywords
        if (req.query.keyword) {
            findToken.$or.push({ title: new RegExp(req.query.keyword, "i") });
            findToken.$or.push({ content: new RegExp(req.query.keyword, "i") });
        }
        // Check for visibility
        if (req.query.visibility) {
            if (req.query.visibility.toLowerCase() == "all")
                visibility = "all";
            else if (req.query.visibility.toLowerCase() == "private")
                visibility = "private";
        }
        // Add the or conditions for visibility
        if (visibility != "all") {
            if (visibility == "public")
                findToken.$or.push({ public: true });
            else
                findToken.$or.push({ public: false });
        }
        // Check for tags
        if (req.query.tags) {
            var tags = req.query.tags.split(",");
            if (tags.length > 0)
                findToken.tags = { $in: tags };
        }
        // Check for categories
        if (req.query.categories) {
            var tags = req.query.categories.split(",");
            if (tags.length > 0)
                findToken.categories = { $in: tags };
        }
        // Set the default sort order to ascending
        var sortOrder = -1;
        if (req.query.sortOrder) {
            if (req.query.sortOrder.toLowerCase() == "asc")
                sortOrder = 1;
            else
                sortOrder = -1;
        }
        // Sort by the date created
        var sort = { createdOn: sortOrder };
        // Optionally sort by the last updated
        if (req.query.sort) {
            if (req.query.sort == "updated")
                sort = { lastUpdated: sortOrder };
        }
        var getContent = true;
        if (req.query.minimal)
            getContent = false;
        // Stephen is lovely
        if (findToken.$or.length == 0)
            delete findToken.$or;
        // First get the count
        posts.count(findToken).then(function (num) {
            count = num;
            return posts.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { content: 0 } : undefined));
        }).then(function (instances) {
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " posts",
                data: sanitizedData
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Returns a single post
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.getPost = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        var that = this;
        var count = 0;
        var findToken = { slug: req.params.slug };
        posts.findInstances(findToken, [], 0, 1).then(function (instances) {
            if (instances.length == 0)
                return Promise.reject(new Error("Could not find post"));
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify({
                error: false,
                message: "Found " + count + " posts",
                data: sanitizedData[0]
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Returns an array of ICategory items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.getCategories = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var categories = this.getModel("categories");
        var that = this;
        categories.findInstances({}, parseInt(req.query.index), parseInt(req.query.limit)).then(function (instances) {
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify({
                error: false,
                count: sanitizedData.length,
                message: "Found " + instances.length + " categories",
                data: sanitizedData
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * This funciton checks the logged in user is an admin. If not an admin it returns an error,
    * if true it passes the scope onto the next function in the queue
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.authenticateAdmin = function (req, res, next) {
        var users = UsersService_1.UsersService.getSingleton();
        users.authenticated(req, res).then(function (auth) {
            if (!auth.authenticated) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: true,
                    message: "You must be logged in to make this request"
                }));
            }
            else if (!users.hasPermission(auth.user, 2)) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: true,
                    message: "You do not have permission"
                }));
            }
            else {
                req.params.user = auth.user;
                next();
            }
        }).catch(function (error) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: true,
                message: "You do not have permission"
            }));
        });
    };
    /**
    * Attempts to remove a post by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.removePost = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var posts = this.getModel("posts");
        posts.deleteInstances({ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved) {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a post with that ID"));
            res.end(JSON.stringify({
                error: false,
                message: "Post has been successfully removed"
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Attempts to remove a category by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.removeCategory = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var categories = this.getModel("categories");
        categories.deleteInstances({ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved) {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a category with that ID"));
            res.end(JSON.stringify({
                error: false,
                message: "Category has been successfully removed"
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Attempts to update a post by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.updatePost = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var token = req.body;
        var posts = this.getModel("posts");
        posts.updateInstance(req.params.id, token).then(function (instance) {
            res.end(JSON.stringify({
                error: false,
                message: "Post Updated"
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Attempts to create a new post. The
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PostsController.prototype.createPost = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var token = req.body;
        var posts = this.getModel("posts");
        // User is passed from the authentication function
        token.author = req.params.user.username;
        posts.createInstance(token).then(function (instance) {
            var newPost = instance.schema.generateCleanData(true);
            newPost._id = instance._id;
            res.end(JSON.stringify({
                error: false,
                message: "New post created",
                data: newPost
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
   * Attempts to create a new category item.
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {Function} next
   */
    PostsController.prototype.createCategory = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var token = req.body;
        var categories = this.getModel("categories");
        categories.createInstance(token).then(function (instance) {
            var newCategory = instance.schema.generateCleanData(true);
            newCategory._id = instance._id;
            res.end(JSON.stringify({
                error: false,
                message: "New category created",
                data: newCategory
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return PostsController;
})(Controller_1.Controller);
exports.PostsController = PostsController;
