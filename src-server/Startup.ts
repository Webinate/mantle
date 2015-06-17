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
import {loadConfig, ServerConfig, IPath} from "./lib/Config";
import {Controller} from "./lib/controllers/Controller"
import {PostsController} from "./lib/controllers/PostsController";
import {EmailsController} from "./lib/controllers/EmailsController";
import {UsersService} from "./lib/UsersService";
import {PathHandler} from "./lib/PathHandler";

var config: ServerConfig = null;

// Saves logs to file
winston.add(winston.transports.File, { filename: "logs.log", maxsize: 50000000, maxFiles: 1, tailable: true });

// Make sure the config path argument is there
if (process.argv.length < 3)
{
    winston.error("No config file specified. Please start modepress with the config path in the argument list. Eg: node main.js ./config.js debug", { process: process.pid });
    process.exit();
}

// Make sure the config name argument is there
if (process.argv.length < 4)
{
    winston.error("No config name specified in the argument list. Eg: node main.js ./config.js debug", { process: process.pid });
    process.exit();
}

// Make sure the file exists
if (!fs.existsSync(process.argv[2]))
{
    winston.error(`Could not locate the config file at '${process.argv[2]}'`, { process: process.pid });
    process.exit();
}

// Load a config file
loadConfig(process.argv[3], process.argv[2])

// Config file is loaded
.then(function (cfg)
{
    config = cfg;
    winston.info(`Attempting to connect to mongodb...`, { process: process.pid });
    return MongoWrapper.connect(config.databaseHost, config.databasePort, config.databaseName);

}).then(function (db)
{
    // Database loaded
    winston.info(`Successfully connected to '${config.databaseName}' at ${config.databaseHost}:${config.databasePort}`, { process: process.pid });
    winston.info(`Starting up HTTP${config.ssl ? "S" : ""} server at ${config.host}:${config.portHTTP}...`, { process: process.pid });
    
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
        new EmailsController(app, config.emailAdmin, config.emailFrom,
            config.emailService, config.emailServiceUser, config.emailServicePassword),
        new PostsController(app)
    ];
    

    // Send the jade index file
    app.get(`(${config.adminURL}|${config.adminURL}/*)`, function (req, res)
    {
        var requestIsSecure = (<any>req.connection).encrypted;
        
        // Get the base URL's
        var url = `${(requestIsSecure ? "https" : "http") }://${config.host}:${requestIsSecure ? config.portHTTPS : config.portHTTP }`;
        var usersURL = `${config.usersURL}`;

        winston.info(`Got request ${req.originalUrl} - sending admin: ./views/index.jade`, { process: process.pid });
        res.render('index', { usersURL: usersURL, url: url });
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

    }).catch(function (e: Error)
    {
        winston.error(`ERROR: An error has occurred while setting up the controllers "${e.message}"`, { process: process.pid });
    });

}).catch(function (error: Error)
{
    // Error occurred
    winston.error(`An error has occurred: ${error.message} @${(<any>error).stack}`, { process: process.pid });
    process.exit();
});