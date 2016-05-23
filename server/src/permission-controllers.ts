import express = require("express");
import {UsersService} from "./users-service";
import {IResponse, IAuthReq} from "modepress-api";
import * as mongodb from "mongodb";

/**
* This funciton checks if user is logged in
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
export function getUser(req: express.Request, res: express.Response, next: Function)
{
    var users = UsersService.getSingleton();
    users.authenticated(req).then(function(auth)
    {
        if (!auth.authenticated)
        {
            (<IAuthReq><Express.Request>req)._user = null;
            (<IAuthReq><Express.Request>req)._isAdmin = false;
            (<IAuthReq><Express.Request>req)._verbose = false;
        }
        else
        {
            (<IAuthReq><Express.Request>req)._user = auth.user;
            (<IAuthReq><Express.Request>req)._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);


            // Check if this must be cleaned or not
            var verbose = (req.query.verbose ? true : false);
            if (verbose)
                if (!(<IAuthReq><Express.Request>req)._isAdmin)
                    if (req.params.user !== undefined && req.params.user != auth.user.username)
                        verbose = false;

            (<IAuthReq><Express.Request>req)._verbose = verbose;

        }

        next();

    }).catch(function (error: Error)
    {
        req.params.user = null;
        next();
    });
}

/**
* Checks for an id parameter and that its a valid mongodb ID. Returns an error of type IResponse if no ID is detected, or its invalid
* @param {string} idName The name of the ID to check for
* @param {string} rejectName The textual name of the ID when its rejected
* @param {boolean} optional If true, then an error wont be thrown if it doesnt exist
*/
export function hasId( idName : string, rejectName : string, optional: boolean = false )
{
    return function( req: express.Request, res: express.Response, next: Function )
    {
        // Make sure the id
        if (!req.params[idName] && !optional)
        {
            res.setHeader( 'Content-Type', 'application/json');
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: "Please specify an " + idName
            }));
        }
        // Make sure the id format is correct
        else if ( req.params[idName] && !mongodb.ObjectID.isValid(req.params[idName]))
        {
            res.setHeader( 'Content-Type', 'application/json');
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: "Invalid ID format"
            }));
        }

        next();
    }
}

/**
* Checks for if a user with the username or email of the queryName exists. Throws an error if they don't
* @param {string} queryName The name of the ID to check for
* @param {string} rejectName The textual name of the ID when its rejected
*/
export async function userExists( req: express.Request, res: express.Response, next: Function )
{
    try
    {
        var users = UsersService.getSingleton();
        var user = await users.getUser( req.params.user, req )

        // Make sure the id format is correct
        if ( !user )
            throw new Error("User does not exist");
        next()
    }
    catch(err)
    {
        res.setHeader( 'Content-Type', 'application/json');
        return res.end(JSON.stringify(<IResponse>{
            error: true,
            message: err.message
        }));
    }
}

/**
* This funciton checks the logged in user is an admin. If not an admin it returns an error,
* if true it passes the scope onto the next function in the queue
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
export function isAdmin(req: express.Request, res: express.Response, next: Function)
{
    var users = UsersService.getSingleton();

    users.authenticated(req).then(function (auth)
    {
        if (!auth.authenticated)
            return Promise.reject(new Error("You must be logged in to make this request"));
        else if (!users.hasPermission(auth.user, 2))
            return Promise.reject(new Error("You do not have permission"));
        else
        {
            (<IAuthReq><Express.Request>req)._user = auth.user;
            (<IAuthReq><Express.Request>req)._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
            (<IAuthReq><Express.Request>req)._verbose = true;
            next();
        }

    }).catch(function (error: Error)
    {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<IResponse>{
            error: true,
            message: error.message
        }));
    });
}

/**
* This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
export async function canEdit(req: express.Request, res: express.Response, next: Function)
{
    var users = UsersService.getSingleton();
    var targetUser : string = req.params.user;

    try
    {
        var auth = await users.authenticated(req);
        var target : UsersInterface.IGetUser = null;

        // Check if the target user exists
        if (targetUser !== undefined)
        {
            target = await users.getUser(targetUser, req);
            if (!target || target.error || !target.data)
                throw new Error(`User ${targetUser} does not exist`);
        }

        if (!auth.authenticated)
            throw new Error("You must be logged in to make this request");
        else if (!users.hasPermission(auth.user, 2, targetUser))
            throw new Error("You do not have permission");
        else
        {
            (<IAuthReq><Express.Request>req)._user = auth.user;
            (<IAuthReq><Express.Request>req)._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
            (<IAuthReq><Express.Request>req)._verbose = (req.query.verbose ? true : false);
            next();
            return;
        }

    } catch ( error ) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<IResponse>{
            error: true,
            message: error.message
        }));
    };
}

/**
* This funciton checks if user is logged in and throws an error if not
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
export function isAuthenticated(req: express.Request, res: express.Response, next: Function)
{
    var users = UsersService.getSingleton();
    users.authenticated(req).then(function (auth)
    {
        if (!auth.authenticated)
            return Promise.reject(new Error(auth.message));

        (<IAuthReq><Express.Request>req)._user = auth.user;
        (<IAuthReq><Express.Request>req)._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);

        // Check if this must be cleaned or not
        var verbose = (req.query.verbose ? true : false);
        if (verbose)
            if (!(<IAuthReq><Express.Request>req)._isAdmin)
                if (req.params.user !== undefined && req.params.user != auth.user.username)
                    verbose = false;

        (<IAuthReq><Express.Request>req)._verbose = verbose;

        next();

    }).catch(function (error: Error)
    {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<IResponse>{
            error: true,
            message: error.message
        }));
    });
}