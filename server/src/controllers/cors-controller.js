"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var controller_1 = require("./controller");
/**
* Checks all incomming requests to see if they are CORS approved
*/
var CORSController = (function (_super) {
    __extends(CORSController, _super);
    /**
    * Creates an instance of the user manager
    * @param {mongodb.Collection} userCollection The mongo collection that stores the users
    * @param {mongodb.Collection} sessionCollection The mongo collection that stores the session data
    * @param {def.IConfig} The config options of this manager
    */
    function CORSController(e, config) {
        _super.call(this, null);
        var matches = [];
        for (var i = 0, l = config.approvedDomains.length; i < l; i++)
            matches.push(new RegExp(config.approvedDomains[i]));
        // Approves the valid domains for CORS requests
        e.use(function (req, res, next) {
            if (req.headers.origin) {
                var matched = false;
                for (var m = 0, l = matches.length; m < l; m++)
                    if (req.headers.origin.match(matches[m])) {
                        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Mime-Type, X-File-Name, Cache-Control');
                        res.setHeader("Access-Control-Allow-Credentials", "true");
                        matched = true;
                        break;
                    }
                if (!matched)
                    console.log(req.headers.origin + " Does not have permission. Add it to the allowed ");
            }
            if (req.method === 'OPTIONS') {
                res.status(200);
                res.end();
            }
            else
                next();
        });
    }
    return CORSController;
}(controller_1.Controller));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CORSController;
