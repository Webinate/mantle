import express = require("express");
import {UsersService} from "./UsersService";
import {IResponse} from "modepress-api";

/**
* This funciton checks if user is logged in
* @param {express.Request} req 
* @param {express.Response} res
* @param {Function} next 
*/
export function authenticateUser(req: express.Request, res: express.Response, next: Function)
{
    var users = UsersService.getSingleton();
    users.authenticated(req, res).then(function(auth)
    {
        if (!auth.authenticated)
            req.params.user = null;
        else
            req.params.user = auth.user;

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
export function authenticateAdmin(req: express.Request, res: express.Response, next: Function)
{
    var users = UsersService.getSingleton();

    users.authenticated(req, res).then(function (auth)
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
            req.params.user = auth.user;
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