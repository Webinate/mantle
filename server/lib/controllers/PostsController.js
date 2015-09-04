var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var express = require("express");
var compression = require("compression");
var Controller_1 = require("./Controller");
var PostsModel_1 = require("../models/PostsModel");
var CategoriesModel_1 = require("../models/CategoriesModel");
var UsersService_1 = require("../UsersService");
var PermissionControllers_1 = require("../PermissionControllers");
/**
* A controller that deals with the management of posts
*/
var PostsController = (function (_super) {
    __extends(PostsController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function PostsController(server, config, e) {
        _super.call(this, [new PostsModel_1.PostsModel(), new CategoriesModel_1.CategoriesModel()]);
        var router = express.Router();
        router.use(compression());
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/get-posts", [PermissionControllers_1.getUser, this.getPosts.bind(this)]);
        router.get("/get-post/:slug", [PermissionControllers_1.getUser, this.getPost.bind(this)]);
        router.get("/get-categories", this.getCategories.bind(this));
        router.delete("/remove-post/:id", [PermissionControllers_1.isAdmin, this.removePost.bind(this)]);
        router.delete("/remove-category/:id", [PermissionControllers_1.isAdmin, this.removeCategory.bind(this)]);
        router.put("/update-post/:id", [PermissionControllers_1.isAdmin, this.updatePost.bind(this)]);
        router.post("/create-post", [PermissionControllers_1.isAdmin, this.createPost.bind(this)]);
        router.post("/create-category", [PermissionControllers_1.isAdmin, this.createCategory.bind(this)]);
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
        var user = req._user;
        var findToken = { $or: [] };
        if (req.query.author)
            findToken.author = new RegExp(req.query.author, "i");
        // Check for keywords
        if (req.query.keyword) {
            findToken.$or.push({ title: new RegExp(req.query.keyword, "i") });
            findToken.$or.push({ content: new RegExp(req.query.keyword, "i") });
            findToken.$or.push({ brief: new RegExp(req.query.keyword, "i") });
        }
        // Check for visibility
        if (req.query.visibility) {
            if (req.query.visibility.toLowerCase() == "all")
                visibility = "all";
            else if (req.query.visibility.toLowerCase() == "private")
                visibility = "private";
        }
        var users = UsersService_1.UsersService.getSingleton();
        // Only admins are allowed to see private posts
        if (!user || ((visibility == "all" || visibility == "private") && users.hasPermission(user, 2) == false))
            visibility = "public";
        // Add the or conditions for visibility
        if (visibility != "all") {
            if (visibility == "public")
                findToken.public = true;
            else
                findToken.public = false;
        }
        // Check for tags (an OR request with tags)
        if (req.query.tags) {
            var tags = req.query.tags.split(",");
            if (tags.length > 0)
                findToken.tags = { $in: tags };
        }
        // Check for 'r'equired tags (an AND request with tags)
        if (req.query.rtags) {
            var rtags = req.query.rtags.split(",");
            if (rtags.length > 0) {
                if (!findToken.tags)
                    findToken.tags = { $all: rtags };
                else
                    findToken.tags.$all = rtags;
            }
        }
        // Check for categories
        if (req.query.categories) {
            var categories = req.query.categories.split(",");
            if (categories.length > 0)
                findToken.categories = { $in: categories };
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
        var user = req._user;
        posts.findInstances(findToken, [], 0, 1).then(function (instances) {
            if (instances.length == 0)
                return Promise.reject(new Error("Could not find post"));
            var users = UsersService_1.UsersService.getSingleton();
            // Only admins are allowed to see private posts
            if (!instances[0].schema.getByName("public").getValue() && (!user || users.hasPermission(user, 2) == false)) {
                res.end(JSON.stringify({
                    error: true,
                    message: "That post is marked private"
                }));
                return;
            }
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
        posts.update({ _id: new mongodb.ObjectID(req.params.id) }, token).then(function (instance) {
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
        token.author = req._user.username;
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
exports.default = PostsController;
