"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var express = require("express");
var controllerModule = require("./controller");
var winston = require("winston");
var AdminController = (function (_super) {
    __extends(AdminController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function AdminController(server, config, e) {
        _super.call(this, null); // Send the jade index file
        var split = __dirname.split(/\\|\//);
        split = split.splice(0, split.length - 2);
        var rootDir = split.join("/");
        // Add the static resources of the admin application
        winston.info("Adding resource folder " + rootDir + "/resources", { process: process.pid });
        e.use(express.static(rootDir + "/resources", { maxAge: config.cacheLifetime }));
        e.get("(" + config.adminURL + "|" + config.adminURL + "/*)", function (req, res) {
            var requestIsSecure = (req.connection.encrypted || req.headers["x-forwarded-proto"] == "https" ? true : false);
            // Get the base URL's
            var url = (requestIsSecure ? "https" : "http") + "://" + server.host;
            var usersURL = "" + config.usersURL;
            var options = { usersURL: usersURL, url: url };
            options.plugins = config.adminPlugins || [];
            if (config.adminPluginVariables) {
                var scriptOptions = "";
                for (var i in config.adminPluginVariables)
                    scriptOptions += i + " = '" + config.adminPluginVariables[i] + "';";
                options.scriptOptions = scriptOptions;
            }
            winston.info("Got request " + req.originalUrl + " - sending admin: ./views/index.jade", { process: process.pid });
            res.render('index', options);
        });
    }
    return AdminController;
}(controllerModule.Controller));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminController;
