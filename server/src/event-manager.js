"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ws = require("ws");
var winston = require("winston");
var events = require("events");
(function (UserEventType) {
    UserEventType[UserEventType["Login"] = 0] = "Login";
    UserEventType[UserEventType["Logout"] = 1] = "Logout";
    UserEventType[UserEventType["Activated"] = 2] = "Activated";
    UserEventType[UserEventType["Removed"] = 3] = "Removed";
    UserEventType[UserEventType["FilesUploaded"] = 4] = "FilesUploaded";
    UserEventType[UserEventType["FilesRemoved"] = 5] = "FilesRemoved";
    UserEventType[UserEventType["BucketUploaded"] = 6] = "BucketUploaded";
    UserEventType[UserEventType["BucketRemoved"] = 7] = "BucketRemoved";
})(exports.UserEventType || (exports.UserEventType = {}));
var UserEventType = exports.UserEventType;
/**
* A class for handling events sent from a webinate user server
*/
var EventManager = (function (_super) {
    __extends(EventManager, _super);
    /**
    * Creates an instance of the plugin manager
    */
    function EventManager(cfg) {
        _super.call(this);
        EventManager.singleton = this;
        this._cfg = cfg;
    }
    /**
    * Intiailizes the manager
    */
    EventManager.prototype.init = function () {
        var cfg = this._cfg;
        var that = this;
        return new Promise(function (resolve, reject) {
            var reconnectInterval = 3 * 1000;
            var _client;
            var connect = function () {
                var _client = new ws(cfg.usersSocketURL, { headers: { origin: cfg.usersSocketOrigin } });
                // Opens a stream to the users socket events
                _client.on('open', function () {
                    winston.info("Connected to the users socket stream", { process: process.pid });
                    return resolve();
                });
                // Opens a stream to the users socket events
                _client.on('close', function () {
                    winston.error("We lost connection to the stream", { process: process.pid });
                    setTimeout(connect, reconnectInterval);
                });
                // Report if there are any errors
                _client.on('error', function (err) {
                    winston.error("An error occurred when trying to connect to the users socket: " + err.message, { process: process.pid });
                    setTimeout(connect, reconnectInterval);
                });
                // We have recieved a message from the user socket
                _client.on('message', that.onMessage.bind(that));
            };
            connect();
        });
    };
    /**
    * Called whenever we get a message from the user socket events
    */
    EventManager.prototype.onMessage = function (data, flags) {
        if (!flags.binary) {
            try {
                var event = JSON.parse(data);
                this.emit(UserEventType[event.eventType], event);
            }
            catch (err) {
                winston.error("An error occurred while parsing socket string : '" + err.message + "'", { process: process.pid });
            }
        }
    };
    return EventManager;
}(events.EventEmitter));
exports.EventManager = EventManager;
