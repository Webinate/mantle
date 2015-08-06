var http = require("http");
var https = require('https');
var mongodb = require("mongodb");
//import url = require( "url" );
var homeCtrl = require("./controllers/HomeController");
var utils = require("./Utils");
var Model = require("./models/Model");
var logger = require("./Logger");
var fs = require("fs");
var path = require("path");
var HTMLRenderer = require("./views/HTMLRenderer");
/**
* Creates a new server instance that listens for incoming requests on a host an port number
*/
var Server = (function () {
    /**
    * Creates an instance of the server
    */
    function Server(port, hostName, dbPort) {
        if (port === void 0) { port = 1337; }
        if (hostName === void 0) { hostName = "127.0.0.1"; }
        if (dbPort === void 0) { dbPort = 8000; }
        this._port = port;
        this._host = hostName;
        this._dbport = dbPort;
        // Create the http server
        if (utils.config.privateKey && utils.config.certificate) {
            logger.log("Creating secure server...");
            this._server = https.createServer({ key: utils.config.privateKey, ca: utils.config.ca, cert: utils.config.certificate, passphrase: utils.config.sslPassPhrase }, this.onRequest.bind(this));
        }
        else {
            logger.log("Creating server...");
            this._server = http.createServer(this.onRequest.bind(this));
        }
        logger.log("*******************************\n" +
            "****** Loading Animate... *****\n" +
            "*******************************", logger.LogType.SUCCESS);
        // Listen on the port and hostname
        logger.log("Connecting to http port on: " + port + "...");
        this._server.listen(port, hostName);
        // Add server events 
        logger.log("Adding key bindings...");
        process.stdin.on("data", this.onInput.bind(this));
        try {
            // Connnect to the mongo database
            logger.log("Connecting to database: mongodb://" + hostName + ":" + dbPort + "/animate ...");
            var mongoServer = new mongodb.Server(hostName, dbPort, { auto_reconnect: true });
            var mongoDB = new mongodb.Db("animate", mongoServer, { w: 1 });
            mongoDB.open(this.onDBInitialized.bind(this));
        }
        catch (err) {
            logger.log(err, logger.LogType.ERROR);
            logger.log("Could not connect to mongo. Shutting down...", logger.LogType.ERROR);
            process.exit();
        }
    }
    /**
    * Called when mongo db is initialized
    */
    Server.prototype.onDBInitialized = function (err, db) {
        if (err || !db) {
            logger.log("Could not connect to the animate database. " + err, logger.LogType.ERROR);
            logger.log("Exiting...", logger.LogType.ERROR);
            this.shutdown();
            return;
        }
        logger.log("Successfully connected to database server on port " + this._dbport + "...", logger.LogType.SUCCESS);
        // Create the model
        var model = Model.getSingleton(db);
        model.addListener("error", this.onModelError.bind(this));
        model.addListener("ready", this.ready.bind(this));
        model.initializeCollections();
    };
    Server.prototype.onModelError = function (err) {
        logger.log(err, logger.LogType.ERROR);
        logger.log("Exiting...", logger.LogType.ERROR);
        this.shutdown();
    };
    /**
    * Called when the server is ready to go!
    */
    Server.prototype.ready = function () {
        logger.log("Server running at //" + this._host + ":" + this._port.toString() + "/", logger.LogType.SUCCESS);
        logger.log(utils.ConsoleStyles.bold[0] + "Animate server up and running!" + utils.ConsoleStyles.bold[1], logger.LogType.SUCCESS);
        logger.log("Type " + utils.ConsoleStyles.yellow[0] + "'help'" + utils.ConsoleStyles.yellow[1] + " to get a list of commands available to use");
    };
    /**
    * Called whenever we get a console message from the user
    */
    Server.prototype.onInput = function (buffer) {
        var text = buffer.toString().trim();
        var func = "";
        var optionsArr = text.split("--");
        var options = {};
        var commands = optionsArr[0].split(" ");
        text = commands[0].trim();
        if (commands.length > 1)
            func = commands[1].trim();
        optionsArr = optionsArr.slice(1, optionsArr.length);
        for (var i = 0; i < optionsArr.length; i++) {
            var parts = optionsArr[i].split(" ");
            options[parts[0]] = parts.splice(1, parts.length).join(" ").trim();
        }
        switch (text) {
            case utils.serverCommands.EXIT:
                this.shutdown();
                break;
            case utils.serverCommands.CLEAR:
                console.clear();
                break;
            case utils.serverCommands.HELP:
                this.printHelpScreen();
                break;
            default:
                var controller = homeCtrl.HomeController.singleton;
                controller.commandOptions = options;
                controller.processCommand(text, func, null, null);
                controller.commandOptions = null;
                break;
        }
    };
    /**
    * Turns off the animate server
    */
    Server.prototype.shutdown = function () {
        if (this._mongoDB)
            this._mongoDB.close();
        logger.log("Goodbye!", logger.LogType.SUCCESS);
        process.exit();
    };
    /**
    * Prints the help screen that shows available commands
    */
    Server.prototype.printHelpScreen = function () {
        logger.log("\n\nHelp\n**********");
        logger.log(utils.serverCommands.HELP + "\t\t- Displays a list of Animate server commands");
        logger.log(utils.serverCommands.EXIT + "\t\t- Exits the Animate server");
        logger.log(utils.serverCommands.CLEAR + "\t\t- Clears the console");
        logger.log("\n");
    };
    /**
    * Called whenever a request is made to the server
    */
    Server.prototype.onRequest = function (request, response) {
        // Check for option queries
        if (this.handleOptionQuery(request, response))
            return;
        // Check if the request is a resource - if it is, then return it
        if (this.processResourceRequest(request, response))
            return;
        var queryData = "";
        var that = this;
        homeCtrl.HomeController.singleton.processRequest(request, response, "");
    };
    /**
    * This method checks for an OPTIONS request. Typically option requests are made by the browser
    * to query server capabilities.
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    * @returns {boolean} Returns true if the request was handled
    */
    Server.prototype.handleOptionQuery = function (request, response) {
        // Check to see if this is a security check by the browser to
        // test the availability of the API for the client. If the
        // method is OPTIONS, the browser is check to see to see what
        // HTTP methods (and properties) have been granted to the
        // client.
        if (request.method.toUpperCase() === "OPTIONS" && request.headers.origin) {
            if (request.headers.origin.match(/webinate\.net/)
                || request.headers.origin.match(/animate\.webinate\.net/)
                || request.headers.origin.match(/localhost/)
                || request.headers.origin.match(/localhost\.com/)
                || request.headers.origin.match(/localhost\.local/)
                || request.headers.origin.match(/animatetest\.com/)) {
                response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
                response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Mime-Type, X-File-Name, Cache-Control');
                response.setHeader("Access-Control-Allow-Credentials", "true");
                response.setHeader("Content-Length", "0");
            }
            ;
            response.writeHead(200, { "Content-Type": "text/html" });
            response.end();
            return true;
        }
        else
            return false;
    };
    /**
    * Checks a request to see if its a resource. If it is, then it will try to download it
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    * @returns {boolean} Returns true if the request was handled
    */
    Server.prototype.processResourceRequest = function (request, response) {
        // We need to figure out what extension is being sought.
        var filename = request.url || "index.html";
        var ext = path.extname(request.url).toLowerCase();
        var resourceExtensions = {
            ".html": "text/html",
            ".obj": "application/octet-stream",
            ".js": "application/javascript",
            ".css": "text/css",
            ".txt": "text/plain",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".png": "image/png",
            ".adf": "application/octet-stream" //Animate data file
        };
        if (resourceExtensions[ext] && fs.existsSync(__dirname + "/../.." + filename)) {
            logger.log("Fetching HTML resource [" + __dirname + "/../.." + filename + "]");
            new HTMLRenderer().renderFile(__dirname + "/../.." + filename, resourceExtensions[ext], request, response);
            return true;
        }
        else
            return false;
    };
    return Server;
})();
exports.Server = Server;
