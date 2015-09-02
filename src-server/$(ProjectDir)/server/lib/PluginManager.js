var ws = require("ws");
var winston = require("winston");
/**
* A class for handling events sent from a webinate user server
*/
var PluginManager = (function () {
    /**
    * Creates an instance of the plugin manager
    */
    function PluginManager(cfg) {
        this._cfg = cfg;
    }
    /**
    * Intiailizes the manager
    */
    PluginManager.prototype.init = function () {
        var cfg = this._cfg;
        return new Promise(function (resolve, reject) {
            var _client = new ws(cfg.usersSocketURL, undefined, { headers: { origin: cfg.usersSocketOrigin } });
            // Opens a stream to the users socket events
            _client.on('open', function () {
                winston.info("We are listening to users!", { process: process.pid });
                return resolve();
            });
            // Report if there are any errors
            _client.on('error', function (err) {
                winston.error("An error occurred when trying to connect to Users: " + err.message, { process: process.pid });
                return reject();
            });
            // We have recieved a message from the user socket
            _client.on('message', function (data, flags) {
                winston.info("We got a message from Users!: " + data, { process: process.pid });
            });
        });
    };
    return PluginManager;
})();
exports.PluginManager = PluginManager;
