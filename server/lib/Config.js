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
        this.host = "127.0.0.1";
        this.portHTTP = 8080;
        this.portHTTPS = 443;
        this.portDatabase = 27017;
        this.portUsers = 8000;
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
        this.portHTTP = data.portHTTP;
        this.portDatabase = data.portDatabase;
        this.portUsers = data.portUsers;
        this.path = data.path;
        this.html = data.html;
        this.staticFilesFolder = data.staticFilesFolder;
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
            this.sslKey = data.sslKey;
            this.sslCA = data.sslCA;
            this.sslCert = data.sslCert;
            this.sslPassPhrase = data.sslPassPhrase;
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
