var fs = require("fs");
var utils = require("../Utils");
var jade = require("jade");
/**
* Renders a jade file
* @param {string} path The path the jade file
* @param {any} jadeOptions Pass in an options object that can be potentially used by jade templates
*/
function render(path, jadeOptions, response) {
    var str = fs.readFileSync(path, { encoding: 'utf8' });
    var fn = jade.compile(str, { filename: path, pretty: true });
    // Set some of the common options
    jadeOptions.host = "//" + utils.config.host + ":" + utils.config.port;
    jadeOptions.version = utils.config.version;
    var html = fn(jadeOptions);
    if (response) {
        response.setHeader("Content-Length", html.length.toString());
        response.setHeader("Content-Type", "text/html");
        response.statusCode = 200;
        response.end(html);
    }
    else
        console.log(utils.ConsoleStyles.yellow[0] + html + utils.ConsoleStyles.yellow[1]);
    return;
}
exports.render = render;
