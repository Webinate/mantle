"use strict";
const users_service_1 = require("./users-service");
const mongodb = require("mongodb");
/**
* This funciton checks if user is logged in
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
function getUser(req, res, next) {
    var users = users_service_1.UsersService.getSingleton();
    users.authenticated(req).then(function (auth) {
        if (!auth.authenticated) {
            req._user = null;
            req._isAdmin = false;
            req._verbose = false;
        }
        else {
            req._user = auth.user;
            req._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
            // Check if this must be cleaned or not
            var verbose = (req.query.verbose ? true : false);
            if (verbose)
                if (!req._isAdmin)
                    if (req.params.user !== undefined && req.params.user != auth.user.username)
                        verbose = false;
            req._verbose = verbose;
        }
        next();
    }).catch(function (error) {
        req.params.user = null;
        next();
    });
}
exports.getUser = getUser;
/**
* Checks for an id parameter and that its a valid mongodb ID. Returns an error of type IResponse if no ID is detected, or its invalid
* @param {string} idName The name of the ID to check for
* @param {string} rejectName The textual name of the ID when its rejected
* @param {boolean} optional If true, then an error wont be thrown if it doesnt exist
*/
function hasId(idName, rejectName, optional = false) {
    return function (req, res, next) {
        // Make sure the id
        if (!req.params[idName] && !optional) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
                error: true,
                message: "Please specify an " + idName
            }));
        }
        else if (req.params[idName] && !mongodb.ObjectID.isValid(req.params[idName])) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
                error: true,
                message: "Invalid ID format"
            }));
        }
        next();
    };
}
exports.hasId = hasId;
/**
* This funciton checks the logged in user is an admin. If not an admin it returns an error,
* if true it passes the scope onto the next function in the queue
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
function isAdmin(req, res, next) {
    var users = users_service_1.UsersService.getSingleton();
    users.authenticated(req).then(function (auth) {
        if (!auth.authenticated)
            return Promise.reject(new Error("You must be logged in to make this request"));
        else if (!users.hasPermission(auth.user, 2))
            return Promise.reject(new Error("You do not have permission"));
        else {
            req._user = auth.user;
            req._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
            req._verbose = true;
            next();
        }
    }).catch(function (error) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: true,
            message: error.message
        }));
    });
}
exports.isAdmin = isAdmin;
/**
* This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
function canEdit(req, res, next) {
    var users = users_service_1.UsersService.getSingleton();
    var targetUser = req.params.user;
    users.authenticated(req).then(function (auth) {
        if (!auth.authenticated)
            return Promise.reject(new Error("You must be logged in to make this request"));
        else if (!users.hasPermission(auth.user, 2, targetUser))
            return Promise.reject(new Error("You do not have permission"));
        else {
            req._user = auth.user;
            req._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
            req._verbose = (req.query.verbose ? true : false);
            next();
        }
    }).catch(function (error) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: true,
            message: error.message
        }));
    });
}
exports.canEdit = canEdit;
/**
* This funciton checks if user is logged in and throws an error if not
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
function isAuthenticated(req, res, next) {
    var users = users_service_1.UsersService.getSingleton();
    users.authenticated(req).then(function (auth) {
        if (!auth.authenticated)
            return Promise.reject(new Error(auth.message));
        req._user = auth.user;
        req._isAdmin = (auth.user.privileges == 1 || auth.user.privileges == 2 ? true : false);
        // Check if this must be cleaned or not
        var verbose = (req.query.verbose ? true : false);
        if (verbose)
            if (!req._isAdmin)
                if (req.params.user !== undefined && req.params.user != auth.user.username)
                    verbose = false;
        req._verbose = verbose;
        next();
    }).catch(function (error) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: true,
            message: error.message
        }));
    });
}
exports.isAuthenticated = isAuthenticated;
