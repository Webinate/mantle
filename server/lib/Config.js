var fs = require("fs");
var winston = require("winston");
/**
* Loads a configuration file which is needed to setup the server
* @param {string} configName Specify the name of a config to use
* @param {string} configPath The path to where the config file is located
* @returns {Promise<ServerConfig>}
*/
function loadConfig(configName, configPath) {
    return new Promise(function (resolve, reject) {
        winston.info("Reading file config.json...", { process: process.pid });
        fs.readFile(configPath, "utf8", function (err, data) {
            if (err) {
                reject(new Error("Cannot read config file: " + err.message));
                return;
            }
            else {
                try {
                    winston.info("Parsing file config.json...", { process: process.pid });
                    var json = JSON.parse(data);
                    var serverCongfigs = [];
                    for (var i = 0; i < json.length; i++) {
                        serverCongfigs.push((json[i]));
                        console.log("Reading config " + serverCongfigs[i].name + "...");
                    }
                    winston.info("You have (" + serverCongfigs.length + ") configurations.", { process: process.pid });
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
