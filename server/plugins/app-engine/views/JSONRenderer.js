var logger = require("../Logger");
(function (ReturnType) {
    ReturnType[ReturnType["SUCCESS"] = 0] = "SUCCESS";
    ReturnType[ReturnType["ERROR"] = 1] = "ERROR";
})(exports.ReturnType || (exports.ReturnType = {}));
var ReturnType = exports.ReturnType;
/**
* Render a json object to the page
*/
function render(json, request, response, returnType) {
    if (returnType === void 0) { returnType = ReturnType.SUCCESS; }
    if (response) {
        if (returnType == ReturnType.SUCCESS)
            json.return_type = "success";
        else
            json.return_type = "error";
        if (request.headers.origin) {
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
            }
            ;
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(json));
    }
    else
        logger.log(JSON.stringify(json), logger.LogType.WARNING);
}
exports.render = render;
