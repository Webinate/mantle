// set up ========================
import * as express from "express";
var app = express();									// create our app with express
import * as morgan from "morgan";						// log requests to the console
import * as bodyParser from "body-parser";				// pull information from HTML POST
import * as methodOverride from "method-override";		// Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
import * as mongodb from "mongodb";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as colors from "webinate-colors";

// Custom imports
import {MongoWrapper} from "./lib/MongoWrapper";
import {loadConfig, ServerConfig} from "./lib/Config";
import {Controller} from "./lib/controllers/Controller"
import {PostsController} from "./lib/controllers/PostsController";
import {EmailsController} from "./lib/controllers/EmailsController";
import {UsersService} from "./lib/UsersService";

var config: ServerConfig = null;

// Make sure the config path argument is there
if (process.argv.length < 3)
{
    colors.log(colors.red("No config file specified. Please start modepress with the config path in the argument list. Eg: node main.js ./config.js debug"));
    process.exit();
}

// Make sure the config name argument is there
if (process.argv.length < 4)
{
    colors.log(colors.red("No config name specified in the argument list. Eg: node main.js ./config.js debug"));
    process.exit();
}

// Make sure the file exists
if (!fs.existsSync(process.argv[2]))
{
    colors.log(colors.red(`Could not locate the config file at '${process.argv[2]}'`));
    process.exit();
}

// Load a config file
loadConfig(process.argv[3], process.argv[2] )

// Config file is loaded
.then(function (cfg)
{
	config = cfg;
	console.log(`Attempting to connect to mongodb...`);
	return MongoWrapper.connect(config.host, config.portDatabase, config.databaseName);

}).then(function (db)
{
	// Database loaded
	console.log(`Successfully connected to '${config.databaseName}' at ${config.host}:${config.portDatabase}`);
	console.log(`Starting up HTTP${config.ssl ? "S" : ""} server at ${config.host}:${config.portHTTP}...`);
    
    // Add the static folder locations
    console.log(`Adding resource folder ${__dirname}/resources`);
    app.use(express.static(`${__dirname}/resources`, {}));

    // User defined static folders
    for (var i = 0, l = config.staticFilesFolder.length; i < l; i++ )
        app.use(express.static(config.staticFilesFolder[i], {}));
    
    // Setup the jade template engine
    app.set('views', './views');
    app.set('view engine', 'jade');
    
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
    

    // Get the default page
    app.get(`(${config.adminURL}|${config.adminURL}/*)`, function (req, res)
    {
        var requestIsSecure = (<any>req.connection).encrypted;
        
        // Get the base URL's
        var url = `${(requestIsSecure ? "https" : "http") }://${config.host}:${requestIsSecure ? config.portHTTPS : config.portHTTP }`;
        var usersURL = `${config.usersURL}`;

        console.log(`Got request ${req.originalUrl} - sending admin: ./views/index.jade`);
        res.render('index', { usersURL: usersURL, path: url  });
	});
	
	// Get the default page
	app.get("*", function(req, res)
	{
		// Load the single view file (angular will handle the page changes on the front-end)
		res.sendfile(config.html);
	});

	console.log(`Attempting to start HTTP server...`);

	// Start app with node server.js 
	var httpServer = http.createServer(app);
	httpServer.listen(config.portHTTP);
	console.log(`Listening on HTTP port ${config.portHTTP}`);

	// If we use SSL then start listening for that as well
	if (config.ssl)
    {
        if (config.sslIntermediate != "" && !fs.existsSync(config.sslIntermediate) )
        { 
            colors.log(colors.red(`Could not find sslIntermediate: '${config.sslIntermediate}'`));
            process.exit();
        }

        if (config.sslCert != "" && !fs.existsSync(config.sslCert))
        {
            colors.log(colors.red(`Could not find sslIntermediate: '${config.sslCert}'`));
            process.exit();
        }

        if (config.sslRoot != "" && !fs.existsSync(config.sslRoot))
        {
            colors.log(colors.red(`Could not find sslIntermediate: '${config.sslRoot}'`));
            process.exit();
        }

        if (config.sslKey != "" && !fs.existsSync(config.sslKey))
        {
            colors.log(colors.red(`Could not find sslIntermediate: '${config.sslKey}'`));
            process.exit();
        }

        var caChain = [fs.readFileSync(config.sslIntermediate), fs.readFileSync(config.sslRoot)];
        var privkey = config.sslKey ? fs.readFileSync(config.sslKey) : null;
        var theCert = config.sslCert ? fs.readFileSync(config.sslCert) : null;
        var port = config.portHTTPS ? config.portHTTPS : 443;

        console.log(`Attempting to start SSL server...`);

        var httpsServer = https.createServer({ key: privkey, cert: theCert, passphrase: config.sslPassPhrase, ca: caChain }, app);
        httpsServer.listen(port);

        console.log(`Listening on HTTPS port ${port}`);
	}

	// Initialize all the controllers
	for (var i = 0, l = controllers.length; i < l; i++)
		controllerPromises.push(controllers[i].initialize(db));
	
	// Return a promise once all the controllers are complete
	Promise.all(controllerPromises).then(function (e)
	{
		colors.log(colors.green(`All controllers are now setup successfully!`));

	}).catch(function (e: Error)
	{
		colors.log( colors.red(`ERROR: An error has occurred while setting up the controllers "${e.message}"`) );
	});

}).catch(function (error: Error)
{
	// Error occurred
	colors.log( colors.red(`An error has occurred: ${error.message} @${(<any>error).stack}`) );
	process.exit();
});