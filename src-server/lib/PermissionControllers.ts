import express = require("express");
import {UsersService} from "./UsersService";
import {IResponse, IAuthReq} from "modepress-api";

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
            (<IAuthReq><Express.Request>req)._user = null;
        else
        {
            (<IAuthReq><Express.Request>req)._user = auth.user;
            (<IAuthReq><Express.Request>req)._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
        }

        next();

    }).catch(function (error: Error)
    {
        req.params.user = null;
        next();
    });
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
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: "You must be logged in to make this request"
            }));
        }
        else if (!users.hasPermission(auth.user, 2))
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: "You do not have permission"
            }));
        }
        else
        {
            (<IAuthReq><Express.Request>req)._user = auth.user;
            (<IAuthReq><Express.Request>req)._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
            next();
        }

    }).catch(function (error: Error)
    {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<IResponse>{
            error: true,
            message: "You do not have permission"
        }));
    });
}

/**
* This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
* @param {express.Request} req 
* @param {express.Response} res
* @param {Function} next 
*/
export function canEdit(req: express.Request, res: express.Response, next: Function)
{
    var users = UsersService.getSingleton();
    var targetUser : string = req.params.user;

    users.authenticated(req).then(function (auth)
    {
        if (!auth.authenticated)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: "You must be logged in to make this request"
            }));
        }
        else if (!users.hasPermission(auth.user, 2, targetUser))
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: "You do not have permission"
            }));
        }
        else
        {
            (<IAuthReq><Express.Request>req)._user = auth.user;
            (<IAuthReq><Express.Request>req)._isAdmin = ( auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false );
            next();
        }

    }).catch(function (error: Error)
    {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<IResponse>{
            error: true,
            message: "You do not have permission"
        }));
    });
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
        {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: auth.message
            }));
        }

        next();

    }).catch(function (error: Error)
    {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<IResponse>{
            error: true,
            message: `An error has occurred: ${error.message}`
        }));
    });
}