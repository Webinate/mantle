"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var express = require("express");
var compression = require("compression");
var controller_1 = require("./controller");
var posts_model_1 = require("../models/posts-model");
var categories_model_1 = require("../models/categories-model");
var users_service_1 = require("../users-service");
var permission_controllers_1 = require("../permission-controllers");
var winston = require("winston");
/**
* A controller that deals with the management of posts
*/
var PostsController = (function (_super) {
    __extends(PostsController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function PostsController(server, config, e) {
        _super.call(this, [new posts_model_1.PostsModel(), new categories_model_1.CategoriesModel()]);
        var router = express.Router();
        router.use(compression());
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/get-posts", [permission_controllers_1.getUser, this.getPosts.bind(this)]);
        router.get("/get-post/:slug", [permission_controllers_1.getUser, this.getPost.bind(this)]);
        router.get("/get-categories", this.getCategories.bind(this));
        router.delete("/remove-post/:id", [permission_controllers_1.isAdmin, permission_controllers_1.hasId, this.removePost.bind(this)]);
        router.delete("/remove-category/:id", [permission_controllers_1.isAdmin, permission_controllers_1.hasId, this.removeCategory.bind(this)]);
        router.put("/update-post/:id", [permission_controllers_1.isAdmin, permission_controllers_1.hasId, this.updatePost.bind(this)]);
        router.post("/create-post", [permission_controllers_1.isAdmin, this.createPost.bind(this)]);
        router.post("/create-category", [permission_controllers_1.isAdmin, this.createCategory.bind(this)]);
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
        else
            visibility = "all";
        var users = users_service_1.UsersService.getSingleton();
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
            return that.getSanitizedData(instances, Boolean(req.query.verbose));
        }).then(function (sanitizedData) {
            res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " posts",
                data: sanitizedData
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
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
        var findToken = { slug: req.params.slug };
        var user = req._user;
        posts.findInstances(findToken, [], 0, 1).then(function (instances) {
            if (instances.length == 0)
                return Promise.reject(new Error("Could not find post"));
            var users = users_service_1.UsersService.getSingleton();
            // Only admins are allowed to see private posts
            if (!instances[0].schema.getByName("public").getValue() && (!user || users.hasPermission(user, 2) == false))
                return Promise.reject(new Error("That post is marked private"));
            return that.getSanitizedData(instances, Boolean(req.query.verbose));
        }).then(function (sanitizedData) {
            res.end(JSON.stringify({
                error: false,
                message: "Found " + sanitizedData.length + " posts",
                data: sanitizedData[0]
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
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
        categories.findInstances({}, {}, parseInt(req.query.index), parseInt(req.query.limit)).then(function (instances) {
            return that.getSanitizedData(instances, Boolean(req.query.verbose));
        }).then(function (sanitizedData) {
            res.end(JSON.stringify({
                error: false,
                count: sanitizedData.length,
                message: "Found " + sanitizedData.length + " categories",
                data: sanitizedData
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
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
        // Attempt to delete the instances
        posts.deleteInstances({ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved) {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a post with that ID"));
            res.end(JSON.stringify({
                error: false,
                message: "Post has been successfully removed"
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
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
            winston.error(error.message, { process: process.pid });
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
            if (instance.error)
                return Promise.reject(new Error(instance.tokens[0].error));
            if (instance.tokens.length == 0)
                return Promise.reject(new Error("Could not find post with that id"));
            res.end(JSON.stringify({ error: false, message: "Post Updated" }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
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
            return instance.schema.getAsJson(false, instance._id);
        }).then(function (json) {
            res.end(JSON.stringify({
                error: false,
                message: "New post created",
                data: json
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
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
            return instance.schema.getAsJson(true, instance._id);
        }).then(function (json) {
            res.end(JSON.stringify({
                error: false,
                message: "New category created",
                data: json
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return PostsController;
}(controller_1.Controller));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PostsController;
