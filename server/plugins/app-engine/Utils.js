var fs = require("fs");
(function (RenderType) {
    RenderType[RenderType["HTML"] = 0] = "HTML";
    RenderType[RenderType["JSON"] = 1] = "JSON";
})(exports.RenderType || (exports.RenderType = {}));
var RenderType = exports.RenderType;
(function (ErrorCodes) {
    ErrorCodes[ErrorCodes["NO_EXTENSION"] = 0] = "NO_EXTENSION";
    ErrorCodes[ErrorCodes["BAD_QUERY"] = 1] = "BAD_QUERY";
    ErrorCodes[ErrorCodes["COMMAND_UNRECOGNISED"] = 2] = "COMMAND_UNRECOGNISED";
    ErrorCodes[ErrorCodes["INVALID_CAPTCHA"] = 3] = "INVALID_CAPTCHA";
    ErrorCodes[ErrorCodes["INVALID_OPTION"] = 4] = "INVALID_OPTION";
    ErrorCodes[ErrorCodes["INVALID_INPUT"] = 5] = "INVALID_INPUT";
    ErrorCodes[ErrorCodes["BAD_METHOD"] = 6] = "BAD_METHOD";
    ErrorCodes[ErrorCodes["USER_BAD_EMAIL"] = 7] = "USER_BAD_EMAIL";
    ErrorCodes[ErrorCodes["AUTHENTICATION_REQUIRED"] = 8] = "AUTHENTICATION_REQUIRED";
    ErrorCodes[ErrorCodes["INSUFFICIENT_ACCESS"] = 9] = "INSUFFICIENT_ACCESS";
    ErrorCodes[ErrorCodes["UPGRADE_PLAN"] = 10] = "UPGRADE_PLAN";
    ErrorCodes[ErrorCodes["DATABASE_ERROR"] = 11] = "DATABASE_ERROR";
})(exports.ErrorCodes || (exports.ErrorCodes = {}));
var ErrorCodes = exports.ErrorCodes;
/**
* Gets an instance of the export controller
* @param {string} path The directory path to remove
*/
function deleteFolderRecursive(path) {
    var that = this;
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                that.deleteFolderRecursive(curPath);
            }
            else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
exports.deleteFolderRecursive = deleteFolderRecursive;
function toBool(str) {
    if (str === undefined)
        return undefined;
    if (str.toString() == "true")
        return true;
    else
        return false;
}
exports.toBool = toBool;
var serverCommands = (function () {
    function serverCommands() {
    }
    serverCommands.EXIT = "exit";
    serverCommands.CLEAR = "clear";
    serverCommands.HELP = "help";
    return serverCommands;
})();
exports.serverCommands = serverCommands;
var urlControllers = (function () {
    function urlControllers() {
    }
    urlControllers.USER = "user";
    urlControllers.PROJECT = "project";
    urlControllers.BUILD = "build";
    urlControllers.PLUGIN = "plugin";
    urlControllers.MISC = "misc";
    urlControllers.FILE = "file";
    urlControllers.EXPORT = "export";
    return urlControllers;
})();
exports.urlControllers = urlControllers;
var ConsoleStyles = (function () {
    function ConsoleStyles() {
    }
    //styles
    ConsoleStyles.bold = ['\x1B[1m', '\x1B[22m'];
    ConsoleStyles.italic = ['\x1B[3m', '\x1B[23m'];
    ConsoleStyles.underline = ['\x1B[4m', '\x1B[24m'];
    ConsoleStyles.inverse = ['\x1B[7m', '\x1B[27m'];
    ConsoleStyles.strikethrough = ['\x1B[9m', '\x1B[29m'];
    //text colors
    ConsoleStyles.white = ['\x1B[37m', '\x1B[39m'];
    ConsoleStyles.grey = ['\x1B[90m', '\x1B[39m'];
    ConsoleStyles.black = ['\x1B[30m', '\x1B[39m'];
    ConsoleStyles.blue = ['\x1B[34m', '\x1B[39m'];
    ConsoleStyles.cyan = ['\x1B[36m', '\x1B[39m'];
    ConsoleStyles.green = ['\x1B[32m', '\x1B[39m'];
    ConsoleStyles.magenta = ['\x1B[35m', '\x1B[39m'];
    ConsoleStyles.red = ['\x1B[31m', '\x1B[39m'];
    ConsoleStyles.yellow = ['\x1B[33m', '\x1B[39m'];
    //background colors
    ConsoleStyles.whiteBG = ['\x1B[47m', '\x1B[49m'];
    ConsoleStyles.greyBG = ['\x1B[49;5;8m', '\x1B[49m'];
    ConsoleStyles.blackBG = ['\x1B[40m', '\x1B[49m'];
    ConsoleStyles.blueBG = ['\x1B[44m', '\x1B[49m'];
    ConsoleStyles.cyanBG = ['\x1B[46m', '\x1B[49m'];
    ConsoleStyles.greenBG = ['\x1B[42m', '\x1B[49m'];
    ConsoleStyles.magentaBG = ['\x1B[45m', '\x1B[49m'];
    ConsoleStyles.redBG = ['\x1B[41m', '\x1B[49m'];
    ConsoleStyles.yellowBG = ['\x1B[43m', '\x1B[49m'];
    return ConsoleStyles;
})();
exports.ConsoleStyles = ConsoleStyles;
/**
* Parses a request object to get the cookie into an object of key value pairs
*/
function parseCookies(request) {
    var list = {}, rc = request.headers.cookie;
    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = unescape(parts.join('='));
    });
    return list;
}
exports.parseCookies = parseCookies;
/**
* Sets an object of key value pairs to the response cookie. You must call this before you end the response
*/
function setCookies(data, response) {
    var cookieString = "";
    for (var i in data)
        cookieString += i + "=" + data[i].toString() + ";";
    // To Write a Cookie
    response.writeHead(200, {
        'Set-Cookie': 'mycookie=test',
        'Content-Type': 'text/plain'
    });
}
exports.setCookies = setCookies;
exports.config = {
    host: "",
    version: "trunk",
    port: 0,
    database_port: 0,
    privateKey: "",
    config: "",
    sslPassPhrase: "",
    ca: "",
    secure: undefined,
    certificate: undefined
};
