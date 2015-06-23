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

/**
* Sets up a prerender server and saves the rendered html requests to mongodb.
* These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
*/
export class PageRenderer extends Controller
{
    constructor(config: IServerConfig, e: express.Express )
    {
        super([new RendersModel()]);
        
        // Sets up the prerenderer middleware 
        if (config.modepressRenderURL && config.modepressRenderURL.trim() != "")
            e.use(require('prerender-node').set('prerenderServiceUrl', config.modepressRenderURL));

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/get-renders", <any>[this.authenticateAdmin.bind(this), this.getRenders.bind(this)]);
        router.delete("/remove-render/:id", <any>[this.authenticateAdmin.bind(this), this.removeRender.bind(this)]);
        router.delete("/clear-renders", <any>[this.authenticateAdmin.bind(this), this.clearRenders.bind(this)]);

        // Register the path
        e.use("/api/renders", router);
    }

    /**
   * Attempts to remove a render by ID
   * @param {express.Request} req 
   * @param {express.Response} res
   * @param {Function} next 
   */
    private removeRender(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var renders = this.getModel("renders");

        renders.deleteInstances(<modepress.IPost>{ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved)
        {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a cache with that ID"));

            res.end(JSON.stringify(<modepress.IResponse>{
                error: false,
                message: "Cache has been successfully removed"
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
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

        var findToken = {};       

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
        var sort: modepress.IRender = { createdOn: sortOrder };
        
        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;

        // Check for keywords
        if (req.query.search)
            (<modepress.IRender>findToken).url = <any>new RegExp(req.query.search, "i");

        
        
        // First get the count
        renders.count(findToken).then(function(num)
        {
            count = num;
            return renders.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));

        }).then(function (instances)
        {
            var sanitizedData: Array<modepress.IRender> = that.getSanitizedData<modepress.IRender>(instances, Boolean(req.query.verbose));
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

    /**
    * Removes all cache items from the db
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private clearRenders(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var renders = this.getModel("renders");
       
        // First get the count
        renders.deleteInstances({}).then(function(num)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: false,
                message: `${num} Instances have been removed`
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    //beforePhantomRequest(req: IPrerenderRequest, res: IPrerenderResponse, next: Function)
    //{
    //    winston.info(`Processing prerender GET requset: '${req.url}'`, { process: process.pid });

    //    if (req.method !== 'GET')
    //        return next();

    //    var renders = this.getModel("renders");
    //    renders.findInstances(<modepress.IRender>{ url: req.url }).then(function (instances)
    //    {
    //        if (instances.length > 0)
    //            res.send(200, instances[0].schema.getByName("html").getValue(false));
    //        else
    //            next();

    //    }).catch(function (error: Error)
    //    {
    //        next();
    //    });
    //}

    //afterPhantomRequest(req: IPrerenderRequest, res: IPrerenderResponse, next: Function)
    //{
    //    winston.info("Processing prerender render", { process: process.pid });

    //    var renders = this.getModel("renders");
    //    var token: modepress.IRender = { url: req.url, html: req.prerender.documentHTML };

    //    renders.createInstance(token).then(function (instance)
    //    {
    //        next();

    //    }).catch(function (error: Error)
    //    {
    //        res.end(JSON.stringify(<modepress.IResponse>{
    //            error: true,
    //            message: error.message
    //        }));
    //    });
    //}
}