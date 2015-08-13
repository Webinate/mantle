var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mongodb = require("mongodb");
var express = require("express");
var bodyParser = require("body-parser");
var Controller_1 = require("./Controller");
var UsersService_1 = require("../UsersService");
var RendersModel_1 = require("../models/RendersModel");
/**
* Sets up a prerender server and saves the rendered html requests to mongodb.
* These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
*/
var PageRenderer = (function (_super) {
    __extends(PageRenderer, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function PageRenderer(server, config, e) {
        _super.call(this, [new RendersModel_1.RendersModel()]);
        // Sets up the prerenderer middleware 
        if (config.modepressRenderURL && config.modepressRenderURL.trim() != "")
            e.use(require('prerender-node').set('prerenderServiceUrl', config.modepressRenderURL));
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/get-renders", [this.authenticateAdmin.bind(this), this.getRenders.bind(this)]);
        router.get("/preview-render/:id", [this.previewRender.bind(this)]);
        router.delete("/remove-render/:id", [this.authenticateAdmin.bind(this), this.removeRender.bind(this)]);
        router.delete("/clear-renders", [this.authenticateAdmin.bind(this), this.clearRenders.bind(this)]);
        // Register the path
        e.use("/api/renders", router);
    }
    /**
    * Attempts to find a render by ID and then display it back to the user
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PageRenderer.prototype.previewRender = function (req, res, next) {
        res.setHeader('Content-Type', 'text/html');
        var renders = this.getModel("renders");
        renders.findInstances({ _id: new mongodb.ObjectID(req.params.id) }).then(function (instances) {
            if (instances.length == 0)
                return Promise.reject(new Error("Could not find a render with that ID"));
            var html = instances[0].schema.getByName("html").getValue(false);
            var matches = html.match(/<script(?:.*?)>(?:[\S\s]*?)<\/script>/gi);
            for (var i = 0; matches && i < matches.length; i++) {
                if (matches[i].indexOf('application/ld+json') === -1) {
                    html = html.replace(matches[i], '');
                }
            }
            res.end(html);
        }).catch(function (error) {
            res.writeHead(404);
        });
    };
    /**
   * Attempts to remove a render by ID
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {Function} next
   */
    PageRenderer.prototype.removeRender = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var renders = this.getModel("renders");
        renders.deleteInstances({ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved) {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a cache with that ID"));
            res.end(JSON.stringify({
                error: false,
                message: "Cache has been successfully removed"
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
    PageRenderer.prototype.authenticateAdmin = function (req, res, next) {
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
    * Returns an array of IPost items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PageRenderer.prototype.getRenders = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var renders = this.getModel("renders");
        var that = this;
        var count = 0;
        var findToken = {};
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
        var getContent = true;
        if (req.query.minimal)
            getContent = false;
        // Check for keywords
        if (req.query.search)
            findToken.url = new RegExp(req.query.search, "i");
        // First get the count
        renders.count(findToken).then(function (num) {
            count = num;
            return renders.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));
        }).then(function (instances) {
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " renders",
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
    * Removes all cache items from the db
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PageRenderer.prototype.clearRenders = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var renders = this.getModel("renders");
        // First get the count
        renders.deleteInstances({}).then(function (num) {
            res.end(JSON.stringify({
                error: false,
                message: num + " Instances have been removed"
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return PageRenderer;
})(Controller_1.Controller);
exports.default = PageRenderer;
