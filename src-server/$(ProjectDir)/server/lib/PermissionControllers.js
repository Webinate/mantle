var UsersService_1 = require("./UsersService");
/**
* This funciton checks if user is logged in
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
function authenticateUser(req, res, next) {
    var users = UsersService_1.UsersService.getSingleton();
    users.authenticated(req, res).then(function (auth) {
        if (!auth.authenticated)
            req.params.user = null;
        else
            req.params.user = auth.user;
        next();
    }).catch(function (error) {
        req.params.user = null;
        next();
    });
}
exports.authenticateUser = authenticateUser;
/**
* This funciton checks the logged in user is an admin. If not an admin it returns an error,
* if true it passes the scope onto the next function in the queue
* @param {express.Request} req
* @param {express.Response} res
* @param {Function} next
*/
function authenticateAdmin(req, res, next) {
    var users = UsersService_1.UsersService.getSingleton();
    users.authenticated(req, res).then(function (auth) {
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
            req.params.user = auth.user;
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
exports.authenticateAdmin = authenticateAdmin;
