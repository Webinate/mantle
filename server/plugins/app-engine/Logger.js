var utils = require("./Utils");
/**
* The type of message to log
*/
(function (LogType) {
    LogType[LogType["MESSAGE"] = 0] = "MESSAGE";
    LogType[LogType["ERROR"] = 1] = "ERROR";
    LogType[LogType["SUCCESS"] = 2] = "SUCCESS";
    LogType[LogType["WARNING"] = 3] = "WARNING";
    LogType[LogType["SYS_ERROR"] = 4] = "SYS_ERROR";
    LogType[LogType["ADMIN"] = 5] = "ADMIN";
})(exports.LogType || (exports.LogType = {}));
var LogType = exports.LogType;
/**
* This class is used to log messages and occassionally saves the log to the database
*/
var Logger = (function () {
    /**
    * Creates a new Logger instance
    */
    function Logger() {
        this.startupMessages = [];
        this.busySaving = false;
    }
    /**
    * Logs a message to the console and saves the messages to the database
    * @param {any} message The message to print
    * @param {LogType} type The type of message to print
    */
    Logger.prototype.log = function (message, type) {
        if (type === void 0) { type = LogType.MESSAGE; }
        switch (type) {
            case LogType.ERROR:
            case LogType.SYS_ERROR:
                console.log(utils.ConsoleStyles.red[0] + message + utils.ConsoleStyles.red[1]);
                break;
            case LogType.WARNING:
                console.log(utils.ConsoleStyles.yellow[0] + message + utils.ConsoleStyles.yellow[1]);
                break;
            case LogType.ADMIN:
                console.log(utils.ConsoleStyles.cyan[0] + message + utils.ConsoleStyles.cyan[1]);
                break;
            case LogType.MESSAGE:
                console.log(message);
                break;
            case LogType.SUCCESS:
                console.log(utils.ConsoleStyles.green[0] + message + utils.ConsoleStyles.green[1]);
                break;
        }
        var that = this;
        // If its an error - we show it regardless if whether or not we save the log
        if (type == LogType.ERROR || type == LogType.SYS_ERROR)
            console.log(utils.ConsoleStyles.red[0] + message + utils.ConsoleStyles.red[1]);
        var now = Date.now();
        var model = require("./models/Model");
        // If the model is not yet loaded, then store the messages in RAM until it is
        if (!model.getSingleton() || !model.collections("logs")) {
            that.startupMessages.push({ date: now, message: message, type: type });
            return;
        }
        that.startupMessages.push({ date: now, message: message, type: type });
        if (that.busySaving)
            return;
        function saveMessage() {
            that.busySaving = true;
            // Saves the console message to the database 
            model.collections("logs").save(that.startupMessages[0], function (err, result) {
                that.busySaving = false;
                if (err)
                    console.log(utils.ConsoleStyles.red[0] + "ERROR:" + err + utils.ConsoleStyles.red[1]);
                //switch ( result.type )
                //{
                //	case LogType.ERROR:
                //	case LogType.SYS_ERROR:
                //		console.log( utils.ConsoleStyles.red[0] + result.message + utils.ConsoleStyles.red[1] );
                //		break;
                //	case LogType.WARNING:
                //		console.log( utils.ConsoleStyles.yellow[0] + result.message + utils.ConsoleStyles.yellow[1] );
                //		break;
                //	case LogType.ADMIN:
                //		console.log( utils.ConsoleStyles.cyan[0] + result.message + utils.ConsoleStyles.cyan[1] );
                //		break;
                //	case LogType.MESSAGE:
                //		console.log( result.message );
                //		break;
                //	case LogType.SUCCESS:
                //		console.log( utils.ConsoleStyles.green[0] + result.message + utils.ConsoleStyles.green[1] );
                //		break;
                //}
                if (that.startupMessages.length > 0)
                    saveMessage();
            });
            that.startupMessages.splice(0, 1);
        }
        // Try to save the message
        if (that.startupMessages && that.startupMessages.length > 0)
            saveMessage();
    };
    Object.defineProperty(Logger, "singleton", {
        /**
        * Gets the singleton logger instance
        * @returns {Logger}
        */
        get: function () {
            if (!Logger._singleton)
                Logger._singleton = new Logger();
            return Logger._singleton;
        },
        enumerable: true,
        configurable: true
    });
    return Logger;
})();
exports.Logger = Logger;
/**
* Logs a message to the console and saves the messages to the database
* @param {any} message The message to print
* @param {LogType} type The type of message to print
*/
function log(message, type) {
    if (type === void 0) { type = LogType.MESSAGE; }
    Logger.singleton.log(message, type);
}
exports.log = log;
