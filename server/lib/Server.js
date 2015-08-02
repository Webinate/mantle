var express = require("express");
var app = express(); // create our app with express
var morgan = require("morgan"); // log requests to the console
var http = require("http");
var https = require("https");
var fs = require("fs");
var winston = require("winston");
var PostsController_1 = require("./controllers/PostsController");
var EmailsController_1 = require("./controllers/EmailsController");
var UsersService_1 = require("./UsersService");
var PathHandler_1 = require("./PathHandler");
var PageRenderer_1 = require("./controllers/PageRenderer");
var Server = (function () {
    function Server(config, db) {
        this._config = config;
        this._db = db;
        var app = express();
        // Add the static folder locations
        winston.info("Adding resource folder " + __dirname + "/resources", { process: process.pid });
        app.use(express.static(__dirname + "/resources", { maxAge: config.cacheLifetime }));
        // User defined static folders
        for (var i = 0, l = config.staticFilesFolder.length; i < l; i++)
            app.use(express.static(config.staticFilesFolder[i], { maxAge: config.cacheLifetime }));
        // Setup the jade template engine
        app.set('view engine', 'jade');
        // Set any jade paths
        var allViewPaths = ['./views']; //admin path
        for (var i = 0, l = config.paths.length; i < l; i++) {
            if (config.paths[i].templatePath != "") {
                if (!fs.existsSync(config.paths[i].templatePath))
                    winston.info("The template path '" + config.paths[i].templatePath + "' does not exist", { process: process.pid });
                else
                    allViewPaths.push(config.paths[i].templatePath);
            }
        }
        app.set('views', allViewPaths);
        // log every request to the console
        app.use(morgan('dev'));
        // Create the user server
        UsersService_1.UsersService.getSingleton(config.usersURL);
        // Create each of your controllers here
        var controllerPromises = [];
        var controllers = [
            new EmailsController_1.EmailsController(app, config.usersURL),
            new PostsController_1.PostsController(app)
        ];
        // If we have a modepress url, then use that 
        if (config.modepressRenderURL && config.modepressRenderURL.trim() != "") {
            winston.info("Modepress render attempting to listen on '" + config.modepressRenderURL + "'", { process: process.pid });
            controllers.splice(0, 0, new PageRenderer_1.PageRenderer(config, app));
        }
        // Send the jade index file
        app.get("(" + config.adminURL + "|" + config.adminURL + "/*)", function (req, res) {
            var requestIsSecure = (req.connection.encrypted || req.headers["x-forwarded-proto"] == "https" ? true : false);
            // Get the base URL's
            var url = (requestIsSecure ? "https" : "http") + "://" + config.host;
            var usersURL = "" + config.usersURL;
            winston.info("Got request " + req.originalUrl + " - sending admin: ./views/index.jade", { process: process.pid });
            res.render('index', { usersURL: usersURL, url: url, cacheURL: config.modepressRenderURL });
        });
        // Get the default page
        for (var i = 0, l = config.paths.length; i < l; i++) {
            var handler = new PathHandler_1.PathHandler(config.paths[i], config);
            app.get(config.paths[i].path, handler.handle.bind(handler));
        }
        winston.info("Attempting to start HTTP server...", { process: process.pid });
        // Start app with node server.js 
        var httpServer = http.createServer(app);
        httpServer.listen(config.portHTTP);
        winston.info("Listening on HTTP port " + config.portHTTP, { process: process.pid });
        // If we use SSL then start listening for that as well
        if (config.ssl) {
            if (config.sslIntermediate != "" && !fs.existsSync(config.sslIntermediate)) {
                winston.error("Could not find sslIntermediate: '" + config.sslIntermediate + "'", { process: process.pid });
                process.exit();
            }
            if (config.sslCert != "" && !fs.existsSync(config.sslCert)) {
                winston.error("Could not find sslIntermediate: '" + config.sslCert + "'", { process: process.pid });
                process.exit();
            }
            if (config.sslRoot != "" && !fs.existsSync(config.sslRoot)) {
                winston.error("Could not find sslIntermediate: '" + config.sslRoot + "'", { process: process.pid });
                process.exit();
            }
            if (config.sslKey != "" && !fs.existsSync(config.sslKey)) {
                winston.error("Could not find sslIntermediate: '" + config.sslKey + "'", { process: process.pid });
                process.exit();
            }
            var caChain = [fs.readFileSync(config.sslIntermediate), fs.readFileSync(config.sslRoot)];
            var privkey = config.sslKey ? fs.readFileSync(config.sslKey) : null;
            var theCert = config.sslCert ? fs.readFileSync(config.sslCert) : null;
            var port = config.portHTTPS ? config.portHTTPS : 443;
            winston.info("Attempting to start SSL server...", { process: process.pid });
            var httpsServer = https.createServer({ key: privkey, cert: theCert, passphrase: config.sslPassPhrase, ca: caChain }, app);
            httpsServer.listen(port);
            winston.info("Listening on HTTPS port " + port, { process: process.pid });
        }
        // Initialize all the controllers
        for (var i = 0, l = controllers.length; i < l; i++)
            controllerPromises.push(controllers[i].initialize(db));
        // Return a promise once all the controllers are complete
        Promise.all(controllerPromises).then(function (e) {
            winston.info("All controllers are now setup successfully!", { process: process.pid });
        }).catch(function (e) {
            winston.error("ERROR: An error has occurred while setting up the controllers \"" + e.message + "\"", { process: process.pid });
        });
    }
    return Server;
})();
exports.Server = Server;
