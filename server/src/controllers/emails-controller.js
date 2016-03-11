var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var express = require("express");
var controllerModule = require("./controller");
var bodyParser = require('body-parser');
var users_service_1 = require("../users-service");
var winston = require("winston");
var EmailsController = (function (_super) {
    __extends(EmailsController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function EmailsController(server, config, e) {
        _super.call(this, null);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        // Filter the post requests
        router.post("/", this.onPost.bind(this));
        // Register the path
        e.use("/api/message-admin", router);
    }
    /**
    * Called whenever a post request is caught by this controller
    * @param {express.Request} req The request object
    * @param {express.Response} res The response object
    * @param {Function} next
    */
    EmailsController.prototype.onPost = function (req, res, next) {
        // Set the content type
        res.setHeader('Content-Type', 'application/json');
        var message = "Hello admin,\n\t\t\tWe have received a message from " + req.body.name + ":\n\n\t\t\t" + req.body.message + "\n\n\t\t\tEmail: " + req.body.email + "\n\t\t\tPhone: " + req.body.phone + "\n\t\t\tWebsite: " + req.body.website;
        users_service_1.UsersService.getSingleton().sendAdminEmail(message).then(function (body) {
            res.end(body);
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({ message: err.toString(), error: true }));
        });
    };
    return EmailsController;
})(controllerModule.Controller);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailsController;
