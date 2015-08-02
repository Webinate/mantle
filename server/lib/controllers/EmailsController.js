var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var express = require("express");
var controllerModule = require("./Controller");
var bodyParser = require('body-parser');
var UsersService_1 = require("../UsersService");
var EmailsController = (function (_super) {
    __extends(EmailsController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function EmailsController(config, e) {
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
        UsersService_1.UsersService.getSingleton().sendAdminEmail(message).then(function (body) {
            res.end(body);
        }).catch(function (err) {
            return res.end(JSON.stringify({ message: err.toString(), error: true }));
        });
    };
    return EmailsController;
})(controllerModule.Controller);
exports.default = EmailsController;
