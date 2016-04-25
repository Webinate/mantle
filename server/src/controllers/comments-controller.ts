import * as bodyParser from "body-parser";
import * as mongodb from "mongodb";
import * as entities from "entities";
import * as express from "express";
import * as compression from "compression";
import {Controller} from "./controller";
import {CommentsModel} from "../models/comments-model";
import {UsersService} from "../users-service";
import {getUser, isAdmin, canEdit, hasId} from "../permission-controllers";
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

        router.get("/comments", <any>[isAdmin, this.getComments.bind(this)]);
        router.get("/users/:user/comments/:id", <any>[hasId, this.getComment.bind(this)]);
        router.delete("/users/:user/comments/:id", <any>[canEdit, hasId, this.remove.bind(this)]);
        router.put("/users/:user/comments/:id", <any>[canEdit, hasId, this.update.bind(this)]);
        router.post("/comments/:target", <any>[canEdit, this.verifyTarget, this.create.bind(this)]);

		// Register the path
		e.use( "/api", router );
    }

    /**
    * Returns an array of IComment items
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private getComments(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var comments = this.getModel("comments");
        var that = this;
        var count = 0;
        var visibility = "public";
        var user = req._user;

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

        // Stephen is lovely
        if (findToken.$or.length == 0)
            delete findToken.$or;

        // First get the count
        comments.count(findToken).then(function (num)
        {
            count = num;
            return comments.findInstances<mp.IComment>(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit));

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
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private getComment(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var comments = this.getModel("comments");
        var that = this;
        var findToken: mp.IComment = { _id : new mongodb.ObjectID(req.params.id) };
        var user = req._user;

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
    * Checks the request for a target ID. This will throw an error if none is found, or its invalid
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private verifyTarget(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        // Make sure the target id
        if (!req.params.target)
        {
            res.setHeader( 'Content-Type', 'application/json');
            return res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: "Please specify a target ID"
            }));
        }
        // Make sure the target id format is correct
        else if ( !mongodb.ObjectID.isValid(req.params.target))
        {
            res.setHeader( 'Content-Type', 'application/json');
            return res.end(JSON.stringify(<mp.IResponse>{
                error: true,
                message: "Invalid target ID format"
            }));
        }
    }

    /**
    * Attempts to remove a comment by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private remove(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var comments = this.getModel("comments");
        var findToken : mp.IComment = {
            _id: new mongodb.ObjectID(req.params.id),
            author: req._user.username
        }

        // Attempt to delete the instances
        comments.deleteInstances(findToken).then(function (numRemoved)
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
    * @param {mp.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private update(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: mp.IComment = req.body;
        var comments = this.getModel("comments");
        var findToken : mp.IComment = {
            _id: new mongodb.ObjectID(req.params.id),
            author: req._user.username
        }

        comments.update(findToken, token).then(function (instance)
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
    * @param {IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private create(req: mp.IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var token: mp.IComment = req.body;
        var comments = this.getModel("comments");

        // User is passed from the authentication function
        token.author = req._user.username;
        token.responseTarget = req.params.target;

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