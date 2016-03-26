"use strict";
var express = require("express");
var app = express(); // create our app with express
var morgan = require("morgan"); // log requests to the console
var http = require("http");
var https = require("https");
var fs = require("fs");
var winston = require("winston");
var compression = require("compression");
var page_renderer_1 = require("./controllers/page-renderer");
var cors_controller_1 = require("./controllers/cors-controller");
var path_handler_1 = require("./path-handler");
var Server = (function () {
    function Server(server, config, db) {
        this._config = config;
        this._server = server;
        this._db = db;
    }
    Server.prototype.initialize = function (db) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var config = that._config;
            var server = that._server;
            var app = express();
            // Add the CORS controller
            new cors_controller_1.default(app, server);
            // Enable GZIPPING
            app.use(compression());
            // User defined static folders
            for (var i = 0, l = server.staticFilesFolder.length; i < l; i++) {
                winston.info("Adding static resource folder '" + server.staticFilesFolder[i] + "'", { process: process.pid });
                app.use(express.static(server.staticFilesFolder[i], { maxAge: server.cacheLifetime }));
            }
            // Setup the jade template engine
            app.set('view engine', 'jade');
            // log every request to the console
            app.use(morgan('dev'));
            // Create each of your controllers here
            var controllerPromises = [];
            var controllers = [];
            controllers.push(new page_renderer_1.default(server, config, app));
            // Load the controllers
            for (var i = 0, l = server.controllers.length; i < l; i++) {
                var func = require(server.controllers[i].path);
                controllers.push(new func.default(server, config, app));
            }
            // Maps the path specified to an HTML or template
            for (var i = 0, l = server.paths.length; i < l; i++)
                var handler = new path_handler_1.PathHandler(server.paths[i], server).route(app);
            winston.info("Attempting to start HTTP server...", { process: process.pid });
            // Start app with node server.js
            var httpServer = http.createServer(app);
            httpServer.listen(server.portHTTP);
            winston.info("Listening on HTTP port " + server.portHTTP, { process: process.pid });
            // If we use SSL then start listening for that as well
            if (server.ssl) {
                if (server.sslIntermediate != "" && !fs.existsSync(server.sslIntermediate)) {
                    winston.error("Could not find sslIntermediate: '" + server.sslIntermediate + "'", { process: process.pid });
                    process.exit();
                }
                if (server.sslCert != "" && !fs.existsSync(server.sslCert)) {
                    winston.error("Could not find sslIntermediate: '" + server.sslCert + "'", { process: process.pid });
                    process.exit();
                }
                if (server.sslRoot != "" && !fs.existsSync(server.sslRoot)) {
                    winston.error("Could not find sslIntermediate: '" + server.sslRoot + "'", { process: process.pid });
                    process.exit();
                }
                if (server.sslKey != "" && !fs.existsSync(server.sslKey)) {
                    winston.error("Could not find sslIntermediate: '" + server.sslKey + "'", { process: process.pid });
                    process.exit();
                }
                var caChain = [fs.readFileSync(server.sslIntermediate), fs.readFileSync(server.sslRoot)];
                var privkey = server.sslKey ? fs.readFileSync(server.sslKey) : null;
                var theCert = server.sslCert ? fs.readFileSync(server.sslCert) : null;
                var port = server.portHTTPS ? server.portHTTPS : 443;
                winston.info("Attempting to start SSL server...", { process: process.pid });
                var httpsServer = https.createServer({ key: privkey, cert: theCert, passphrase: server.sslPassPhrase, ca: caChain }, app);
                httpsServer.listen(port);
                winston.info("Listening on HTTPS port " + port, { process: process.pid });
            }
            // Initialize all the controllers
            for (var i = 0, l = controllers.length; i < l; i++)
                controllerPromises.push(controllers[i].initialize(db));
            // Return a promise once all the controllers are complete
            Promise.all(controllerPromises).then(function (e) {
                winston.info("All controllers are now setup successfully!", { process: process.pid });
                resolve(that);
            }).catch(function (e) {
                reject(new Error("ERROR: An error has occurred while setting up the controllers \"" + e.message + "\""));
            });
        });
    };
    return Server;
}());
exports.Server = Server;
