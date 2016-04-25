import * as bodyParser from "body-parser";
import * as mongodb from "mongodb";
import * as entities from "entities";
import * as express from "express";
import * as compression from "compression";
import {Controller} from "./controller";
import {CommentsModel} from "../models/comments-model";
import {UsersService} from "../users-service";
import {getUser, isAdmin, hasId} from "../permission-controllers";
import * as mp from "modepress-api";
import * as winston from "winston";

/**
* A controller that deals with the management of comments
*/
export default class CommentsController extends Controller
{
	/**
	* Creates a new instance of the controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
	*/
    constructor(server: mp.IServer, config: mp.IConfig, e: express.Express)
    {
        super([new CommentsModel()]);

        var router = express.Router();

        router.use(compression());
		router.use(bodyParser.urlencoded({ 'extended': true }));
		router.use(bodyParser.json());
		router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/get-comments", <any>[getUser, this.getComments.bind(this)]);
        router.get("/get-comment/:id", <any>[getUser, this.getComment.bind(this)]);
        router.delete("/remove-comment/:id", <any>[isAdmin, hasId, this.remove.bind(this)]);
        router.put("/update-comment/:id", <any>[isAdmin, hasId, this.update.bind(this)]);
        router.post("/create-comment", <any>[isAdmin, this.create.bind(this)]);
        router.post("/create-category", <any>[isAdmin, this.create.bind(this)]);

		// Register the path
		e.use( "/api/comments", router );
    }

    /**
    * Returns an array of IComment items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private getComments(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var comments = this.getModel("comments");
        var that = this;
        var count = 0;
        var visibility = "public";
        var user: UsersInterface.IUserEntry = (<mp.IAuthReq><Express.Request>req)._user;

        var findToken = { $or : [] };
        if (req.query.author)
            (<mp.IComment>findToken).author = <any>new RegExp(req.query.author, "i");

        // Check for keywords
        if (req.query.keyword)
            findToken.$or.push(<mp.IComment>{ content: <any> new RegExp(req.query.keyword, "i") });

        // Check for visibility
        if (req.query.visibility)
        {
            if ((<string>req.query.visibility).toLowerCase() == "all")
                visibility = "all";
            else if ((<string>req.query.visibility).toLowerCase() == "private")
                 visibility = "private";
        }
        else
            visibility = "all";

        var users = UsersService.getSingleton();

        // Only admins are allowed to see private comments
        if ( !user || ( ( visibility == "all" || visibility == "private" ) && users.hasPermission(user, 2) == false ) )
            visibility = "public";

        // Add the or conditions for visibility
        if (visibility != "all")
        {
            if (visibility == "public")
                (<mp.IComment>findToken).public = true;
            else
                (<mp.IComment>findToken).public = false;
        }

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
        var sort: mp.IComment = { createdOn: sortOrder };

        // Optionally sort by the last updated
        if (req.query.sort)
        {
            if (req.query.sort == "updated")
                sort = { lastUpdated: sortOrder };
        }

        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;

        // Stephen is lovely
        if (findToken.$or.length == 0)
            delete findToken.$or;

        // First get the count
        comments.count(findToken).then(function (num)
        {
            count = num;
            return comments.findInstances<mp.IComment>(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { content: 0 } : undefined));

        }).then(function (instances)
       {
           return that.getSanitizedData(instances, Boolean(req.query.verbose));

        }).then(function(sanitizedData){

            res.end(JSON.stringify(<mp.IGetComments>{
                error: false,
                count: count,
                message: `Found ${count} comments`,
                data: sanitizedData
            }));
        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Returns a single comment
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private getComment(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var comments = this.getModel("comments");
        var that = this;
        var findToken: mp.IComment = { _id : new mongodb.ObjectID(req.params.id) };
        var user: UsersInterface.IUserEntry = (<mp.IAuthReq><Express.Request>req)._user;

        comments.findInstances<mp.IComment>(findToken, [], 0, 1).then(function (instances)
        {
            if (instances.length == 0)
                return Promise.reject(new Error("Could not find comment"));

            var users = UsersService.getSingleton();

            // Only admins are allowed to see private comments
            if (!instances[0].schema.getByName("public").getValue() && ( !user || users.hasPermission(user, 2) == false ) )
                return Promise.reject( new Error("That comment is marked private") );

            return that.getSanitizedData<mp.IComment>(instances, Boolean(req.query.verbose));

        }).then(function( sanitizedData ){

           res.end(JSON.stringify(<mp.IGetComment>{
                error: false,
                message: `Found ${sanitizedData.length} comments`,
                data: sanitizedData[0]
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to remove a comment by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private remove(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var comments = this.getModel("comments");

        // Attempt to delete the instances
        comments.deleteInstances(<mp.IComment>{ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved)
        {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a comment with that ID"));

            res.end(JSON.stringify(<mp.IResponse>{
                error: false,
                message: "Comment has been successfully removed"
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to update a comment by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private update(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: mp.IComment = req.body;
        var comments = this.getModel("comments");

        comments.update(<mp.IComment>{ _id: new mongodb.ObjectID(req.params.id) }, token).then(function (instance)
        {
            if (instance.error)
                return Promise.reject(new Error(<string>instance.tokens[0].error));

            if ( instance.tokens.length == 0 )
                return Promise.reject(new Error("Could not find comment with that id"));

            res.end(JSON.stringify(<mp.IResponse>{ error: false, message: "Comment Updated" }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Attempts to create a new comment.
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private create(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: mp.IComment = req.body;
        var comments = this.getModel("comments");

        // User is passed from the authentication function
        token.author = (<mp.IAuthReq><Express.Request>req)._user.username;

        comments.createInstance(token).then(function (instance)
        {
            return instance.schema.getAsJson(false, instance._id);

        }).then(function( json ){

            res.end(JSON.stringify(<mp.IGetComment>{
                error: false,
                message: "New comment created",
                data: json
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}