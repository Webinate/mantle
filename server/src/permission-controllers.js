var users_service_1 = require("./users-service");
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
* This funciton checks the logged in user is an admin. If not an admin it returns an error,
* if true it passes the scope onto the next function in the queue
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
function isAdmin(req, res, next) {
    var users = users_service_1.UsersService.getSingleton();
    users.authenticated(req).then(function (auth) {
        if (!auth.authenticated) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: true,
                message: "You must be logged in to make this request"
            }));
        }
        else if (!users.hasPermission(auth.user, 2)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: true,
                message: "You do not have permission"
            }));
        }
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
            message: "You do not have permission"
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
        if (!auth.authenticated) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: true,
                message: "You must be logged in to make this request"
            }));
        }
        else if (!users.hasPermission(auth.user, 2, targetUser)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: true,
                message: "You do not have permission"
            }));
        }
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
            message: "You do not have permission"
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
        if (!auth.authenticated) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
                error: true,
                message: auth.message
            }));
        }
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
            message: "An error has occurred: " + error.message
        }));
    });
}
exports.isAuthenticated = isAuthenticated;
