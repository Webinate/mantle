var fs = require("fs");
/**
* A server configuration
*/
var ServerConfig = (function () {
    /**
    * Creates a new config instance
    * @param {any} data [Optional] JSON object from file
    */
    function ServerConfig(data) {
        /**
        * The host we listening for
        */
        this.host = "127.0.0.1";
        /**
        * The length of time the assets should be cached on a user's browser. The default is 30 days.
        */
        this.cacheLifetime = 2592000000;
        /**
        * The port number of the host
        */
        this.portHTTP = 8080;
        /**
        * The database host we are listening on
        */
        this.databaseHost = "127.0.0.1";
        /**
        * The port number the mongo database is listening on
        */
        this.databasePort = 27017;
        /**
        * The port number to use for SSL. Only applicable if ssl is true.
        */
        this.portHTTPS = 443;
        if (data)
            this.fromDataObject(data);
    }
    /**
    * Loads the data from a json object
    * @param {any} data JSON object from file
    */
    ServerConfig.prototype.fromDataObject = function (data) {
        this.name = data.name;
        this.host = data.host;
        this.cacheLifetime = data.cacheLifetime;
        this.portHTTP = data.portHTTP;
        this.databasePort = data.databasePort;
        this.databaseHost = data.databaseHost;
        this.staticFilesFolder = data.staticFilesFolder;
        this.paths = data.paths;
        this.emailAdmin = data.emailAdmin;
        this.emailFrom = data.emailFrom;
        this.emailService = data.emailService;
        this.emailServiceUser = data.emailServiceUser;
        this.emailServicePassword = data.emailServicePassword;
        this.captchaPrivateKey = data.captchaPrivateKey;
        this.captchaPublicKey = data.captchaPublicKey;
        this.activationURL = data.activationURL;
        this.usersURL = data.usersURL;
        this.adminURL = data.adminURL;
        this.databaseName = data.databaseName;
        if (data.ssl) {
            this.ssl = true;
            this.portHTTPS = data.portHTTPS;
            this.sslKey = data.sslKey;
            this.sslCert = data.sslCert;
            this.sslPassPhrase = data.sslPassPhrase;
            this.sslRoot = data.sslRoot;
            this.sslIntermediate = data.sslIntermediate;
        }
        else {
            this.ssl = false;
        }
    };
    return ServerConfig;
})();
exports.ServerConfig = ServerConfig;
/**
* Loads a configuration file which is needed to setup the server
* @param {string} configName Specify the name of a config to use
* @param {string} configPath The path to where the config file is located
* @returns {Promise<ServerConfig>}
*/
function loadConfig(configName, configPath) {
    return new Promise(function (resolve, reject) {
        console.log("Reading file config.json...");
        fs.readFile(configPath, "utf8", function (err, data) {
            if (err) {
                reject(new Error("Cannot read config file: " + err.message));
                return;
            }
            else {
                try {
                    console.log("Parsing file config.json...");
                    var json = JSON.parse(data);
                    var serverCongfigs = [];
                    for (var i = 0; i < json.length; i++) {
                        serverCongfigs.push(new ServerConfig(json[i]));
                        console.log("Reading config " + serverCongfigs[i].name + "...");
                    }
                    console.log("You have (" + serverCongfigs.length + ") configurations.");
                    for (var i = 0; i < serverCongfigs.length; i++) {
                        if (serverCongfigs[i].name == configName) {
                            // Success!
                            resolve(serverCongfigs[i]);
                            return;
                        }
                    }
                    reject(new Error("Could not find a config with the name " + configName));
                    return;
                }
                catch (exp) {
                    reject(new Error("Could not parse JSON file: " + exp.message));
                    return;
                }
            }
        });
    });
}
exports.loadConfig = loadConfig;
