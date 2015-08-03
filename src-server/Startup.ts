import * as express from "express";
var app = express();									// create our app with express
import * as morgan from "morgan";						// log requests to the console
import * as mongodb from "mongodb";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as winston from "winston";
import * as yargs from "yargs";
import * as readline from "readline";
import * as compression from "compression";
import {MongoWrapper} from "./lib/MongoWrapper";
import {IConfig, IPath} from "./lib/Config";
import {Controller} from "./lib/controllers/Controller"
import PostsController from "./lib/controllers/PostsController";
import EmailsController from "./lib/controllers/EmailsController";
import PageRenderer from "./lib/controllers/PageRenderer";
import {UsersService} from "./lib/UsersService";
import {PathHandler} from "./lib/PathHandler";
import {Server} from "./Server";

var config: IConfig = null;
var arguments = yargs.argv;

// Saves logs to file
if (arguments.logFile && arguments.logFile.trim() != "")
    winston.add(winston.transports.File, { filename: arguments.logFile, maxsize: 50000000, maxFiles: 1, tailable: true });


// If no logging - remove all transports
if (arguments.logging && arguments.logging.toLowerCase().trim() == "false")
{
    winston.clear();
}

// Make sure the config path argument is there
if (!arguments.config || arguments.config.trim() == "")
{
    winston.error("No config file specified. Please start modepress with the config path in the argument list. Eg: node main.js --config='./config.js'", { process: process.pid });
    process.exit();
}

// Make sure the file exists
if (!fs.existsSync(arguments.config))
{
    winston.error(`Could not locate the config file at '${arguments.config}'`, { process: process.pid });
    process.exit();
}

try
{
    // Try load and parse the config
    config = JSON.parse(fs.readFileSync(arguments.config, "utf8"));
}
catch(err)
{
    winston.error(`Could not parse the config file - make sure its valid JSON`, { process: process.pid });
    process.exit();
}


winston.info(`Attempting to connect to mongodb...`, { process: process.pid });
MongoWrapper.connect(config.databaseHost, config.databasePort, config.databaseName).then(function (db)
{
    // Database loaded
    winston.info(`Successfully connected to '${config.databaseName}' at ${config.databaseHost}:${config.databasePort}`, { process: process.pid });
    winston.info(`Starting up HTTP servers...`, { process: process.pid });
    
    // Create each of your controllers here
    var promises: Array<Promise<any>> = [];

    UsersService.getSingleton(config.usersURL);
  
    // Load the controllers
    for (var i = 0, l = config.servers.length; i < l; i++)
    {
        var server = new Server(config.servers[i], config, db);
        promises.push(server.initialize(db));
    }
    
    // Return a promise once all the controllers are complete
    Promise.all(promises).then(function (e)
    {
        winston.info(`Servers up and runnning`, { process: process.pid });

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
        rl.on("line", function (line: string)
        {
            switch (line.trim())
            {
                case 'debug':
                    try
                    {
                        if (!heapdump)
                            heapdump = require('heapdump');

                        if (!fs.existsSync("./snapshots"))
                        {
                            fs.mkdirSync("snapshots");
                            console.log(`Created folder snapshots`);
                        }

                        heapdump.writeSnapshot(`./snapshots/${Date.now() }.heapsnapshot`, function (err: Error, filename: string)
                        {
                            if (err)
                                console.log(`An error occurred while writing to heapdump ${err.toString() }`);
                            else
                                console.log(`Heapdump saved to ${filename}`);
                        });
                    }
                    catch (err)
                    {
                        console.log(`An error has occurred: ${err.toString() }`);

                        if (!heapdump)
                        {
                            console.log(`Heapdump is not installed.`);
                            console.log(`Please run 'npm install heapdump' to download the module`);
                            console.log(`Then run 'node-gyp configure build' to install it.`);
                        }
                    }

                    break;
                case "exit":
                    console.log(`Bye!`);
                    process.exit(0);
                case "gc":

                    if (global && global.gc)
                    {
                        global.gc();
                        console.log(`Forced a garbge collection`);
                    }
                    else
                        console.log(`You cannot force garbage collection without adding the command line argument --expose-gc eg: 'node --expose-gc test.js'`);

                    break;
                default:
                    console.log(`Sorry, command not recognised: '${line.trim() }'`);
                    break;
            }

            rl.prompt();
        });

    }).catch(function (e: Error)
    {
        winston.error(e.message, { process: process.pid });
    });
    
}).catch(function (error: Error)
{
    // Error occurred
    winston.error(`An error has occurred: ${error.message} @${(<any>error).stack}`, { process: process.pid }, function ()
    {
        process.exit()
    });
});