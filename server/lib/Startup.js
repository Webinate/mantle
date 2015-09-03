var express = require("express");
var app = express(); // create our app with express
var fs = require("fs");
var winston = require("winston");
var yargs = require("yargs");
var readline = require("readline");
var MongoWrapper_1 = require("./MongoWrapper");
var UsersService_1 = require("./UsersService");
var Server_1 = require("./Server");
var EventManager_1 = require("./EventManager");
var config = null;
var arguments = yargs.argv;
// Saves logs to file
if (arguments.logFile && arguments.logFile.trim() != "")
    winston.add(winston.transports.File, { filename: arguments.logFile, maxsize: 50000000, maxFiles: 1, tailable: true });
// If no logging - remove all transports
if (arguments.logging && arguments.logging.toLowerCase().trim() == "false") {
    winston.clear();
}
// Make sure the config path argument is there
if (!arguments.config || arguments.config.trim() == "") {
    winston.error("No config file specified. Please start modepress with the config path in the argument list. Eg: node main.js --config='./config.js'", { process: process.pid });
    process.exit();
}
// Make sure the file exists
if (!fs.existsSync(arguments.config)) {
    winston.error("Could not locate the config file at '" + arguments.config + "'", { process: process.pid });
    process.exit();
}
try {
    // Try load and parse the config
    config = JSON.parse(fs.readFileSync(arguments.config, "utf8"));
}
catch (err) {
    winston.error("Could not parse the config file - make sure its valid JSON", { process: process.pid });
    process.exit();
}
// Attempt to connect to Users
if (config.usersSocketURL != "") {
    winston.info("Attempting to connect to users socket at: '" + config.usersSocketURL + "'", { process: process.pid });
    new EventManager_1.EventManager(config).init().catch(function (err) {
        winston.error("Could not connect to user socket even though it was specified at: '" + config.usersSocketURL + "'", { process: process.pid });
        process.exit();
    });
}
winston.info("Attempting to connect to mongodb...", { process: process.pid });
MongoWrapper_1.MongoWrapper.connect(config.databaseHost, config.databasePort, config.databaseName).then(function (db) {
    // Database loaded
    winston.info("Successfully connected to '" + config.databaseName + "' at " + config.databaseHost + ":" + config.databasePort, { process: process.pid });
    winston.info("Starting up HTTP servers...", { process: process.pid });
    // Create each of your controllers here
    var promises = [];
    UsersService_1.UsersService.getSingleton(config);
    // Load the controllers
    for (var i = 0, l = config.servers.length; i < l; i++) {
        var server = new Server_1.Server(config.servers[i], config, db);
        promises.push(server.initialize(db));
    }
    // Return a promise once all the controllers are complete
    Promise.all(promises).then(function (e) {
        winston.info("Servers up and runnning", { process: process.pid });
        // Create the readline interface
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // Set the prompt to be a >
        rl.setPrompt('> ', 2);
        rl.prompt();
        var heapdump = null;
        // Now each time the user hits enter
        rl.on("line", function (line) {
            switch (line.trim()) {
                case 'debug':
                    try {
                        if (!heapdump)
                            heapdump = require('heapdump');
                        if (!fs.existsSync("./snapshots")) {
                            fs.mkdirSync("snapshots");
                            console.log("Created folder snapshots");
                        }
                        heapdump.writeSnapshot("./snapshots/" + Date.now() + ".heapsnapshot", function (err, filename) {
                            if (err)
                                console.log("An error occurred while writing to heapdump " + err.toString());
                            else
                                console.log("Heapdump saved to " + filename);
                        });
                    }
                    catch (err) {
                        console.log("An error has occurred: " + err.toString());
                        if (!heapdump) {
                            console.log("Heapdump is not installed.");
                            console.log("Please run 'npm install heapdump' to download the module");
                            console.log("Then run 'node-gyp configure build' to install it.");
                        }
                    }
                    break;
                case "exit":
                    console.log("Bye!");
                    process.exit(0);
                case "gc":
                    if (global && global.gc) {
                        global.gc();
                        console.log("Forced a garbge collection");
                    }
                    else
                        console.log("You cannot force garbage collection without adding the command line argument --expose-gc eg: 'node --expose-gc test.js'");
                    break;
                default:
                    console.log("Sorry, command not recognised: '" + line.trim() + "'");
                    break;
            }
            rl.prompt();
        });
    }).catch(function (e) {
        winston.error(e.message, { process: process.pid });
    });
}).catch(function (error) {
    // Error occurred
    winston.error("An error has occurred: " + error.message + " @" + error.stack, { process: process.pid }, function () {
        process.exit();
    });
});
