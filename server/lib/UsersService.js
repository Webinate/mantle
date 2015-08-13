var request = require("request");
/**
* Singleton service for communicating with a webinate-users server
*/
var UsersService = (function () {
    /**
    * Creates an instance of the service
    * @param {IConfig} config The config file of this server
    */
    function UsersService(config) {
        UsersService.usersURL = config.usersURL + "/users";
        this._secret = config.usersSecret;
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
    * Sets a meta value by name for the specified user
    * @param {string} name The name of the meta value
    * @param {any} val The value to set
    * @param {string} user The username of the target user
    * @param {Request} req
    * @param {Response} res
    * @returns {Promise<UsersInterface.IResponse>}
    */
    UsersService.prototype.setMetaValue = function (name, val, user, req, res) {
        var that = this;
        return new Promise(function (resolve, reject) {
            request.post(UsersService.usersURL + "/meta/" + user + "/" + name, { body: { secret: that._secret, value: val }, headers: { cookie: req.headers.cookie } }, function (error, response, body) {
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
    * Sets a users meta data
    * @param {any} val The value to set
    * @param {string} user The username of the target user
    * @param {Request} req
    * @param {Response} res
    * @returns {Promise<UsersInterface.IResponse>}
    */
    UsersService.prototype.setMeta = function (val, user, req, res) {
        var that = this;
        return new Promise(function (resolve, reject) {
            request.post(UsersService.usersURL + "/meta/" + user, { body: { secret: that._secret, value: val }, headers: { cookie: req.headers.cookie } }, function (error, response, body) {
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
    * Checks if a user is logged in and authenticated
    * @param {express.Request} req
    * @param {express.Request} res
    * @returns {Promise<UsersInterface.IAuthenticationResponse>}
    */
    UsersService.prototype.authenticated = function (req, res) {
        var that = this;
        return new Promise(function (resolve, reject) {
            request.get(UsersService.usersURL + "/authenticated", { headers: { cookie: req.headers.cookie } }, function (error, response, body) {
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
    UsersService.getSingleton = function (config) {
        if (!UsersService._singleton)
            UsersService._singleton = new UsersService(config);
        return UsersService._singleton;
    };
    return UsersService;
})();
exports.UsersService = UsersService;
