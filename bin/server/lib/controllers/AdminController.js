var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var express = require("express");
var controllerModule = require("./Controller");
var bodyParser = require('body-parser');
var AdminController = (function (_super) {
    __extends(AdminController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {express.Express} e The express instance of this server
    * @param {string} adminEmail The email for the admin of the site
    * @param {string} from The email we are sending messages from
    * @param {string} service The email service we are using. Eg: "Gmail"
    * @param {string} serviceUser The email service user name eg "user@gmail.com"
    * @param {string} servicePassword The email service password
    */
    function AdminController(e, adminEmail, from, service, serviceUser, servicePassword) {
        if (from === void 0) { from = ""; }
        if (service === void 0) { service = "Gmail"; }
        if (serviceUser === void 0) { serviceUser = ""; }
        if (servicePassword === void 0) { servicePassword = ""; }
        _super.call(this, null, e);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        // Filter the post requests
        router.post("/", this.onPost.bind(this));
        // Register the path
        e.use("/admin", router);
    }
    /**
    * Called whenever a post request is caught by this controller
    * @param {express.Request} req The request object
    * @param {express.Response} res The response object
    * @param {Function} next
    */
    AdminController.prototype.onPost = function (req, res, next) {
        // Set the content type
        res.setHeader('Content-Type', 'application/json');
        if (!this._transport) {
            return res.end(JSON.stringify({
                message: "There is no email service set for this website",
                error: true
            }));
        }
        var message = "Hello admin,\n\t\t\tWe have received a message from " + req.body.name + ":\n\n\t\t\t" + req.body.message + "\n\t\t\t\n\t\t\tEmail: " + req.body.email + "\n\t\t\tPhone: " + req.body.phone + "\n\t\t\tWebsite: " + req.body.website + "\n\t\t";
        var adminEmail = this._adminEmail;
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: this._from,
            to: adminEmail,
            subject: "Webinate Message",
            text: message,
            html: message.replace(/(?:\r\n|\r|\n)/g, '<br />')
        };
        // send mail with defined transport object
        this._transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.end(JSON.stringify({
                    message: "We could not send an email to the admin at " + adminEmail + ". Error: " + error.message,
                    error: true
                }));
            }
            else {
                res.end(JSON.stringify({
                    message: "Thank you for email " + req.body.name + ", we'll get in touch as soon as we can",
                    error: false
                }));
            }
        });
    };
    return AdminController;
})(controllerModule.Controller);
exports.AdminController = AdminController;
