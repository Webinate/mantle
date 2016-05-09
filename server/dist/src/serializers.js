"use strict";
const winston = require("winston");
/**
 * Helper function to return a status 200 json object of type T
 */
function okJson(data, res) {
    if (data.error)
        winston.error(data.message, { process: process.pid });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}
exports.okJson = okJson;
/**
 * Helper function to return a status 200 json object of type T
 */
function errJson(err, res) {
    winston.error(err.message, { process: process.pid });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: true, message: err.message }));
}
exports.errJson = errJson;
