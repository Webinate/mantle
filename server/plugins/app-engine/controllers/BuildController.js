var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseController = require("./BaseController");
var ErrorController = require("./ErrorController");
var viewJSON = require("../views/JSONRenderer");
var viewJade = require("../views/JadeRenderer");
var viewHTML = require("../views/HTMLRenderer");
var utils = require("../Utils");
var Model = require("../models/Model");
var userModel = require("../models/UserModel");
var projectModel = require("../models/ProjectModel");
var buildModel = require("../models/BuildModel");
var mongodb = require("mongodb");
var UserController = require("./UserController");
var logger = require("../Logger");
var validator = require("../Validator");
/**
* Controlls all project related functions
*/
var BuildController = (function (_super) {
    __extends(BuildController, _super);
    /**
    * Creates an instance of the Controller class
    */
    function BuildController() {
        _super.call(this);
    }
    /**
    * Called whenever we need to process
    */
    BuildController.prototype.processRequest = function (request, response, functionName) {
        var that = this;
        this.processQueryData(function (options) {
            logger.log("Processing build request '" + functionName + "'");
            switch (functionName) {
                case "create-build":
                    that.createBuild(null, request, response);
                    break;
                case "print-builds":
                    that.printBuilds(parseInt(options["limit"]), parseInt(options["index"]), request, response);
                    break;
                case "execute":
                    that.execute(options["buildId"], options["token"], request, response);
                    break;
                default:
                    new ErrorController(utils.ErrorCodes.INVALID_INPUT, "No function specified").processRequest(request, response, functionName);
                    break;
            }
        }, request, response);
    };
    /**
    * Creates a new Project for the user that is currently logged in.
    * @param {( users: buildModel.Build ) => void} callback Callback function with the build instance
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    BuildController.prototype.createBuild = function (callback, request, response) {
        // Check if the user is logged in
        var isUserLoggedIn = function (loggedIn, user) {
            logger.log("Creating a new build...", logger.LogType.ADMIN);
            // If not logged in then do nothing
            if (!loggedIn)
                return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            var build = new buildModel.Build();
            // Validation passed - create user in database
            Model.collections("builds").save(build, function (err, result) {
                if (err || !result) {
                    if (callback)
                        return callback(null);
                    else
                        return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, err).processRequest(request, response, "");
                }
                logger.log("Build created...", logger.LogType.SUCCESS);
                if (callback)
                    callback(result);
                else
                    viewJSON.render(result, request, response, viewJSON.ReturnType.SUCCESS);
            });
        };
        UserController.singleton.loggedIn(isUserLoggedIn, request, response);
    };
    /**
    * Executes the build based on the URL and token provided
    * @param {string} buildId The id of the build we want to run
    * @param {string} token The token key for viewing the content
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    BuildController.prototype.execute = function (buildId, token, request, response) {
        var that = this;
        if (!buildId || !token || !validator.isValidObjectID(buildId))
            return viewJade.render(__dirname + "/../views/messages/error.jade", { message: "Invalid input" }, response);
        logger.log("Executing build " + buildId + "...", logger.LogType.ADMIN);
        UserController.singleton.loggedIn(function (loggedIn, user) {
            Model.collections("builds").findOne({ _id: new mongodb.ObjectID(buildId) }, function (err, build) {
                if (err)
                    return viewJade.render(__dirname + "/../views/messages/error.jade", { message: "A database error has occurred" }, response);
                if (!build)
                    return viewJade.render(__dirname + "/../views/messages/error.jade", { message: "Could not find build" }, response);
                if (build.liveToken != token)
                    return viewJade.render(__dirname + "/../views/messages/error.jade", { message: "Invalid token" }, response);
                function render() {
                    logger.log("Valid build (" + buildId + ") execute request - updating token...");
                    // All seems good - update the database token
                    Model.collections("builds").update({ _id: build._id }, { $set: { liveToken: buildModel.Build.generateToken(7) } }, function (err, numAffected) {
                        logger.log("Build " + buildId + " has been executed", logger.LogType.SUCCESS);
                        return new viewHTML().renderString(build.liveHTML, response);
                    });
                }
                // Not logged and private, do nothing
                if (loggedIn == false && build.visibility == buildModel.BUILD_VISIBILITY.PRIVATE)
                    return viewJade.render(__dirname + "/../views/messages/error.jade", { message: "Build is not public" }, response);
                else if (loggedIn && build.visibility == buildModel.BUILD_VISIBILITY.PRIVATE) {
                    var projectController = require("./ProjectController").singleton;
                    projectController.checkPrivileges(user._id.toString(), build.projectId.toString(), projectModel.PrivilegeType.READ, function (hasRights) {
                        if (hasRights)
                            render();
                        else
                            return viewJade.render(__dirname + "/../views/messages/error.jade", { message: "You do not have permission to view this build" }, response);
                    }, request, response);
                }
                else
                    render();
            });
        }, request, response);
    };
    /**
    * Prints the builds currently stored in the database
    * @param {number} limit The number of builds to fetch
    * @param {number} startIndex The starting index from where we are fetching builds from
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    BuildController.prototype.printBuilds = function (limit, startIndex, request, response) {
        if (limit === void 0) { limit = 0; }
        if (startIndex === void 0) { startIndex = 0; }
        logger.log("Printing builds...", logger.LogType.ADMIN);
        var that = this;
        UserController.singleton.loggedIn(function (val, user) {
            if (!user || user.userType != userModel.UserType.ADMIN)
                return viewJade.render(__dirname + "/../views/messages/error.jade", { message: "You do not have permissions to view this content" }, response);
            Model.collections("builds").find({}, {}, startIndex, limit, function (err, result) {
                result.toArray(function (err, builds) {
                    return viewJade.render(__dirname + "/../views/admin/builds/print.jade", { builds: builds }, response);
                });
            });
        }, request, response);
    };
    Object.defineProperty(BuildController, "singleton", {
        /**
        * Gets an instance of the project controller
        * @returns {ProjectController}
        */
        get: function () {
            if (!BuildController._singleton)
                BuildController._singleton = new BuildController();
            return BuildController._singleton;
        },
        enumerable: true,
        configurable: true
    });
    return BuildController;
})(BaseController);
module.exports = BuildController;
