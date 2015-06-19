var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var winston = require("winston");
var express = require("express");
var bodyParser = require("body-parser");
var Controller_1 = require("./Controller");
var UsersService_1 = require("../UsersService");
var RendersModel_1 = require("../models/RendersModel");
var net = require("net");
/**
* Sets up a prerender server and saves the rendered html requests to mongodb.
* These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
*/
var PageRenderer = (function (_super) {
    __extends(PageRenderer, _super);
    function PageRenderer(config, e) {
        _super.call(this, [new RendersModel_1.RendersModel()]);
        this.createServer(config.rendererPort);
        // Sets up the prerenderer middleware
        e.use(require('prerender-node').set('prerenderServiceUrl', (config.ssl ? "https" : "http") + "://" + config.host + ":" + config.rendererPort + "/"));
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/get-renders", [this.authenticateAdmin.bind(this), this.getRenders.bind(this)]);
        // Register the path
        e.use("/api/renders", router);
    }
    /**
    * Checks to see if a port is in use
    * @returns {Promise<boolean>}
    */
    PageRenderer.prototype.isPortTaken = function (port) {
        return new Promise(function (resolve, reject) {
            var tester = net.createServer();
            tester.once('error', function (err) {
                resolve(true);
            });
            tester.once('listening', function () {
                tester.once('close', function () {
                    resolve(false);
                    tester.close();
                });
            });
            tester.listen(port);
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
        var findToken = { $or: [] };
        if (req.query.author)
            findToken.author = new RegExp(req.query.author, "i");
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
        // Remove the or token if its empty
        if (findToken.$or.length == 0)
            delete findToken.$or;
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
    PageRenderer.prototype.beforePhantomRequest = function (req, res, next) {
        winston.info("Processing prerender GET requset: '" + req.url + "'", { process: process.pid });
        if (req.method !== 'GET')
            return next();
        var renders = this.getModel("renders");
        renders.findInstances({ url: req.url }).then(function (instances) {
            if (instances.length > 0)
                res.send(200, instances[0].schema.getByName("html").getValue(false));
            else
                next();
        }).catch(function (error) {
            next();
        });
        //this._collection.findOne({ key: req.url }, function (err, item)
        //{
        //    var value = item ? item.value : null;
        //    if (!err && item)
        //        res.send(200, item);
        //    else
        //        next();
        //});
    };
    PageRenderer.prototype.afterPhantomRequest = function (req, res, next) {
        winston.info("Processing prerender render", { process: process.pid });
        var renders = this.getModel("renders");
        var token = { url: req.url, html: req.prerender.documentHTML };
        renders.createInstance(token).then(function (instance) {
            next();
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    PageRenderer.prototype.createServer = function (port) {
        if (port === void 0) { port = 3000; }
        this.isPortTaken(port).then(function (portTaken) {
            if (portTaken) {
                winston.warn("Renderer port '" + port + "' already in use - presuming that the render server is already setup...", { process: process.pid });
                return;
            }
            var prerender = require('../../node_modules/prerender/lib');
            this._server = prerender({
                workers: process.env.PHANTOM_CLUSTER_NUM_WORKERS,
                iterations: process.env.PHANTOM_WORKER_ITERATIONS || 10,
                phantomBasePort: process.env.PHANTOM_CLUSTER_BASE_PORT || 12300,
                messageTimeout: process.env.PHANTOM_CLUSTER_MESSAGE_TIMEOUT,
                port: port
            });
            this._server.use(prerender.blacklist());
            this._server.use(prerender.removeScriptTags());
            this._server.use(prerender.httpHeaders());
            this._server.use(prerender.httpHeaders());
            this._server.use(this);
            winston.info("Prerender set to port: " + port, { process: process.pid });
            // By default prerender uses bcrypt & weak - but we dont need this as its a bitch to setup
            // Below is a way of configuring it so that prerender forces phantom to not use weak       
            this._server.options.phantomArguments = [];
            this._server.options.phantomArguments.push = function () {
                if (arguments[0] && arguments[0].port !== undefined)
                    arguments[0].dnodeOpts = { weak: false };
                //Do what you want here...
                return Array.prototype.push.apply(this, arguments);
            };
            this._server.start();
        });
    };
    return PageRenderer;
})(Controller_1.Controller);
exports.PageRenderer = PageRenderer;
