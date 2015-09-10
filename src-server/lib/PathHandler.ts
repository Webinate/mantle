import {IServer, IPath} from "modepress-api";
import * as express from "express";
import * as fs from "fs";
import {UsersService} from "./UsersService";

/**
* A simple wrapper that holds information on each path the server can respond to.
* If the server detects a template route is possible it uses that as a preference 
* to a static one.
*/
export class PathHandler
{
    private _path: IPath;
    private _config: IServer;

    /**
    * Creates a new path handler
    * @param {IPath}
    * @param {IServer}
    */
    constructor(path: IPath, cfg: IServer)
    {
        this._path = path;
        this._config = cfg;
    }

    /**
    * Function used to handle a request from express
    * @param {IPath}
    * @param {ServerConfig}
    */
    handle(req: express.Request, res: express.Response)
    {
        var config = this._config;
        var path = this._path;

        var requestIsSecure = ((<any>req.connection).encrypted || req.headers["x-forwarded-proto"] == "https" ? true : false);
        var url = `${(requestIsSecure ? "https" : "http") }://${config.host}`;
        var usersURL = `${UsersService.usersURL}`;
        var options: any = { usersURL: usersURL, url: url };
        
        if (path.plugins)
            options.plugins = ["/admin/plugins/app-engine/plugin.js"];//path.plugins;
        else
            options.plugins = [];

        // Give priority to template routes
        if (path.templatePath && path.templatePath != "" && fs.existsSync(`${path.templatePath}/${path.index}.jade`))
            res.render(`${path.templatePath}/${path.index}`, options);
        else
            res.sendfile(path.index);
    };
}