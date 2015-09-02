var ws = require("ws");
var winston = require("winston");
var PluginManager = (function () {
    function PluginManager(cfg) {
        this._cfg = cfg;
    }
    PluginManager.prototype.init = function () {
        var cfg = this._cfg;
        return new Promise(function (resolve, reject) {
            var _client = new ws(cfg.usersSocketURL, undefined, { headers: { origin: cfg.usersSocketOrigin } });
            _client.on('open', function () {
                winston.info("We are listening to users!", { process: process.pid });
                return resolve();
            });
            _client.on('error', function (err) {
                winston.error("An error occurred when trying to connect to Users: " + err.message, { process: process.pid });
                return reject();
            });
            _client.on('message', function (data, flags) {
                winston.info("We got a message from Users!: " + data, { process: process.pid });
            });
        });
    };
    return PluginManager;
})();
exports.PluginManager = PluginManager;
