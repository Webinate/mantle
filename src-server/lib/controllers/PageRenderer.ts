import * as mongodb from "mongodb";
import * as http from "http";
import {IServerConfig} from "../Config";
import * as winston from "winston";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller} from "./Controller";
import {UsersService} from "../UsersService"
import {RendersModel} from "../models/RendersModel";
import * as net from "net";

interface IPrerenderServer
{
    use(func: any);
    start();
    options: any;
}
interface IPrerenderResponse extends http.ServerResponse
{
    send(code: number, item: any);
}
interface IPrerenderRequest extends http.ServerRequest
{
    prerender: { documentHTML: string; };
}

/**
* Sets up a prerender server and saves the rendered html requests to mongodb.
* These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
*/
export class PageRenderer extends Controller
{
    private _server: IPrerenderServer;

    constructor(config: IServerConfig, e: express.Express )
    {
        super([new RendersModel()]);

        this.createServer(config.rendererPort);

        // Sets up the prerenderer middleware
        e.use(require('prerender-node').set('prerenderServiceUrl', `${(config.ssl ? "https" : "http")}://${config.host}:${config.rendererPort}/`));

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/get-renders", <any>[this.authenticateAdmin.bind(this), this.getRenders.bind(this)]);

        // Register the path
        e.use("/api/renders", router);
    }

    /**
    * This funciton checks the logged in user is an admin. If not an admin it returns an error, 
    * if true it passes the scope onto the next function in the queue
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private authenticateAdmin(req: express.Request, res: express.Response, next: Function)
    {
        var users = UsersService.getSingleton();

        users.authenticated(req, res).then(function (auth)
        {
            if (!auth.authenticated)
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(<modepress.IResponse>{
                    error: true,
                    message: "You must be logged in to make this request"
                }));
            }
            else if (!users.hasPermission(auth.user, 2))
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(<modepress.IResponse>{
                    error: true,
                    message: "You do not have permission"
                }));
            }
            else
            {
                req.params.user = auth.user;
                next();
            }

        }).catch(function (error: Error)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: "You do not have permission"
            }));
        });
    }

    /**
    * Returns an array of IPost items
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getRenders(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var renders = this.getModel("renders");
        var that = this;
        var count = 0;

        var findToken = { $or: [] };
        if (req.query.author)
            (<any>findToken).author = new RegExp(req.query.author, "i");
       

        // Set the default sort order to ascending
        var sortOrder = -1;
        if (req.query.sortOrder)
        {
            if ((<string>req.query.sortOrder).toLowerCase() == "asc")
                sortOrder = 1;
            else
                sortOrder = -1;
        }

        // Sort by the date created
        var sort: modepress.IPost = { createdOn: sortOrder };
        
        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;
        
        // Remove the or token if its empty
        if (findToken.$or.length == 0)
            delete findToken.$or;
        
        // First get the count
        renders.count(findToken).then(function(num)
        {
            count = num;
            return renders.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));

        }).then(function (instances)
        {
            var sanitizedData: Array<modepress.IRender> = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify(<modepress.IGetRenders>{
                error: false,
                count: count,
                message: `Found ${count} renders`,
                data: sanitizedData
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    beforePhantomRequest(req: IPrerenderRequest, res: IPrerenderResponse, next: Function)
    {
        winston.info(`Processing prerender GET requset: '${req.url}'`, { process: process.pid });

        if (req.method !== 'GET')
            return next();

        var renders = this.getModel("renders");
        renders.findInstances(<modepress.IRender>{ url: req.url }).then(function (instances)
        {
            if (instances.length > 0)
                res.send(200, instances[0].schema.getByName("html").getValue(false));
            else
                next();

        }).catch(function (error: Error)
        {
            next();
        });
    }

    afterPhantomRequest(req: IPrerenderRequest, res: IPrerenderResponse, next: Function)
    {
        winston.info("Processing prerender render", { process: process.pid });

        var renders = this.getModel("renders");
        var token: modepress.IRender = { url: req.url, html: req.prerender.documentHTML };

        renders.createInstance(token).then(function (instance)
        {
            next();

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    createServer(port: number = 3000)
    {
        winston.info(`Setting up renderer...`, { process: process.pid });
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

        winston.info(`Rerender set to port: ${port}`, { process: process.pid });

        // By default prerender uses bcrypt & weak - but we dont need this as its a bitch to setup
        // Below is a way of configuring it so that prerender forces phantom to not use weak       
        this._server.options.phantomArguments = [];
        this._server.options.phantomArguments.push = function ()
        {
            if (arguments[0] && arguments[0].port !== undefined)
                arguments[0].dnodeOpts = { weak: false };

            //Do what you want here...
            return Array.prototype.push.apply(this, arguments);
        }

        this._server.start();
    }
}