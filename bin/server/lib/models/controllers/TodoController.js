var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var express = require("express");
var controllerModule = require("./Controller");
var bodyParser = require('body-parser');
var TodoController = (function (_super) {
    __extends(TodoController, _super);
    function TodoController(e) {
        _super.call(this, "", e);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        // Define the route
        router.route("/api/todos");
        // Filter the post requests
        router.post(this.onPost.bind(this));
    }
    TodoController.prototype.onPost = function (req, res, next) {
        res.send("Creating a todo");
    };
    return TodoController;
})(controllerModule.Controller);
exports.TodoController = TodoController;
