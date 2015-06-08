// set up ========================
var express = require("express");
var app = express(); // create our app with express
var morgan = require("morgan"); // log requests to the console
var bodyParser = require("body-parser"); // pull information from HTML POST
var methodOverride = require("method-override"); // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
var http = require("http");
var https = require("https");
var fs = require("fs");
var colors = require("webinate-colors");
// Custom imports
var MongoWrapper_1 = require("./lib/MongoWrapper");
var Config_1 = require("./lib/Config");
var PostsController_1 = require("./lib/controllers/PostsController");
var EmailsController_1 = require("./lib/controllers/EmailsController");
var UsersService_1 = require("./lib/UsersService");
var PathHandler_1 = require("./lib/PathHandler");
var config = null;
// Make sure the config path argument is there
if (process.argv.length < 3) {
    colors.log(colors.red("No config file specified. Please start modepress with the config path in the argument list. Eg: node main.js ./config.js debug"));
    process.exit();
}
// Make sure the config name argument is there
if (process.argv.length < 4) {
    colors.log(colors.red("No config name specified in the argument list. Eg: node main.js ./config.js debug"));
    process.exit();
}
// Make sure the file exists
if (!fs.existsSync(process.argv[2])) {
    colors.log(colors.red("Could not locate the config file at '" + process.argv[2] + "'"));
    process.exit();
}
// Load a config file
Config_1.loadConfig(process.argv[3], process.argv[2])
    .then(function (cfg) {
    config = cfg;
    console.log("Attempting to connect to mongodb...");
    return MongoWrapper_1.MongoWrapper.connect(config.host, config.portDatabase, config.databaseName);
}).then(function (db) {
    // Database loaded
    console.log("Successfully connected to '" + config.databaseName + "' at " + config.host + ":" + config.portDatabase);
    console.log("Starting up HTTP" + (config.ssl ? "S" : "") + " server at " + config.host + ":" + config.portHTTP + "...");
    // Add the static folder locations
    console.log("Adding resource folder " + __dirname + "/resources");
    app.use(express.static(__dirname + "/resources", {}));
    // User defined static folders
    for (var i = 0, l = config.staticFilesFolder.length; i < l; i++)
        app.use(express.static(config.staticFilesFolder[i], {}));
    // Setup the jade template engine
    app.set('view engine', 'jade');
    // Set any jade paths
    var allViewPaths = ['./views']; //admin path
    for (var i = 0, l = config.paths.length; i < l; i++) {
        if (config.paths[i].templatePath != "") {
            if (!fs.existsSync(config.paths[i].templatePath))
                colors.log(colors.yellow("The template path '" + config.paths[i].templatePath + "' does not exist"));
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
    UsersService_1.UsersService.getSingleton(config.usersURL);
    // Create each of your controllers here
    var controllerPromises = [];
    var controllers = [
        new EmailsController_1.EmailsController(app, config.emailAdmin, config.emailFrom, config.emailService, config.emailServiceUser, config.emailServicePassword),
        new PostsController_1.PostsController(app)
    ];
    // Send the jade index file
    app.get("(" + config.adminURL + "|" + config.adminURL + "/*)", function (req, res) {
        var requestIsSecure = req.connection.encrypted;
        // Get the base URL's
        var url = (requestIsSecure ? "https" : "http") + "://" + config.host + ":" + (requestIsSecure ? config.portHTTPS : config.portHTTP);
        var usersURL = "" + config.usersURL;
        console.log("Got request " + req.originalUrl + " - sending admin: ./views/index.jade");
        res.render('index', { usersURL: usersURL, url: url });
    });
    // Get the default page
    for (var i = 0, l = config.paths.length; i < l; i++) {
        var handler = new PathHandler_1.PathHandler(config.paths[i], config);
        app.get(config.paths[i].path, handler.handle.bind(handler));
    }
    console.log("Attempting to start HTTP server...");
    // Start app with node server.js 
    var httpServer = http.createServer(app);
    httpServer.listen(config.portHTTP);
    console.log("Listening on HTTP port " + config.portHTTP);
    // If we use SSL then start listening for that as well
    if (config.ssl) {
        if (config.sslIntermediate != "" && !fs.existsSync(config.sslIntermediate)) {
            colors.log(colors.red("Could not find sslIntermediate: '" + config.sslIntermediate + "'"));
            process.exit();
        }
        if (config.sslCert != "" && !fs.existsSync(config.sslCert)) {
            colors.log(colors.red("Could not find sslIntermediate: '" + config.sslCert + "'"));
            process.exit();
        }
        if (config.sslRoot != "" && !fs.existsSync(config.sslRoot)) {
            colors.log(colors.red("Could not find sslIntermediate: '" + config.sslRoot + "'"));
            process.exit();
        }
        if (config.sslKey != "" && !fs.existsSync(config.sslKey)) {
            colors.log(colors.red("Could not find sslIntermediate: '" + config.sslKey + "'"));
            process.exit();
        }
        var caChain = [fs.readFileSync(config.sslIntermediate), fs.readFileSync(config.sslRoot)];
        var privkey = config.sslKey ? fs.readFileSync(config.sslKey) : null;
        var theCert = config.sslCert ? fs.readFileSync(config.sslCert) : null;
        var port = config.portHTTPS ? config.portHTTPS : 443;
        console.log("Attempting to start SSL server...");
        var httpsServer = https.createServer({ key: privkey, cert: theCert, passphrase: config.sslPassPhrase, ca: caChain }, app);
        httpsServer.listen(port);
        console.log("Listening on HTTPS port " + port);
    }
    // Initialize all the controllers
    for (var i = 0, l = controllers.length; i < l; i++)
        controllerPromises.push(controllers[i].initialize(db));
    // Return a promise once all the controllers are complete
    Promise.all(controllerPromises).then(function (e) {
        colors.log(colors.green("All controllers are now setup successfully!"));
    }).catch(function (e) {
        colors.log(colors.red("ERROR: An error has occurred while setting up the controllers \"" + e.message + "\""));
    });
}).catch(function (error) {
    // Error occurred
    colors.log(colors.red("An error has occurred: " + error.message + " @" + error.stack));
    process.exit();
});
