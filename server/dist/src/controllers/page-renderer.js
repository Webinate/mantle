"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mongodb = require("mongodb");
const winston = require("winston");
const express = require("express");
const bodyParser = require("body-parser");
const controller_1 = require("./controller");
const users_service_1 = require("../users-service");
const renders_model_1 = require("../models/renders-model");
const model_1 = require("../models/model");
const url = require("url");
const jsdom = require("jsdom");
const serializers_1 = require("../serializers");
/**
* Sets up a prerender server and saves the rendered html requests to mongodb.
* These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
*/
class PageRenderer extends controller_1.Controller {
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    constructor(server, config, e) {
        super([model_1.Model.registerModel(renders_model_1.RendersModel)]);
        if (!config.enableAjaxRendering)
            return;
        this.renderQueryFlag = "__render__request";
        e.use(this.processBotRequest.bind(this));
        this.expiration = config.ajaxRenderExpiration * 1000;
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
    * Strips the html page of any script tags
    * @param {string} html
    */
    stripScripts(html) {
        var matches = html.match(/<script(?:.*?)>(?:[\S\s]*?)<\/script>/gi);
        for (var i = 0; matches && i < matches.length; i++)
            if (matches[i].indexOf('application/ld+json') === -1)
                html = html.replace(matches[i], '');
        return html;
    }
    /**
    * Gets the URL of a request
    * @param {express.Request} req
    */
    getUrl(req) {
        var protocol = req.protocol;
        if (req.get('CF-Visitor')) {
            var match = req.get('CF-Visitor').match(/"scheme":"(http|https)"/);
            if (match)
                protocol = match[1];
        }
        if (req.get('X-Forwarded-Proto')) {
            protocol = req.get('X-Forwarded-Proto').split(',')[0];
        }
        var addQueryMark = false;
        if (!req.query || Object.keys(req.query).length === 0)
            addQueryMark = true;
        return protocol + "://" + req.get('host') + req.url + (addQueryMark ? `?${this.renderQueryFlag}=true` : `&${this.renderQueryFlag}=true`);
    }
    /**
   * Fetches a page and strips it of all its script tags
   * @param {string} url
   * @param {Promise<string>}
   */
    renderPage(url) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var timer = null;
            var win;
            var maxTries = 50;
            var curTries = 0;
            var checkComplete = function () {
                if (!win) {
                    // Cleanup
                    clearTimeout(timer);
                    win.close();
                    win = null;
                    checkComplete = null;
                    return reject(new Error("Page does not exist"));
                }
                curTries++;
                if (win.prerenderReady === undefined || win.prerenderReady || curTries > maxTries) {
                    var html = that.stripScripts(win.document.documentElement.outerHTML);
                    // Cleanup
                    clearTimeout(timer);
                    win.close();
                    win = null;
                    checkComplete = null;
                    return resolve(html);
                }
                timer = setTimeout(checkComplete, 300);
            };
            jsdom.env({
                url: url,
                features: {
                    FetchExternalResources: ['script'],
                    ProcessExternalResources: ['script'],
                    SkipExternalResources: false
                },
                done: function (errors, window) {
                    if (errors && errors.length > 0)
                        return reject(errors[0]);
                    win = window;
                    checkComplete();
                }
            });
        });
    }
    /**
    * Determines if the request comes from a bot. If so, a prerendered page is sent back which excludes any script tags
    * @param req
    * @param response
    * @param next
    */
    processBotRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.query.__render__request)
                return next();
            // Its not a bot request - do nothing
            if (!this.shouldShowPrerenderedPage(req))
                return next();
            var model = this.getModel("renders");
            var url = this.getUrl(req);
            var that = this;
            var instance = null;
            var expiration = 0;
            try {
                instance = yield model.findOne({ url: url });
                var html = "";
                if (instance) {
                    expiration = instance.dbEntry.expiration;
                    var html = instance.dbEntry.html;
                    if (Date.now() > expiration)
                        html = yield that.renderPage(url);
                    else if (!html || html.trim() == "")
                        html = yield that.renderPage(url);
                }
                else
                    html = yield that.renderPage(url);
                if (!instance) {
                    winston.info(`Saving render '${url}'`, { process: process.pid });
                    yield model.createInstance({ expiration: Date.now() + that.expiration, html: html, url: url });
                }
                else if (Date.now() > expiration) {
                    winston.info(`Updating render '${url}'`, { process: process.pid });
                    yield model.update({ _id: instance.dbEntry._id }, { expiration: Date.now() + that.expiration, html: html });
                }
                winston.info("Sending back render without script tags", { process: process.pid });
                res.status(200);
                return res.send(html);
            }
            catch (err) {
                res.status(404);
                return res.send("Page does not exist");
            }
            ;
        });
    }
    ;
    /**
    * Determines if the request comes from a bot
    * @param {express.Request} req
    * @returns {boolean}
    */
    shouldShowPrerenderedPage(req) {
        var userAgent = req.headers['user-agent'], bufferAgent = req.headers['x-bufferbot'], isRequestingPrerenderedPage = false;
        if (!userAgent)
            return false;
        if (req.method != 'GET' && req.method != 'HEAD')
            return false;
        //if it contains _escaped_fragment_, show prerendered page
        var parsedQuery = url.parse(req.url, true).query;
        if (parsedQuery && parsedQuery['_escaped_fragment_'] !== undefined)
            isRequestingPrerenderedPage = true;
        //if it is a bot...show prerendered page
        if (PageRenderer.crawlerUserAgents.some(function (crawlerUserAgent) { return userAgent.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1; }))
            isRequestingPrerenderedPage = true;
        //if it is BufferBot...show prerendered page
        if (bufferAgent)
            isRequestingPrerenderedPage = true;
        //if it is a bot and is requesting a resource...dont prerender
        if (PageRenderer.extensionsToIgnore.some(function (extension) { return req.url.indexOf(extension) !== -1; }))
            return false;
        return isRequestingPrerenderedPage;
    }
    /**
    * Attempts to find a render by ID and then display it back to the user
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    previewRender(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            res.setHeader('Content-Type', 'text/html');
            var renders = this.getModel("renders");
            try {
                var instances = yield renders.findInstances({ _id: new mongodb.ObjectID(req.params.id) });
                if (instances.length == 0)
                    throw new Error("Could not find a render with that ID");
                var html = yield instances[0].schema.getByName("html").getValue();
                var matches = html.match(/<script(?:.*?)>(?:[\S\s]*?)<\/script>/gi);
                for (var i = 0; matches && i < matches.length; i++)
                    if (matches[i].indexOf('application/ld+json') === -1) {
                        html = html.replace(matches[i], '');
                    }
                res.end(html);
            }
            catch (error) {
                winston.error(error.message, { process: process.pid });
                res.writeHead(404);
            }
            ;
        });
    }
    /**
   * Attempts to remove a render by ID
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {Function} next
   */
    removeRender(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var renders = this.getModel("renders");
            try {
                var numRemoved = yield renders.deleteInstances({ _id: new mongodb.ObjectID(req.params.id) });
                if (numRemoved == 0)
                    throw new Error("Could not find a cache with that ID");
                serializers_1.okJson({
                    error: false,
                    message: "Cache has been successfully removed"
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
    /**
    * This funciton checks the logged in user is an admin. If not an admin it returns an error,
    * if true it passes the scope onto the next function in the queue
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    authenticateAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var users = users_service_1.UsersService.getSingleton();
            try {
                var auth = yield users.authenticated(req);
                if (!auth.authenticated) {
                    serializers_1.okJson({
                        error: true,
                        message: "You must be logged in to make this request"
                    }, res);
                }
                else if (!users.hasPermission(auth.user, 2)) {
                    serializers_1.errJson(new Error("You do not have permission"), res);
                }
                else {
                    req.params.user = auth.user;
                    next();
                }
            }
            catch (error) {
                serializers_1.errJson(new Error("You do not have permission"), res);
            }
            ;
        });
    }
    /**
    * Returns an array of IPost items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    getRenders(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
            try {
                // First get the count
                count = yield renders.count(findToken);
                var instances = yield renders.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));
                var jsons = [];
                for (var i = 0, l = instances.length; i < l; i++)
                    jsons.push(instances[i].schema.getAsJson(instances[i]._id, { verbose: Boolean(req.query.verbose) }));
                var sanitizedData = yield Promise.all(jsons);
                serializers_1.okJson({
                    error: false,
                    count: count,
                    message: `Found ${count} renders`,
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
    * Removes all cache items from the db
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    clearRenders(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var renders = this.getModel("renders");
            try {
                // First get the count
                var num = yield renders.deleteInstances({});
                serializers_1.okJson({
                    error: false,
                    message: `${num} Instances have been removed`
                }, res);
            }
            catch (err) {
                serializers_1.errJson(err, res);
            }
            ;
        });
    }
}
// googlebot, yahoo, and bingbot are not in this list because
// we support _escaped_fragment_ and want to ensure people aren't
// penalized for cloaking.
PageRenderer.crawlerUserAgents = [
    // 'googlebot',
    // 'yahoo',
    // 'bingbot',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator'
];
PageRenderer.extensionsToIgnore = [
    '.js',
    '.css',
    '.xml',
    '.less',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.pdf',
    '.doc',
    '.txt',
    '.ico',
    '.rss',
    '.zip',
    '.mp3',
    '.rar',
    '.exe',
    '.wmv',
    '.doc',
    '.avi',
    '.ppt',
    '.mpg',
    '.mpeg',
    '.tif',
    '.wav',
    '.mov',
    '.psd',
    '.ai',
    '.xls',
    '.mp4',
    '.m4a',
    '.swf',
    '.dat',
    '.dmg',
    '.iso',
    '.flv',
    '.m4v',
    '.torrent'
];
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageRenderer;
