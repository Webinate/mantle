var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var formidable = require("formidable");
var ProjectController = require("./ProjectController");
var BaseController = require("./BaseController");
var ErrorController = require("./ErrorController");
var viewJSON = require("../views/JSONRenderer");
var utils = require("../Utils");
var validator = require("../Validator");
var Model = require("../models/Model");
var projectModel = require("../models/ProjectModel");
var fileModel = require("../models/FileModel");
var mongodb = require("mongodb");
var UserController = require("./UserController");
var logger = require("../Logger");
var fs = require("fs");
var path = require("path");
/**
* Controlls all project related functions
*/
var FileController = (function (_super) {
    __extends(FileController, _super);
    /**
    * Creates an instance of the Controller class
    */
    function FileController() {
        _super.call(this);
    }
    /**
    * Called whenever we need to process
    */
    FileController.prototype.processRequest = function (request, response, functionName) {
        logger.log("Processing file request '" + functionName + "'");
        var that = this;
        logger.log("Request Method '" + request.method + "'", logger.LogType.ADMIN);
        // We do the processing slightly differently on the file controller. This is because the upload
        // process creates more fringe cases when uploading
        if (functionName == "fill-file") {
            this.processGETData(function (options) {
                return that.fillFile(options["id"], options["projectId"], null, request, response);
            }, request, response);
        }
        else if (functionName == "create-empty-file") {
            this.processPOSTData(function (options) {
                switch (functionName) {
                    case "create-empty-file":
                        return that.createEmptyFile(options["name"], options["projectId"], null, request, response);
                        break;
                }
            }, request, response);
        }
        else {
            // The file uploader can use both post and get variables at the same time. Its typically a post - so we get the query vars
            //if ( request.
            this.processGETData(function (options) {
                switch (functionName) {
                    case "upload-file":
                        return that.uploadFile(options["projectId"], null, request, response);
                        break;
                    case "upload-user-avatar":
                        return that.uploadUserAvatar(null, request, response);
                        break;
                    case "upload-project-image":
                        return that.uploadProjectImage(options["projectId"], null, request, response);
                        break;
                    case "upload-thumb":
                        return that.uploadFileThumbnail(options["projectId"], options["fileId"], null, request, response);
                        break;
                    default:
                        return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "No function specified").processRequest(request, response, functionName);
                        break;
                }
            }, request, response);
        }
        // No response
        //return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not recognise File command" ).processRequest( request, response, functionName );
    };
    /* Fills a file with data from the application
    * See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
    * @param {string} id The ID of the file we are filling
    * @param {string} projectId The id of the project creating this file
    * @param {( file: fileModel.File ) => void} callback The function to call when the file is created
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.fillFile = function (id, projectId, callback, request, response) {
        logger.log("Create file for project '" + projectId + "'...", logger.LogType.ADMIN);
        var projController = ProjectController.singleton;
        var userController = UserController.singleton;
        var that = this;
        if (id == "" || !validator.isValidObjectID(id)) {
            if (callback)
                return callback(null);
            else
                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Please specify a valid file ID").processRequest(request, response, "");
        }
        // Is the user logged in
        UserController.singleton.loggedIn(function (loggedIn, user) {
            // If not logged in then do nothing
            if (!loggedIn) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            }
            // Check for rights
            projController.checkPrivileges(user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function (hasRights) {
                if (hasRights) {
                    projController.getProject(projectId, function (proj) {
                        if (!proj) {
                            if (callback)
                                return callback(null);
                            else
                                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'").processRequest(request, response, "");
                        }
                        Model.collections("files").findOne({ _id: new mongodb.ObjectID(id) }, function (err, file) {
                            if (!file) {
                                if (callback)
                                    return callback(null);
                                else
                                    return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find file").processRequest(request, response, "");
                            }
                            // For each file thats loaded, write it to a file and make sure its not too big
                            var onData = function (chunk) {
                                // Check num bytes loaded
                                if (chunk.length > FileController._MAX_FILE_SIZE) {
                                    request.removeListener("end", fileLoaded);
                                    request.removeListener("data", onData);
                                    logger.log("File size too large for project '" + projectId + "'", logger.LogType.ERROR);
                                    if (callback)
                                        return callback(null);
                                    else
                                        return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "File too large.").processRequest(request, response, "");
                                }
                                wStream.write(chunk);
                            };
                            // Once the file is loaded, update its size in the DB
                            var fileLoaded = function () {
                                // Check num bytes loaded
                                wStream.end();
                                request.removeListener("end", fileLoaded);
                                request.removeListener("data", onData);
                                var stats = fs.statSync(file.path);
                                var fileSizeInBytes = stats["size"];
                                logger.log("Updating file size for project '" + projectId + "'");
                                Model.collections("files").update({ _id: file._id }, { $set: { size: fileSizeInBytes } }, function (err, numAffected) {
                                    if (err) {
                                        if (callback)
                                            return callback(null);
                                        else
                                            return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, "Could not update file size").processRequest(request, response, "");
                                    }
                                    logger.log("File updated for '" + projectId + "'", logger.LogType.SUCCESS);
                                    if (callback)
                                        return callback(file);
                                    else
                                        return viewJSON.render([file._id], request, response, viewJSON.ReturnType.SUCCESS);
                                });
                            };
                            var wStream = fs.createWriteStream(file.path);
                            request.on("end", fileLoaded);
                            request.on("data", onData);
                        });
                    }, request, response);
                }
                else {
                    if (callback)
                        return callback(null);
                    else
                        return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function").processRequest(request, response, "");
                }
            }, request, response);
        }, request, response);
    };
    /**
    * Use this function to generate a random file name
    * @param {number} length The length of the name.
    * @returns {string}
    */
    FileController.prototype.generateFileName = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    /**
    * Creates a blank data file for a given user
    * @param {string} name The name of the new file (This is not a file name - filenames are automatically generated)
    * @param {string} projectId The id of the project creating this file
    * @param {( file: fileModel.File ) => void} callback The function to call when the file is created
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.createEmptyFile = function (name, projectId, callback, request, response) {
        logger.log("Create file for project '" + projectId + "'...", logger.LogType.ADMIN);
        var projController = ProjectController.singleton;
        var userController = UserController.singleton;
        var that = this;
        // Is the user logged in
        UserController.singleton.loggedIn(function (loggedIn, user) {
            // If not logged in then do nothing
            if (!loggedIn) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            }
            // Check for rights
            projController.checkPrivileges(user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function (hasRights) {
                if (hasRights) {
                    projController.getProject(projectId, function (proj) {
                        if (!proj) {
                            if (callback)
                                return callback(null);
                            else
                                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'").processRequest(request, response, "");
                        }
                        // Create the user directory and an empty file
                        var userDir = that.getUserDirectory(user);
                        var path = null, temp = "";
                        while (!path) {
                            temp = userDir + "/" + that.generateFileName(10) + ".adf"; // (animate data file)
                            if (!fs.existsSync(temp)) {
                                path = temp;
                                try {
                                    var fd = fs.openSync(path, 'w');
                                    fs.closeSync(fd);
                                }
                                catch (e) {
                                    if (callback)
                                        return callback(null);
                                    if (e instanceof Error)
                                        return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, e.message).processRequest(request, response, "");
                                    else
                                        return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, "Could not create file on the server. ['" + e + "']").processRequest(request, response, "");
                                }
                                break;
                            }
                        }
                        // Create the file
                        var file = new fileModel.File(user._id);
                        file.name = name;
                        file.path = path;
                        file.size = 0;
                        file.url = (utils.config.secure ? "https://" : "http://") + utils.config.host + ":" + utils.config.port + "/" + ((path.split("/").slice(11)).join("/"));
                        // Create a new file
                        Model.collections("files").save(file, function (err, result) {
                            if (!result) {
                                if (callback)
                                    return callback(null);
                                else
                                    return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, "Could not save file in the database").processRequest(request, response, "");
                            }
                            // File created - update project file count
                            Model.collections("projects").update({ _id: proj._id }, { $push: { files: result._id.toString() } }, function () {
                                if (callback)
                                    return callback(result);
                                else
                                    return viewJSON.render(result, request, response, viewJSON.ReturnType.SUCCESS);
                            });
                        });
                    }, request, response);
                }
                else {
                    if (callback)
                        return callback(null);
                    else
                        return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function").processRequest(request, response, "");
                }
            }, request, response);
        }, request, response);
    };
    /**
    * Gets the files stored in the database
    * @param {number} limit The number of files to fetch
    * @param {number} startIndex The starting index from where we are fetching files from
    * @param {( files: Array<fileModel.File> ) => void} callback The function to call when objects are downloaded
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.getFiles = function (limit, startIndex, callback, request, response) {
        if (limit === void 0) { limit = 0; }
        if (startIndex === void 0) { startIndex = 0; }
        logger.log("Getting files from index " + startIndex.toString() + "...", logger.LogType.ADMIN);
        Model.collections("files").find({}, {}, startIndex, limit, function (err, result) {
            var token;
            if (err || !result) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.BAD_METHOD, err).processRequest(request, response, "");
            }
            result.toArray(function (err, results) {
                if (callback)
                    return callback(results);
                else
                    return viewJSON.render(results, request, response, viewJSON.ReturnType.SUCCESS);
            });
        });
    };
    /**
    * Gets, or creates if neccessary, the user's upload directory
    * @param {userModel.User} user The user we are getting the directory for
    * @returns {string}
    */
    FileController.prototype.getUserDirectory = function (user) {
        var directory = __dirname + "/../../../uploads/users/" + user._id.toString();
        logger.log("Checking for user upload directory (" + directory + ") and creating one if not present");
        // Create the user directory if it doesnt exist
        if (!fs.existsSync(directory)) {
            logger.log("Making directory (" + directory + ")...");
            fs.mkdirSync(directory, 509);
        }
        return directory;
    };
    /**
    * Helper function. Looks at the request and uploads the files to the user's personal file directory.
    * @param {userModel.User} user The user associated with this upload
    * @param {(err: any, files : Array<formidable.IFormidableFile>) => void} callback The function to call when objects are downloaded
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.uploadUserFile = function (mulitUploader, user, callback, request, response) {
        try {
            // User Directory
            var userUploadDir = this.getUserDirectory(user);
            var form = new formidable.IncomingForm({ multiples: mulitUploader, uploadDir: userUploadDir, keepExtensions: true });
            var files = [];
            form
                .on("aborted", function () {
                logger.log("File upload aborted", logger.LogType.ERROR);
                callback("File upload aborted", null);
            })
                .on("error", function (err) {
                logger.log("File upload error occurred :" + JSON.stringify(err), logger.LogType.ERROR);
                callback(err, null);
            })
                .on("file", function (field, file) {
                logger.log('File uploaded ' + JSON.stringify(file) + '...', logger.LogType.ADMIN);
                files.push(file);
            })
                .on('end', function () {
                logger.log('Uploads complete...');
                callback(null, files);
            });
            logger.log("Parsing upload...");
            form.parse(request);
        }
        catch (e) {
            if (e instanceof Error)
                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, e.message).processRequest(request, response, "");
            else
                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not upload file to the server").processRequest(request, response, "");
        }
    };
    /**
    * Uploads a project image
    * @param {string} projectId The ID of the project
    * @param {(numUpdated : number) => void} callback The callback function
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.uploadProjectImage = function (projectId, callback, request, response) {
        var projController = ProjectController.singleton;
        var that = this;
        UserController.singleton.loggedIn(function (loggedIn, user) {
            // If not logged in then do nothing
            if (!loggedIn) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            }
            logger.log("Uploading project image for project '" + projectId, logger.LogType.ADMIN);
            // Check for rights
            projController.checkPrivileges(user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function (hasRights) {
                if (hasRights) {
                    projController.getProject(projectId, function (proj) {
                        if (!proj) {
                            if (callback)
                                return callback(null);
                            else
                                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'").processRequest(request, response, "");
                        }
                        // Upload the files to the user directory
                        that.uploadUserFile(false, user, onFilesLoaded, request, response);
                        // Once each of the files has been uploaded.
                        function onFilesLoaded(err, files) {
                            if (err) {
                                if (callback)
                                    return callback(null);
                                else
                                    return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                            }
                            logger.log("[" + files.length + "] Files uploaded - updating file entry...");
                            var url = (utils.config.secure ? "https://" : "http://") + utils.config.host + ":" + utils.config.port + "/" + ((files[0].path.split("/").slice(5)).join("/"));
                            var path = files[0].path;
                            // Delete any current thumbnails
                            if (fs.existsSync(proj.imagePath))
                                fs.unlinkSync(proj.imagePath);
                            // Get the current thumbnail
                            Model.collections("projects").update({ _id: proj._id }, { $set: { imagePath: path, image: url } }, function (err, numAffected) {
                                if (err) {
                                    if (callback)
                                        return callback(null);
                                    else
                                        return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                                }
                                logger.log("File uploaded and project updated!", logger.LogType.SUCCESS);
                                if (callback)
                                    return callback(numAffected);
                                else
                                    return viewJSON.render({ message: "Files successfully uploaded", imageUrl: url }, request, response, viewJSON.ReturnType.SUCCESS);
                            });
                        }
                    }, request, response);
                }
                else {
                    if (callback)
                        return callback(null);
                    else
                        return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function").processRequest(request, response, "");
                }
            }, request, response);
        }, request, response);
    };
    /**
    * Uploads a user avatar image
    * @param {(numUpdated : number) => void} callback The callback function
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.uploadUserAvatar = function (callback, request, response) {
        var that = this;
        UserController.singleton.loggedIn(function (loggedIn, user) {
            // If not logged in then do nothing
            if (!loggedIn) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            }
            logger.log("Uploading avatar for user '" + user._id.toString(), logger.LogType.ADMIN);
            // Upload the files to the user directory
            that.uploadUserFile(false, user, onFilesLoaded, request, response);
            // Once each of the files has been uploaded.
            function onFilesLoaded(err, files) {
                if (err) {
                    if (callback)
                        return callback(null);
                    else
                        return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                }
                logger.log("[" + files.length + "] Files uploaded - updating file entry...");
                var url = (utils.config.secure ? "https://" : "http://") + utils.config.host + ":" + utils.config.port + "/" + ((files[0].path.split("/").slice(5)).join("/"));
                var path = files[0].path;
                // Delete the current avatar
                if (fs.existsSync(user.imagePath))
                    fs.unlinkSync(user.imagePath);
                // Update the file entry
                Model.collections("users").update({ _id: user._id }, { $set: { imagePath: path, image: url } }, function (err, numAffected) {
                    if (err) {
                        if (callback)
                            return callback(null);
                        else
                            return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                    }
                    logger.log("Avatar uploaded and updated!", logger.LogType.SUCCESS);
                    if (callback)
                        return callback(numAffected);
                    else
                        return viewJSON.render({ imageUrl: url, message: "Avatar successfully uploaded" }, request, response, viewJSON.ReturnType.SUCCESS);
                });
            }
        }, request, response);
    };
    /**
    * Uploads a file thumbnail
    * @param {string} projectId The ID of the project
    * @param {string} fileId The ID of the file
    * @param {(numUpdated : number) => void} callback The callback function
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.uploadFileThumbnail = function (projectId, fileId, callback, request, response) {
        var projController = ProjectController.singleton;
        var that = this;
        if (!fileId || fileId.trim() == "" || !validator.isValidObjectID(fileId)) {
            if (callback)
                return callback(null);
            else
                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Please use a valid file ID").processRequest(request, response, "");
        }
        UserController.singleton.loggedIn(function (loggedIn, user) {
            // If not logged in then do nothing
            if (!loggedIn) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            }
            // Check for rights
            projController.checkPrivileges(user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function (hasRights) {
                if (hasRights) {
                    projController.getProject(projectId, function (proj) {
                        if (!proj) {
                            if (callback)
                                return callback(null);
                            else
                                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'").processRequest(request, response, "");
                        }
                        logger.log("Uploading thumbnail for user '" + user._id.toString() + "' and file '" + fileId + "'", logger.LogType.ADMIN);
                        // Upload the files to the user directory
                        that.uploadUserFile(false, user, onFilesLoaded, request, response);
                        // Once each of the files has been uploaded.
                        function onFilesLoaded(err, files) {
                            if (err) {
                                if (callback)
                                    return callback(null);
                                else
                                    return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                            }
                            logger.log("[" + files.length + "] Files uploaded - updating file entry...");
                            var url = (utils.config.secure ? "https://" : "http://") + utils.config.host + ":" + utils.config.port + "/" + ((files[0].path.split("/").slice(5)).join("/"));
                            var path = files[0].path;
                            // Get the current thumbnail
                            Model.collections("files").findOne({ _id: new mongodb.ObjectID(fileId) }, function (err, file) {
                                if (err) {
                                    if (callback)
                                        return callback(null);
                                    else
                                        return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                                }
                                if (!file) {
                                    if (callback)
                                        return callback(null);
                                    else
                                        return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, "No file could be found").processRequest(request, response, "");
                                }
                                // Delete any current thumbnails
                                if (fs.existsSync(file.previewPath))
                                    fs.unlinkSync(file.previewPath);
                                // Update the file entry
                                Model.collections("files").update({ _id: file._id }, { $set: { previewUrl: url, previewPath: path } }, function (err, numAffected) {
                                    if (err) {
                                        if (callback)
                                            return callback(null);
                                        else
                                            return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                                    }
                                    logger.log("File uploaded and updated!", logger.LogType.SUCCESS);
                                    if (callback)
                                        return callback(numAffected);
                                    else
                                        return viewJSON.render({ message: "Files successfully uploaded" }, request, response, viewJSON.ReturnType.SUCCESS);
                                });
                            });
                        }
                    }, request, response);
                }
                else {
                    if (callback)
                        return callback(null);
                    else
                        return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function").processRequest(request, response, "");
                }
            }, request, response);
        }, request, response);
    };
    /**
    * Uploads a series of files for a user
    * @param {string} projectId The ID of the project
    * @param {(files: Array<fileModel.File>)=>void} callback The callback function
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    FileController.prototype.uploadFile = function (projectId, callback, request, response) {
        var projController = ProjectController.singleton;
        var that = this;
        logger.log("Uploading file for project '" + projectId + "'", logger.LogType.ADMIN);
        UserController.singleton.loggedIn(function (loggedIn, user) {
            // If not logged in then do nothing
            if (!loggedIn) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
            }
            // Check for rights
            projController.checkPrivileges(user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function (hasRights) {
                if (hasRights) {
                    projController.getProject(projectId, function (proj) {
                        if (!proj) {
                            if (callback)
                                return callback(null);
                            else
                                return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'").processRequest(request, response, "");
                        }
                        logger.log("Uploading file for user '" + user._id.toString() + "'", logger.LogType.ADMIN);
                        // Upload the files to the user directory
                        that.uploadUserFile(true, user, onFilesLoaded, request, response);
                        // Once each of the files has been uploaded.
                        function onFilesLoaded(err, files) {
                            if (err) {
                                if (callback)
                                    return callback(null);
                                else
                                    return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                            }
                            logger.log("[" + files.length + "] Files loaded", logger.LogType.SUCCESS);
                            // The actual file models we store in the DB
                            var fileModels = [];
                            for (var i = 0, l = files.length; i < l; i++) {
                                var filePath = path.extname(files[i].path).toLowerCase().trim();
                                // Lets verify the file stats are ok
                                if (!FileController.allowedFilesTypes[filePath] ||
                                    files[i].size > FileController._MAX_FILE_SIZE // 10 Meg
                                ) {
                                    logger.log("File was dissallowed [" + filePath + ", " + (files[i].size / 1024 / 1024).toString() + "]", logger.LogType.ERROR);
                                    fs.unlinkSync(files[i].path);
                                    break;
                                }
                                // File seems ok, so create the files
                                var newFile = new fileModel.File(user._id);
                                newFile.url = (utils.config.secure ? "https://" : "http://") + utils.config.host + ":" + utils.config.port + "/" + ((files[i].path.split("/").slice(5)).join("/"));
                                newFile.path = files[i].path;
                                newFile.name = files[i].name;
                                newFile.size = files[i].size;
                                // Add model to arr
                                fileModels.push(newFile);
                            }
                            var savedFiles = [];
                            // Called each time a file is saved
                            function onFileSaved() {
                                if (fileModels.length == 0) {
                                    logger.log("All files have been uploaded", logger.LogType.SUCCESS);
                                    if (callback)
                                        callback(savedFiles);
                                    else
                                        return viewJSON.render({ message: "Files successfully uploaded" }, request, response, viewJSON.ReturnType.SUCCESS);
                                    return;
                                }
                                var saveToken = fileModels.pop();
                                logger.log('Saving file ' + JSON.stringify(saveToken) + '...');
                                // try to save the file...
                                Model.collections("files").save(saveToken, function (err, savedFile) {
                                    if (err) {
                                        if (callback)
                                            return callback(null);
                                        else
                                            return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                                    }
                                    logger.log('File saved ' + JSON.stringify(savedFile) + '...');
                                    // Update the project so that it refers to this file
                                    Model.collections("projects").update({ _id: proj._id }, { $push: { files: savedFile._id.toString() } }, function () {
                                        if (err) {
                                            if (callback)
                                                return callback(null);
                                            else
                                                return new ErrorController(utils.ErrorCodes.DATABASE_ERROR, err).processRequest(request, response, "");
                                        }
                                        logger.log('project updated with new file...');
                                        savedFiles.push(savedFile);
                                        onFileSaved();
                                    });
                                });
                            }
                            // Save array to the DB
                            onFileSaved();
                        }
                    }, request, response);
                }
                else {
                    if (callback)
                        return callback(null);
                    else
                        return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function").processRequest(request, response, "");
                }
            }, request, response);
        }, request, response);
    };
    Object.defineProperty(FileController, "singleton", {
        /**
        * Gets an instance of the file controller
        * @returns {FileController}
        */
        get: function () {
            if (!FileController._singleton)
                FileController._singleton = new FileController();
            return FileController._singleton;
        },
        enumerable: true,
        configurable: true
    });
    FileController._MAX_FILE_SIZE = 10 * 1024 * 1024; //10 megabytes
    // TODO - expose file types to admin
    FileController.allowedFilesTypes = {
        ".jpeg": true,
        ".jpg": true,
        ".png": true,
        ".gif": true,
        ".js": true,
        ".obj": true,
        ".adf": true // Animate Data File
    };
    return FileController;
})(BaseController);
module.exports = FileController;
