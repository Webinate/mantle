var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseController = require("./BaseController");
var viewJSON = require("../views/JSONRenderer");
var logger = require("../Logger");
/**
* Controlls all error reporting
*/
var ErrorController = (function (_super) {
    __extends(ErrorController, _super);
    /**
    * Creates an instance of the Controller class
    */
    function ErrorController(code, message) {
        _super.call(this);
        this.code = code;
        this.message = message;
        this.token = {
            message: this.message,
            errorCode: this.code.toString()
        };
    }
    /**
    * Called whenever we need to process
    */
    ErrorController.prototype.processRequest = function (request, response, functionName) {
        logger.log(this.token.message, logger.LogType.ERROR);
        viewJSON.render(this.token, request, response, viewJSON.ReturnType.ERROR);
    };
    return ErrorController;
})(BaseController);
module.exports = ErrorController;
