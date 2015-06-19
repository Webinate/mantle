var winston = require("winston");
/**
* Sets up a prerender server and saves the rendered html requests to mongodb.
* These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
*/
var PageRenderer = (function () {
    function PageRenderer(config) {
        this.createServer(config.rendererPort);
    }
    PageRenderer.prototype.beforePhantomRequest = function (req, res, next) {
        winston.info("Processing prerender GET requset", { process: process.pid });
        if (req.method !== 'GET')
            return next();
        //this._collection.findOne({ key: req.url }, function (err, item)
        //{
        //    var value = item ? item.value : null;
        //    if (!err && item)
        //        res.send(200, item);
        //    else
        //        next();
        //});
        next();
    };
    PageRenderer.prototype.afterPhantomRequest = function (req, res, next) {
        winston.info("Processing prerender render", { process: process.pid });
        //var object = { key: req.url, value: req.prerender.documentHTML, created: new Date() };
        //this._collection.update({ key: req.url }, object, { upsert: true }, function (err)
        //{
        //});
        next();
    };
    PageRenderer.prototype.createServer = function (port) {
        if (port === void 0) { port = 3000; }
        var prerender = require('../node_modules/prerender/lib');
        this._server = prerender({
            workers: process.env.PHANTOM_CLUSTER_NUM_WORKERS,
            iterations: process.env.PHANTOM_WORKER_ITERATIONS || 10,
            phantomBasePort: process.env.PHANTOM_CLUSTER_BASE_PORT || 12300,
            messageTimeout: process.env.PHANTOM_CLUSTER_MESSAGE_TIMEOUT
        });
        this._server.use(prerender.blacklist());
        this._server.use(prerender.removeScriptTags());
        this._server.use(prerender.httpHeaders());
        this._server.use(prerender.httpHeaders());
        this._server.use(this);
        // By default prerender uses bcrypt & weak - but we dont need this as its a bitch to setup
        // Below is a way of configuring it so that prerender forces phantom to not use weak
        this._server.options.phantomArguments = [];
        this._server.options.phantomArguments.push = function () {
            if (arguments[0] && arguments[0].port !== undefined) {
                arguments[0].dnodeOpts = { weak: false };
                arguments[0].port = port;
            }
            //Do what you want here...
            return Array.prototype.push.apply(this, arguments);
        };
        this._server.start();
    };
    return PageRenderer;
})();
exports.PageRenderer = PageRenderer;
