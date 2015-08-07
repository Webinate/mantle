var request = require("request");
/**
* Singleton service for communicating with a webinate-users server
*/
var UsersService = (function () {
    /**
    * Creates an instance of the service
    * @param {string} usersURL The URL of the user management service
    */
    function UsersService(usersURL) {
        UsersService.usersURL = usersURL + "/users";
    }
    /**
    * Sends an email to the admin account
    * @param {string} message The message to send
    * @returns {Promise<any>}
    */
    UsersService.prototype.sendAdminEmail = function (message) {
        var that = this;
        return new Promise(function (resolve, reject) {
            request.post(UsersService.usersURL + "/message-webmaster", { form: { message: message } }, function (error, response, body) {
                if (error)
                    return reject(error);
                resolve(body);
            });
        });
    };
    /**
    * Checks if a user is logged in and authenticated
    * @param {express.Request} req
    * @param {express.Request} res
    * @returns {Promise<UsersInterface.IAuthenticationResponse>}
    */
    UsersService.prototype.authenticated = function (req, res) {
        var that = this;
        return new Promise(function (resolve, reject) {
            console.log("Getting user data");
            request.get(UsersService.usersURL + "/authenticated", { headers: { cookie: req.headers.cookie } }, function (error, response, body) {
                console.log("User data returned");
                if (error)
                    return reject(error);
                var token = JSON.parse(body);
                if (token.error)
                    return reject(new Error(token.message));
                resolve(token);
            });
        });
    };
    /**
    * Checks a user has the desired permission
    * @param {UsersInterface.IUserEntry} user The user we are checking
    * @param {UsersInterface.UserPrivileges} level The level we are checking against
    * @param {string} existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
    * @returns {boolean}
    */
    UsersService.prototype.hasPermission = function (user, level, existingUser) {
        if (existingUser !== undefined) {
            if ((user.email != existingUser && user.username != existingUser) && user.privileges > level)
                return false;
        }
        else if (user.privileges > level)
            return false;
        return true;
    };
    /**
    * Gets the user singleton
    * @returns {UsersService}
    */
    UsersService.getSingleton = function (usersURL) {
        if (!UsersService._singleton)
            UsersService._singleton = new UsersService(usersURL);
        return UsersService._singleton;
    };
    return UsersService;
})();
exports.UsersService = UsersService;
