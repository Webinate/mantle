import {loadConfig, ServerConfig, IPath} from "./Config";
import * as express from "express";
import * as fs from "fs";

/**
* A simple wrapper that holds information on each path the server can respond to.
* If the server detects a template route is possible it uses that as a preference 
* to a static one.
*/
export class PathHandler
{
    private _path: IPath;
    private _config: ServerConfig;

    /**
    * Creates a new path handler
    * @param {IPath}
    * @param {ServerConfig}
    */
    constructor(path: IPath, cfg: ServerConfig)
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

        var requestIsSecure = (<any>req.connection).encrypted;
        var url = `${(requestIsSecure ? "https" : "http") }://${config.host}:${requestIsSecure ? config.portHTTPS : config.portHTTP }`;
        var usersURL = `${config.usersURL}`;

        // Give priority to template routes
        if (path.templatePath && path.templatePath != "" && fs.existsSync(`${path.templatePath}/${path.index}.jade`))
            res.render(`${path.templatePath}/${path.index}`, { usersURL: usersURL, url: url });
        else
            res.sendfile(path.index);
    };
}