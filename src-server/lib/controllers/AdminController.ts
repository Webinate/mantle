import express = require("express");
import controllerModule = require("./Controller");
import bodyParser = require('body-parser');
import {UsersService} from "../UsersService";
import {IConfig, IServer} from "modepress-api";
import * as winston from "winston";

export default class AdminController extends controllerModule.Controller
{
	/**
	* Creates a new instance of the email controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super(null);// Send the jade index file

        var split = __dirname.split(/\\|\//);
        split = split.splice(0, split.length - 2);
        var rootDir = split.join("/");

        // Add the static resources of the admin application
        winston.info(`Adding resource folder ${rootDir}/resources`, { process: process.pid });
        e.use(express.static(`${rootDir}/resources`, { maxAge: config.cacheLifetime }));
        
        e.get(`(${config.adminURL}|${config.adminURL}/*)`, function (req, res)
        {
            var requestIsSecure = ((<any>req.connection).encrypted || req.headers["x-forwarded-proto"] == "https" ? true : false);
        
            // Get the base URL's
            var url = `${(requestIsSecure ? "https" : "http") }://${server.host}`;
            var usersURL = `${config.usersURL}`;
            var options: any = { usersURL: usersURL, url: url };

            if (config.adminPlugins)
                options.plugins = config.adminPlugins;
            else
                options.plugins = [];

            winston.info(`Got request ${req.originalUrl} - sending admin: ./views/index.jade`, { process: process.pid });
            res.render('index', options);
        });
    }
}