"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const express = require("express");
const compression = require("compression");
const controller_1 = require("./controller");
const model_1 = require("../models/model");
const posts_model_1 = require("../models/posts-model");
const categories_model_1 = require("../models/categories-model");
const users_service_1 = require("../users-service");
const permission_controllers_1 = require("../permission-controllers");
const serializers_1 = require("../serializers");
/**
* A controller that deals with the management of posts
*/
class PostsController extends controller_1.Controller {
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    constructor(server, config, e) {
        super([model_1.Model.registerModel(posts_model_1.PostsModel), model_1.Model.registerModel(categories_model_1.CategoriesModel)]);
        var router = express.Router();
        router.use(compression());
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/posts", [permission_controllers_1.getUser, this.getPosts.bind(this)]);
        router.get("/posts/slug/:slug", [permission_controllers_1.getUser, this.getPost.bind(this)]);
        router.get("/posts/:id", [permission_controllers_1.getUser, permission_controllers_1.hasId("id", "ID"), this.getPost.bind(this)]);
        router.delete("/posts/:id", [permission_controllers_1.isAdmin, permission_controllers_1.hasId("id", "ID"), this.removePost.bind(this)]);
        router.put("/posts/:id", [permission_controllers_1.isAdmin, permission_controllers_1.hasId("id", "ID"), this.updatePost.bind(this)]);
        router.post("/posts", [permission_controllers_1.isAdmin, this.createPost.bind(this)]);
        router.get("/categories", this.getCategories.bind(this));
        router.post("/categories", [permission_controllers_1.isAdmin, this.createCategory.bind(this)]);
        router.delete("/categories/:id", [permission_controllers_1.isAdmin, permission_controllers_1.hasId("id", "ID"), this.removeCategory.bind(this)]);
        // Register the path
        e.use("/api", router);
    }
    /**
    * Returns an array of IPost items
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    getPosts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
            try {
                // First get the count
                count = yield posts.count(findToken);
                var instances = yield posts.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { content: 0 } : undefined));
                var jsons = [];
                for (var i = 0, l = instances.length; i < l; i++)
                    jsons.push(instances[i].schema.getAsJson(instances[i]._id, { verbose: Boolean(req.query.verbose) }));
                var sanitizedData = yield Promise.all(jsons);
                serializers_1.okJson({
                    error: false,
                    count: count,
                    message: `Found ${count} posts`,
                    data: sanitizedData
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
    * Returns a single post
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    getPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var posts = this.getModel("posts");
            var that = this;
            var findToken;
            var user = req._user;
            try {
                if (req.params.id)
                    findToken = { _id: new mongodb.ObjectID(req.params.id) };
                else
                    findToken = { slug: req.params.slug };
                var instances = yield posts.findInstances(findToken, [], 0, 1);
                if (instances.length == 0)
                    throw new Error("Could not find post");
                var users = users_service_1.UsersService.getSingleton();
                var isPublic = yield instances[0].schema.getByName("public").getValue();
                // Only admins are allowed to see private posts
                if (!isPublic && (!user || users.hasPermission(user, 2) == false))
                    throw new Error("That post is marked private");
                var jsons = [];
                for (var i = 0, l = instances.length; i < l; i++)
                    jsons.push(instances[i].schema.getAsJson(instances[i]._id, { verbose: Boolean(req.query.verbose) }));
                var sanitizedData = yield Promise.all(jsons);
                serializers_1.okJson({
                    error: false,
                    message: `Found ${sanitizedData.length} posts`,
                    data: sanitizedData[0]
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
    * Returns an array of ICategory items
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    getCategories(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var categories = this.getModel("categories");
            var that = this;
            try {
                var instances = yield categories.findInstances({}, {}, parseInt(req.query.index), parseInt(req.query.limit));
                var jsons = [];
                for (var i = 0, l = instances.length; i < l; i++)
                    jsons.push(instances[i].schema.getAsJson(instances[i]._id, { verbose: Boolean(req.query.verbose) }));
                var sanitizedData = yield Promise.all(jsons);
                serializers_1.okJson({
                    error: false,
                    count: sanitizedData.length,
                    message: `Found ${sanitizedData.length} categories`,
                    data: sanitizedData
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
    * Attempts to remove a post by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    removePost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var posts = this.getModel("posts");
            try {
                // Attempt to delete the instances
                var numRemoved = yield posts.deleteInstances({ _id: new mongodb.ObjectID(req.params.id) });
                if (numRemoved == 0)
                    throw new Error("Could not find a post with that ID");
                serializers_1.okJson({
                    error: false,
                    message: "Post has been successfully removed"
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
    * Attempts to remove a category by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    removeCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var categories = this.getModel("categories");
            try {
                var numRemoved = yield categories.deleteInstances({ _id: new mongodb.ObjectID(req.params.id) });
                if (numRemoved == 0)
                    return Promise.reject(new Error("Could not find a category with that ID"));
                serializers_1.okJson({
                    error: false,
                    message: "Category has been successfully removed"
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
    * Attempts to update a post by ID
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    updatePost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = req.body;
            var posts = this.getModel("posts");
            try {
                var instance = yield posts.update({ _id: new mongodb.ObjectID(req.params.id) }, token);
                if (instance.error)
                    throw new Error(instance.tokens[0].error);
                if (instance.tokens.length == 0)
                    throw new Error("Could not find post with that id");
                serializers_1.okJson({
                    error: false,
                    message: "Post Updated"
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
    * Attempts to create a new post. The
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    createPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = req.body;
            var posts = this.getModel("posts");
            // User is passed from the authentication function
            token.author = req._user.username;
            try {
                var instance = yield posts.createInstance(token);
                var json = yield instance.schema.getAsJson(instance._id, { verbose: true });
                serializers_1.okJson({
                    error: false,
                    message: "New post created",
                    data: json
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
   * Attempts to create a new category item.
   * @param {mp.IAuthReq} req
   * @param {express.Response} res
   * @param {Function} next
   */
    createCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = req.body;
            var categories = this.getModel("categories");
            try {
                var instance = yield categories.createInstance(token);
                var json = yield instance.schema.getAsJson(instance._id, { verbose: true });
                serializers_1.okJson({
                    error: false,
                    message: "New category created"
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PostsController;
