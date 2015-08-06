var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseController = require("./BaseController");
var ErrorController = require("./ErrorController");
var viewJSON = require("../views/JSONRenderer");
var utils = require("../Utils");
var Model = require("../models/Model");
var projectModel = require("../models/ProjectModel");
var buildModel = require("../models/BuildModel");
var mongodb = require("mongodb");
var UserController = require("./UserController");
var ProjectController = require("./ProjectController");
var logger = require("../Logger");
var fs = require("fs");
/**
* Controlls all project related functions
*/
var ExportController = (function (_super) {
    __extends(ExportController, _super);
    /**
    * Creates an instance of the Controller class
    */
    function ExportController() {
        _super.call(this);
    }
    /**
    * Called whenever we need to process
    */
    ExportController.prototype.processRequest = function (request, response, functionName) {
        var that = this;
        logger.log("Processing export request '" + functionName + "'");
        this.processQueryData(function (options) {
            switch (functionName) {
                case "compile":
                    that.compile(options["projectId"], options["json"], null, request, response);
                    break;
                default:
                    new ErrorController(utils.ErrorCodes.INVALID_INPUT, "No function specified").processRequest(request, response, functionName);
                    break;
            }
        }, request, response);
    };
    /**
    * Use this function build a script which contains all custom scripts created in the project
    * @param {projectModel.Project} proj The project we are working with
    * @param {( success : boolean, scriptStr : string ) => void} callback An optional callback function
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    ExportController.prototype.buildScriptBehaviours = function (proj, callback, request, response) {
        logger.log("Building scripts string...");
        var toRet = [
            "var __extends = this.__extends || function ( d, b )",
            "{",
            "	for ( var p in b ) if ( b.hasOwnProperty( p ) ) d[p] = b[p];",
            "	function __() { this.constructor = d; }",
            "	__.prototype = b.prototype;",
            "	d.prototype = new __();",
            "};",
            "var Animate;",
            "( function ( Animate ) {"
        ].join("\n");
        Model.collections("scripts").find({ project_id: proj._id }, function (err, cursor) {
            if (err)
                return callback(false, "");
            cursor.toArray(function (err, scripts) {
                if (scripts === void 0) { scripts = []; }
                if (err)
                    return callback(false, "");
                var scriptClassName = "";
                for (var i = 0, l = scripts.length; i < l; i++) {
                    scriptClassName = "_AnCS" + scripts[i].shallowId.toString();
                    toRet +=
                        [
                            "var " + scriptClassName + " = ( function ( _super )",
                            "{",
                            "	__extends( " + scriptClassName + ", _super );",
                            "	function " + scriptClassName + "( runtime )",
                            "	{",
                            "		_super.call( this, runtime );",
                            "	}",
                            // CLONE FUNCTION 
                            "	" + scriptClassName + ".prototype.clone = function ( clone )",
                            "	{",
                            "		// Call super",
                            "		return _super.prototype.clone.call( this, new Animate." + scriptClassName + "( this.runtime) );",
                            "	};",
                            // ENTER FUNCTION 
                            "	" + scriptClassName + ".prototype.enter = function ( portalName, portal )",
                            "	{",
                            "		// Call super",
                            "		_super.prototype.enter.call( this, portalName, portal );",
                            scripts[i].onEnter,
                            "	};",
                            // DISPOSE FUNCTION
                            "	" + scriptClassName + ".prototype.dispose = function()",
                            "	{",
                            "		// Call super",
                            "		_super.prototype.dispose.call( this );",
                            scripts[i].onDispose,
                            "	};",
                            // FRAME FUNCTION
                            "	" + scriptClassName + ".prototype.onFrame = function ( totalTime, delta )",
                            "	{",
                            "		// Call super",
                            "		_super.prototype.onFrame.call( this, totalTime, delta );",
                            scripts[i].onFrame,
                            "	};",
                            // INIT FUNCTION
                            "	" + scriptClassName + ".prototype.onInitialize = function ()",
                            "	{",
                            "		// Call super",
                            "		_super.prototype.onInitialize.call( this );",
                            scripts[i].onInitialize,
                            "	};",
                            "	return " + scriptClassName + ";",
                            "})( Animate.Behaviour );",
                            "Animate." + scriptClassName + " = " + scriptClassName + ";",
                        ].join("\n");
                }
                toRet += "})( Animate || ( Animate = {}) );";
                logger.log("Scripts string complete...");
                callback(true, toRet);
            });
        });
    };
    /**
    * Use this function compile a project for the currently selected build
    * @param {string} projectId The ID of the project
    * @param {string} json The compiled JSON of the project
    * @param {(success : boolean ) => void} callback An optional callback function
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    ExportController.prototype.compile = function (projectId, json, callback, request, response) {
        if (json === void 0) { json = ""; }
        if (request === void 0) { request = null; }
        if (response === void 0) { response = null; }
        var that = this;
        if (!json) {
            if (callback)
                return callback(false);
            else
                return new ErrorController(utils.ErrorCodes.INVALID_OPTION, "Please specify a valid JSON").processRequest(request, response, "");
        }
        json = json.trim();
        logger.log("Compiling project '" + projectId + "'...", logger.LogType.ADMIN);
        // Check if user is logged in
        UserController.singleton.loggedIn(function (loggedIn, user) {
            // If not logged in then do nothing
            if (!loggedIn) {
                if (callback)
                    return callback(false);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            }
            var projectController = ProjectController.singleton;
            projectController.checkPrivileges(user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function (hasRights) {
                if (hasRights) {
                    projectController.getProject(projectId, function (proj) {
                        if (!proj) {
                            if (callback)
                                return callback(false);
                            else
                                return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not find the project with the id '" + projectId + "'").processRequest(request, response, "");
                        }
                        // Get the build associated with this project
                        Model.collections("builds").findOne({ _id: proj.buildId }, function (err, build) {
                            if (err) {
                                if (callback)
                                    return callback(false);
                                else
                                    return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                            }
                            // Build the custom scripts
                            that.buildScriptBehaviours(proj, function (success, scriptsStr) {
                                if (!success)
                                    return;
                                // Get the output directory ready
                                var projDir = __dirname + "/../../../projects/" + projectId + "/";
                                var buildDir = projDir + build.version + "/";
                                var liveLink = (utils.config.secure ? "https://" : "http://") + utils.config.host + ":" + utils.config.port + "/projects/" + projectId + "/" + build.version + "/";
                                // If the directory already exists, then remove it
                                if (fs.existsSync(projDir)) {
                                    logger.log("Removing directory (" + projDir + ")...");
                                    utils.deleteFolderRecursive(projDir);
                                }
                                // Create the new directory
                                logger.log("Creating base directory (" + projDir + ")...");
                                fs.mkdirSync(projDir, 509);
                                fs.mkdirSync(buildDir, 509);
                                fs.mkdirSync(buildDir + "uploads/", 509);
                                fs.mkdirSync(buildDir + "deployables/", 509);
                                fs.mkdirSync(buildDir + "plugins/", 509);
                                fs.mkdirSync(buildDir + "custom-scripts/", 509);
                                fs.mkdirSync(buildDir + "common-files/", 509);
                                function replaceKeyTokens(str) {
                                    str = str.replace(/{{url}}/g, liveLink);
                                    return str;
                                }
                                // Copy the live file
                                if (fs.existsSync(__dirname + "/../../build-deployables/live.js"))
                                    that.copyFile(__dirname + "/../../build-deployables/live.js", buildDir + "common-files/live.js");
                                var filesToken = { $or: [] };
                                var pluginsToken = { $or: [] };
                                for (var i = 0, l = proj.files.length; i < l; i++)
                                    filesToken.$or.push({ _id: new mongodb.ObjectID(proj.files[i]) });
                                for (var i = 0, l = proj.plugins.length; i < l; i++)
                                    pluginsToken.$or.push({ _id: new mongodb.ObjectID(proj.plugins[i]) });
                                // If no query, then fill one blank item
                                if (pluginsToken.$or.length == 0)
                                    pluginsToken.$or.push({ _id: new mongodb.ObjectID("000000000000000000000000") });
                                if (filesToken.$or.length == 0)
                                    filesToken.$or.push({ _id: new mongodb.ObjectID("000000000000000000000000") });
                                // Copy each of the files over to the project directory
                                Model.collections("files").find(filesToken, function (err, cursor) {
                                    cursor.toArray(function (err, files) {
                                        var fileParts;
                                        for (var i = 0, l = files.length; i < l; i++) {
                                            fileParts = files[i].path.split("/");
                                            that.copyFile(files[i].path, buildDir + "/uploads/" + fileParts[fileParts.length - 1]);
                                        }
                                        // Copy each of the plugin files
                                        Model.collections("plugins").find(pluginsToken, function (err, cursor) {
                                            cursor.toArray(function (err, plugins) {
                                                if (plugins === void 0) { plugins = []; }
                                                var headers = "";
                                                var body = "";
                                                var pluginTags = "";
                                                for (var i = 0, l = plugins.length; i < l; i++) {
                                                    // Create the plugin folder
                                                    fs.mkdirSync(buildDir + "plugins/" + plugins[i].folderName, 509);
                                                    for (var ii = 0, il = plugins[i].deployables.length; ii < il; ii++) {
                                                        var deployableFile = "";
                                                        var headerFile = "";
                                                        var bodyFile = "";
                                                        // Check if the first character is a dot. If it is, then the path is relative
                                                        if (plugins[i].deployables[ii] != "" && plugins[i].deployables[ii][0] == ".")
                                                            deployableFile = __dirname + "/" + plugins[i].deployables[ii];
                                                        else
                                                            deployableFile = plugins[i].deployables[ii];
                                                        // Do the same for the header
                                                        if (plugins[i].header != "" && plugins[i].header == ".")
                                                            headerFile = __dirname + "/" + plugins[i].header;
                                                        else
                                                            headerFile = plugins[i].header;
                                                        // Do the same for the body
                                                        if (plugins[i].body != "" && plugins[i].body == ".")
                                                            bodyFile = __dirname + "/" + plugins[i].body;
                                                        else
                                                            bodyFile = plugins[i].body;
                                                        // Make sure the file we are deploying exists. If it doesnt then throw an error
                                                        if (!fs.existsSync(deployableFile)) {
                                                            if (callback)
                                                                callback(false);
                                                            else
                                                                return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not find deployable [" + deployableFile + "]").processRequest(request, response, "");
                                                        }
                                                        if (fs.existsSync(headerFile))
                                                            headers += "\n" + fs.readFileSync(headerFile).toString();
                                                        if (fs.existsSync(bodyFile))
                                                            body += "\n" + fs.readFileSync(bodyFile).toString();
                                                        fileParts = deployableFile.split("/");
                                                        that.copyFile(deployableFile, buildDir + "plugins/" + plugins[i].folderName + "/" + fileParts[fileParts.length - 1]);
                                                        pluginTags += "<script type='text/javascript' src='" + liveLink + "plugins/" + plugins[i].folderName + "/" + fileParts[fileParts.length - 1] + "'></script>\n";
                                                    }
                                                }
                                                // Create CSS file
                                                if (build.css && build.css.trim() != "") {
                                                    logger.log("Creating CSS file...");
                                                    fs.writeFileSync(buildDir + "common-files/style.css", replaceKeyTokens(build.css));
                                                }
                                                // Create custom scripts file
                                                if (scriptsStr && scriptsStr.trim() != "") {
                                                    logger.log("Creating scripts file...");
                                                    fs.writeFileSync(buildDir + "custom-scripts/scripts.js", replaceKeyTokens(scriptsStr));
                                                }
                                                // All deployables are copied. 
                                                logger.log("Plugin files have been deployed, creating bootstrap files...");
                                                // Create JSON file
                                                if (json != "") {
                                                    // The scene file is the animate scene exported as a json
                                                    // A global scene variable is used to store the scene data
                                                    logger.log("Creating JSON file...");
                                                    fs.writeFileSync(buildDir + "common-files/scene.js", "var __scene = " + replaceKeyTokens(json) + ";");
                                                    // The bootstrap file is a small file which actually runs the application
                                                    var bootstrap = [
                                                        "window.onload = load.bind( this );",
                                                        "Animate.Runtime.initialize();",
                                                        "function load()",
                                                        "{",
                                                        "	var runtime = new Animate.Loader().open( __scene );",
                                                        "	runtime.start();",
                                                        "}"
                                                    ].join("\n");
                                                    logger.log("Creating Bootstrap file...");
                                                    fs.writeFileSync(buildDir + "common-files/bootstrap.js", bootstrap);
                                                }
                                                var html = [
                                                    "<!DOCTYPE html>",
                                                    "<html>",
                                                    "<head>",
                                                    "<title></title >",
                                                    (json != "" ? "<script type='text/javascript' src='" + liveLink + "common-files/scene.js'></script>" : ""),
                                                    (build.css && build.css.trim() != "" ? "<link rel='stylesheet' type='text/css' href='" + liveLink + "common-files/style.css' />" : ""),
                                                    "<script type='text/javascript' src='" + liveLink + "common-files/live.js'></script>",
                                                    (scriptsStr && scriptsStr.trim() != "" ? "<script type='text/javascript' src='" + liveLink + "custom-scripts/scripts.js'></script>" : ""),
                                                    pluginTags,
                                                    (json != "" ? "<script type='text/javascript' src='" + liveLink + "common-files/bootstrap.js'></script>" : ""),
                                                    replaceKeyTokens(headers),
                                                    "</head>",
                                                    "<body>",
                                                    replaceKeyTokens(body),
                                                    replaceKeyTokens(build.html),
                                                    "</body>",
                                                    "</html>"
                                                ].join("\n");
                                                var newToken = buildModel.Build.generateToken(7);
                                                Model.collections("builds").update({ _id: build._id }, { $set: { liveHTML: html, liveToken: newToken } }, function (err, numAffected) {
                                                    if (err) {
                                                        if (callback)
                                                            return callback(false);
                                                        else
                                                            return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                                                    }
                                                    // All deployables are copied. 
                                                    logger.log("Build updated with correct html");
                                                    var executeLink = (utils.config.secure ? "https://" : "http://") + utils.config.host + ":" + utils.config.port + "/build/execute?buildId=" + build._id.toString() + "&token=" + newToken;
                                                    if (callback)
                                                        return callback(false);
                                                    else
                                                        return viewJSON.render({ liveLink: executeLink, message: "New build ready" }, request, response, viewJSON.ReturnType.SUCCESS);
                                                });
                                            });
                                        });
                                    });
                                });
                            }, request, response);
                        });
                    }, request, response);
                }
                else
                    return new ErrorController(utils.ErrorCodes.INSUFFICIENT_ACCESS, "Insufficient access to delete project").processRequest(request, response, "");
            }, request, response);
        }, request, response);
    };
    /**
    * Gets an instance of the export controller
    * @param {string} source The source file
    * @param {string} target The target destination
    * @param {(err? : any) => void} callback The callback function
    */
    ExportController.prototype.copyFile = function (source, target) {
        fs.createReadStream(source).pipe(fs.createWriteStream(target));
    };
    Object.defineProperty(ExportController, "singleton", {
        /**
        * Gets an instance of the export controller
        * @returns {ExportController}
        */
        get: function () {
            if (!ExportController._singleton)
                ExportController._singleton = new ExportController();
            return ExportController._singleton;
        },
        enumerable: true,
        configurable: true
    });
    return ExportController;
})(BaseController);
module.exports = ExportController;
