var fs = require("fs");
var utils = require("../Utils");
/**
* Base class for all views
*/
var HTMLRenderer = (function () {
    function HTMLRenderer() {
    }
    /**
    * Renders an array of files
    */
    HTMLRenderer.prototype.renderFolder = function (paths, response) {
        var loadedPaths = {};
        var numLoaded = 0;
        // When each file is loaded - give the browser the results in order
        var onFilesLoaded = function () {
            var finalHTML = "";
            for (var i = 0, l = paths.length; i < l; i++)
                finalHTML += loadedPaths[paths[i]];
            response.setHeader("Content-Length", finalHTML.length.toString());
            response.setHeader("Content-Type", "text/html");
            response.statusCode = 200;
            response.end(finalHTML);
            return;
        };
        // Load each of the files
        for (var i = 0, l = paths.length; i < l; i++) {
            fs.exists(paths[i], function (exists) {
                if (exists) {
                    fs.readFile(paths[i], function (err, contents) {
                        if (!err) {
                            numLoaded++;
                            loadedPaths[paths[i]] = contents.toString();
                            if (numLoaded >= paths.length)
                                onFilesLoaded();
                        }
                        else {
                            console.log(utils.ConsoleStyles.red[0] + err + utils.ConsoleStyles.red[1]);
                            response.writeHead(500);
                            response.end();
                            return;
                        }
                    });
                }
                else {
                    console.log("File not found: " + paths[i]);
                    response.writeHead(404);
                    response.end();
                    return;
                }
            });
        }
    };
    /**
    * Renders an array of files
    */
    HTMLRenderer.prototype.renderString = function (html, response) {
        response.setHeader("Content-Length", html.length.toString());
        response.setHeader("Content-Type", "text/html");
        response.statusCode = 200;
        response.end(html);
        return;
    };
    /**
    * Render a file as html back to the user
    */
    HTMLRenderer.prototype.renderFile = function (localPath, mimeType, request, response) {
        var that = this;
        fs.exists(localPath, function (exists) {
            if (exists) {
                console.log("Serving file: " + localPath);
                that.getFile(localPath, mimeType, request, response);
            }
            else {
                console.log("File not found: " + localPath);
                response.writeHead(404);
                response.end();
            }
        });
    };
    /**
    * Opens the contents of the file and returns it as html or any other valid mime type.
    */
    HTMLRenderer.prototype.getFile = function (localPath, mimeType, request, response) {
        fs.readFile(localPath, function (err, contents) {
            if (!err) {
                if (request.headers.host.match(/webinate\.net/)
                    || request.headers.host.match(/animate\.webinate\.net/)
                    || request.headers.host.match(/localhost/)
                    || request.headers.host.match(/localhost\.com/)
                    || request.headers.host.match(/localhost\.local/)
                    || request.headers.host.match(/animatetest\.com/)) {
                    response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
                    response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Mime-Type, X-File-Name, Cache-Control');
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                }
                ;
                response.setHeader("Content-Length", contents.length.toString());
                response.setHeader("Content-Type", mimeType);
                response.statusCode = 200;
                response.end(contents);
            }
            else {
                response.writeHead(500);
                response.end();
            }
        });
    };
    return HTMLRenderer;
})();
module.exports = HTMLRenderer;
