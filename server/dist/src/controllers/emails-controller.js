"use strict";
const express = require("express");
const controllerModule = require("./controller");
const bodyParser = require('body-parser');
const users_service_1 = require("../users-service");
const winston = require("winston");
class EmailsController extends controllerModule.Controller {
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    constructor(server, config, e) {
        super(null);
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
    onPost(req, res, next) {
        // Set the content type
        res.setHeader('Content-Type', 'application/json');
        var message = `Hello admin,
			We have received a message from ${req.body.name}:

			${req.body.message}

			Email: ${req.body.email}
			Phone: ${req.body.phone}
			Website: ${req.body.website}`;
        users_service_1.UsersService.getSingleton().sendAdminEmail(message).then(function (body) {
            res.end(body);
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({ message: err.toString(), error: true }));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailsController;
