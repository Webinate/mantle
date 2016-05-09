"use strict";
const ws = require("ws");
const winston = require("winston");
const events = require("events");
(function (UserEventType) {
    UserEventType[UserEventType["Login"] = 1] = "Login";
    UserEventType[UserEventType["Logout"] = 2] = "Logout";
    UserEventType[UserEventType["Activated"] = 3] = "Activated";
    UserEventType[UserEventType["Removed"] = 4] = "Removed";
    UserEventType[UserEventType["FilesUploaded"] = 5] = "FilesUploaded";
    UserEventType[UserEventType["FilesRemoved"] = 6] = "FilesRemoved";
    UserEventType[UserEventType["BucketUploaded"] = 7] = "BucketUploaded";
    UserEventType[UserEventType["BucketRemoved"] = 8] = "BucketRemoved";
    UserEventType[UserEventType["MetaRequest"] = 9] = "MetaRequest";
    UserEventType[UserEventType["Echo"] = 10] = "Echo";
})(exports.UserEventType || (exports.UserEventType = {}));
var UserEventType = exports.UserEventType;
/**
* A class for handling events sent from a webinate user server
*/
class EventManager extends events.EventEmitter {
    /**
    * Creates an instance of the plugin manager
    */
    constructor(cfg) {
        super();
        EventManager.singleton = this;
        this._cfg = cfg;
    }
    /**
    * Intiailizes the manager
    */
    init() {
        var cfg = this._cfg;
        var that = this;
        return new Promise(function (resolve, reject) {
            var reconnectInterval = 3 * 1000;
            var _client;
            var connect = function () {
                var _client = new ws(cfg.usersSocketURL, { headers: { origin: cfg.usersSocketOrigin } });
                // Opens a stream to the users socket events
                _client.on('open', function () {
                    winston.info(`Connected to the users socket stream`, { process: process.pid });
                    return resolve();
                });
                // Opens a stream to the users socket events
                _client.on('close', function () {
                    winston.error(`We lost connection to the stream`, { process: process.pid });
                    setTimeout(connect, reconnectInterval);
                });
                // Report if there are any errors
                _client.on('error', function (err) {
                    winston.error(`An error occurred when trying to connect to the users socket: ${err.message}`, { process: process.pid });
                    setTimeout(connect, reconnectInterval);
                });
                // We have recieved a message from the user socket
                _client.on('message', that.onMessage.bind(that));
            };
            connect();
        });
    }
    /**
    * Called whenever we get a message from the user socket events
    */
    onMessage(data, flags) {
        if (!flags.binary) {
            try {
                var event = JSON.parse(data);
                this.emit(UserEventType[event.eventType], event);
            }
            catch (err) {
                winston.error(`An error occurred while parsing socket string : '${err.message}'`, { process: process.pid });
            }
        }
    }
}
exports.EventManager = EventManager;
