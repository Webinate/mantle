import * as express from "express";
var app = express();									// create our app with express
import * as morgan from "morgan";						// log requests to the console
import * as bodyParser from "body-parser";				// pull information from HTML POST
import * as methodOverride from "method-override";		// Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
import * as mongodb from "mongodb";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as winston from "winston";
import {MongoWrapper} from "./lib/MongoWrapper";
import {IServerConfig, IPath} from "./lib/Config";
import {Controller} from "./lib/controllers/Controller"
import {PostsController} from "./lib/controllers/PostsController";
import {EmailsController} from "./lib/controllers/EmailsController";
import {UsersService} from "./lib/UsersService";
import {PathHandler} from "./lib/PathHandler";
import {PageRenderer} from "./lib/controllers/PageRenderer";
import * as yargs from "yargs";
import * as readline from "readline";
import * as compression from "compression";

var config: IServerConfig = null;
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
    winston.error(`Could not parge the config file - make sure its valid JSON`, { process: process.pid });
    process.exit();
}


winston.info(`Attempting to connect to mongodb...`, { process: process.pid });
MongoWrapper.connect(config.databaseHost, config.databasePort, config.databaseName).then(function (db)
{
    // Database loaded
    winston.info(`Successfully connected to '${config.databaseName}' at ${config.databaseHost}:${config.databasePort}`, { process: process.pid });
    winston.info(`Starting up HTTP${config.ssl ? "S" : ""} server at ${config.host}:${config.portHTTP}...`, { process: process.pid });
    
    // Enable GZIPPING
    app.use(compression());

    // Add the static folder locations
    winston.info(`Adding resource folder ${__dirname}/resources`, { process: process.pid });
    app.use(express.static(`${__dirname}/resources`, { maxAge: config.cacheLifetime }));

    // User defined static folders
    for (var i = 0, l = config.staticFilesFolder.length; i < l; i++)
        app.use(express.static(config.staticFilesFolder[i], { maxAge: config.cacheLifetime }));
    
    // Setup the jade template engine
    app.set('view engine', 'jade');
    
    // Set any jade paths
    var allViewPaths = ['./views']; //admin path
    for (var i = 0, l = config.paths.length; i < l; i++)
    {
        if (config.paths[i].templatePath != "")
        {
            if (!fs.existsSync(config.paths[i].templatePath))
                winston.info(`The template path '${config.paths[i].templatePath}' does not exist`, { process: process.pid });
            else
                allViewPaths.push(config.paths[i].templatePath);
        }
    }

    app.set('views', allViewPaths);
    
    // log every request to the console
    app.use(morgan('dev'));
    
    // Set the appropriate middlewares
    app.use(bodyParser.urlencoded({ 'extended': true }));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());

    UsersService.getSingleton(config.usersURL);
	
    // Create each of your controllers here
    var controllerPromises: Array<Promise<any>> = [];
    var controllers: Array<Controller> = [
        new EmailsController(app, config.usersURL),
        new PostsController(app)
    ];

    

    // If we have a modepress url, then use that 
    if (config.modepressRenderURL && config.modepressRenderURL.trim() != "")
    {
        winston.info(`Modepress render attempting to listen on '${config.modepressRenderURL}'`, { process: process.pid });
        controllers.splice(0,0, new PageRenderer(config, app));
    }

    // Send the jade index file
    app.get(`(${config.adminURL}|${config.adminURL}/*)`, function (req, res)
    {
        var requestIsSecure = ((<any>req.connection).encrypted || req.headers["x-forwarded-proto"] == "https" ? true : false );
        
        // Get the base URL's
        var url = `${(requestIsSecure ? "https" : "http") }://${config.host}`;
        var usersURL = `${config.usersURL}`;

        winston.info(`Got request ${req.originalUrl} - sending admin: ./views/index.jade`, { process: process.pid });
        res.render('index', { usersURL: usersURL, url: url, cacheURL: config.modepressRenderURL });
    });
	
    // Get the default page
    for (var i = 0, l = config.paths.length; i < l; i++)
    {
        var handler = new PathHandler(config.paths[i], config);
        app.get(config.paths[i].path, handler.handle.bind(handler));
    }


    winston.info(`Attempting to start HTTP server...`, { process: process.pid });

    // Start app with node server.js 
    var httpServer = http.createServer(app);
    httpServer.listen(config.portHTTP);
    winston.info(`Listening on HTTP port ${config.portHTTP}`, { process: process.pid });

    // If we use SSL then start listening for that as well
    if (config.ssl)
    {
        if (config.sslIntermediate != "" && !fs.existsSync(config.sslIntermediate))
        {
            winston.error(`Could not find sslIntermediate: '${config.sslIntermediate}'`, { process: process.pid });
            process.exit();
        }

        if (config.sslCert != "" && !fs.existsSync(config.sslCert))
        {
            winston.error(`Could not find sslIntermediate: '${config.sslCert}'`, { process: process.pid });
            process.exit();
        }

        if (config.sslRoot != "" && !fs.existsSync(config.sslRoot))
        {
            winston.error(`Could not find sslIntermediate: '${config.sslRoot}'`, { process: process.pid });
            process.exit();
        }

        if (config.sslKey != "" && !fs.existsSync(config.sslKey))
        {
            winston.error(`Could not find sslIntermediate: '${config.sslKey}'`, { process: process.pid });
            process.exit();
        }

        var caChain = [fs.readFileSync(config.sslIntermediate), fs.readFileSync(config.sslRoot)];
        var privkey = config.sslKey ? fs.readFileSync(config.sslKey) : null;
        var theCert = config.sslCert ? fs.readFileSync(config.sslCert) : null;
        var port = config.portHTTPS ? config.portHTTPS : 443;

        winston.info(`Attempting to start SSL server...`, { process: process.pid });

        var httpsServer = https.createServer({ key: privkey, cert: theCert, passphrase: config.sslPassPhrase, ca: caChain }, app);
        httpsServer.listen(port);

        winston.info(`Listening on HTTPS port ${port}`, { process: process.pid });
    }
    
    // Initialize all the controllers
    for (var i = 0, l = controllers.length; i < l; i++)
        controllerPromises.push(controllers[i].initialize(db));
	
    // Return a promise once all the controllers are complete
    Promise.all(controllerPromises).then(function (e)
    {
        winston.info(`All controllers are now setup successfully!`, { process: process.pid });

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
        rl.on("line", function (line : string)
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

                        heapdump.writeSnapshot(`./snapshots/${Date.now()}.heapsnapshot`, function(err: Error, filename : string)
                        {
                            if (err)
                                console.log(`An error occurred while writing to heapdump ${err.toString()}`);
                            else
                                console.log(`Heapdump saved to ${filename}`);
                        });
                    }
                    catch(err)
                    {
                        console.log(`An error has occurred: ${err.toString()}`);

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
                    console.log(`Sorry, command not recognised: '${line.trim()}'`);
                    break;
            }

            rl.prompt();
        });

    }).catch(function (e: Error)
    {
        winston.error(`ERROR: An error has occurred while setting up the controllers "${e.message}"`, { process: process.pid });
    });
    
}).catch(function (error: Error)
{
    // Error occurred
    winston.error(`An error has occurred: ${error.message} @${(<any>error).stack}`, { process: process.pid }, function ()
    {
        process.exit()
    });
});