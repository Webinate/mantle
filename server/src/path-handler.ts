import {IServer, IPath} from "modepress-api";
import * as express from "express";
import * as fs from "fs";
import {UsersService} from "./users-service";

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
     * Creates a new endpoint route based on the path
     * @param {express.Express} app The express instance for this application
     */
    route(app: express.Express )
    {
        app.get(this._path.path, this.handle.bind(this));
    }

    /**
    * Function used to handle a request from express
    */
    handle(req: express.Request, res: express.Response)
    {
        var config = this._config;
        var path = this._path;

        var requestIsSecure = ((<any>req.connection).encrypted || req.headers["x-forwarded-proto"] == "https" ? true : false);
        var url = `${(requestIsSecure ? "https" : "http") }://${config.host}`;
        var options: any = {
            usersURL: `${UsersService.usersURL}`,
            mediaURL: `${UsersService.mediaURL}`,
            url: url };

        options.plugins = path.plugins || [];
        options.variables = {};

        // Add any custom variables
        if (path.variables)
        {
            for ( var i in path.variables )
                 options.variables[i] = path.variables[i];
        }

        // Give priority to template routes
        if ( fs.existsSync(path.index) )
        {
             if ( fs.existsSync(path.index) && path.index.indexOf(".jade") != -1 )
                res.render(path.index, options);
            else
                res.sendfile(path.index);
        }
        else
            res.send(404, "File not found");
    };
}