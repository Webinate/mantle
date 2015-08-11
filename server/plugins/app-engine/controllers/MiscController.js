var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseController = require("./BaseController");
var ErrorController = require("./ErrorController");
var viewJSON = require("../views/JSONRenderer");
var utils = require("../Utils");
var logger = require("../Logger");
/**
* Controlls all miscellaneous related functions
*/
var MiscController = (function (_super) {
    __extends(MiscController, _super);
    /**
    * Creates an instance of the Controller class
    */
    function MiscController() {
        _super.call(this);
    }
    /**
    * Called whenever we need to process
    */
    MiscController.prototype.processRequest = function (request, response, functionName) {
        var that = this;
        logger.log("Processing misc request '" + functionName + "'");
        this.processQueryData(function (options) {
            switch (functionName) {
                case "get-news-tab":
                    return that.getNewsTab(request, response);
                    break;
                default:
                    new ErrorController(utils.ErrorCodes.INVALID_INPUT, "No function specified").processRequest(request, response, functionName);
                    break;
            }
        }, request, response);
    };
    /**
    * Fetches the Iframe HTML for displaying news in Animate
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    MiscController.prototype.getNewsTab = function (request, response) {
        viewJSON.render({ message: "News loaded", "html": "<iframe src='https://webinate.net/tutorials-minimal/'></iframe>" }, request, response, viewJSON.ReturnType.SUCCESS);
    };
    Object.defineProperty(MiscController, "singleton", {
        /**
        * Gets an instance of the controller
        * @returns {MiscController}
        */
        get: function () {
            if (!MiscController._singleton)
                MiscController._singleton = new MiscController();
            return MiscController._singleton;
        },
        enumerable: true,
        configurable: true
    });
    return MiscController;
})(BaseController);
module.exports = MiscController;
