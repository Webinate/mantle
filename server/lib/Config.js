var fs = require("fs");
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
                        serverCongfigs.push((json[i]));
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
