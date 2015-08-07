var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseController = require("./BaseController");
var ErrorController = require("./ErrorController");
var UserController = require("./UserController");
var ProjectController = require("./ProjectController");
var BuildController = require("./BuildController");
var ExportController = require("./ExportController");
var FileController = require("./FileController");
var MiscController = require("./MiscController");
var utils = require("../Utils");
var logger = require("../Logger");
/**
* The main router controller. This will delegate the creation of all subsequent requests.
*/
var HomeController = (function (_super) {
    __extends(HomeController, _super);
    /**
    * Creates an instance of the Controller class
    */
    function HomeController() {
        _super.call(this);
    }
    /**
    * Called whenever we need to process
    */
    HomeController.prototype.processRequest = function (request, response, functionName) {
        var urlCommands = request.url.substr(1, request.url.length - 1);
        urlCommands = urlCommands.split("?")[0];
        var urlParts = urlCommands.split("/");
        logger.log("Processing request '" + request.url.substr(1, request.url.length - 1) + "'...");
        if (!urlParts[0] || urlParts[0] == "")
            this.processCommand("", "", request, response);
        else if (urlParts.length == 1)
            this.processCommand(urlParts[0], "", request, response);
        else
            this.processCommand(urlParts[0], urlParts[1], request, response);
    };
    /**
    * The request being made to Animate seems to be an API command. Try to process it.
    */
    HomeController.prototype.processCommand = function (command, func, request, response) {
        var controller = null;
        logger.log("[" + command + "] : " + func + "...");
        if (!command || command == "")
            controller = new ErrorController(utils.ErrorCodes.BAD_QUERY, "No command specified");
        else if (!func || func == "")
            controller = new ErrorController(utils.ErrorCodes.BAD_QUERY, "No function specified");
        else {
            switch (command) {
                // Create the controller based on what represents the first part of the URL
                case utils.urlControllers.USER:
                    controller = UserController.singleton;
                    break;
                case utils.urlControllers.PROJECT:
                    controller = ProjectController.singleton;
                    break;
                case utils.urlControllers.BUILD:
                    controller = BuildController.singleton;
                    break;
                case utils.urlControllers.PLUGIN:
                    //controller = PluginController.singleton;
                    break;
                case utils.urlControllers.MISC:
                    controller = MiscController.singleton;
                    break;
                case utils.urlControllers.FILE:
                    controller = FileController.singleton;
                    break;
                case utils.urlControllers.EXPORT:
                    controller = ExportController.singleton;
                    break;
            }
        }
        if (!controller)
            controller = new ErrorController(utils.ErrorCodes.COMMAND_UNRECOGNISED, "The command was not recognised");
        // Process the response
        controller.commandOptions = this.commandOptions;
        controller.processRequest(request, response, func);
        controller.commandOptions = null;
    };
    Object.defineProperty(HomeController, "singleton", {
        /**
        * Gets an instance of the user controller
        * @returns {HomeController}
        */
        get: function () {
            if (!HomeController._singleton)
                HomeController._singleton = new HomeController();
            return HomeController._singleton;
        },
        enumerable: true,
        configurable: true
    });
    return HomeController;
})(BaseController);
exports.HomeController = HomeController;
