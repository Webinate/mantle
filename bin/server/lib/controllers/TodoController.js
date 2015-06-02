var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var express = require("express");
var controllerModule = require("./Controller");
var bodyParser = require('body-parser');
var todoModels = require("../models/Todo");
var TodoController = (function (_super) {
    __extends(TodoController, _super);
    function TodoController(e) {
        _super.call(this, [new todoModels.TodoModel()]);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        // Filter the post requests
        router.post("/", this.onPost.bind(this));
        // Get all requests
        router.get("/", this.onGetAll.bind(this));
        // Get by ID's
        router.get("/:id", this.onGet.bind(this));
        // Edit an item
        router.put("/", this.onPut.bind(this));
        // Delete by ID's
        router.delete("/:id", this.onDelete.bind(this));
        e.use("/api/todos", router);
    }
    TodoController.prototype.onGetAll = function (req, res, next) {
        // Set the content type
        res.setHeader('Content-Type', 'application/json');
        // Find and return the instances
        this._models[0].findInstances({}, req.query.from || 0, req.query.limit || 10).then(function (instances) {
            var dataArr = [];
            for (var i = 0, l = instances.length; i < l; i++)
                dataArr.push(instances[i].schema.serialize());
            res.end(JSON.stringify({ message: "Success", error: false, instances: dataArr }));
        }).catch(function (e) {
            res.end(JSON.stringify({ message: e.message }));
        });
    };
    TodoController.prototype.onGet = function (req, res, next) {
        // Set the content type
        res.setHeader('Content-Type', 'application/json');
        var ids = req.params.id.split(",");
        var selector = { $or: [] };
        for (var i = 0, l = ids.length; i < l; i++)
            selector.$or.push({ id: parseInt(ids[i]) });
        // Find and return the instances
        this._models[0].findInstances(selector, req.query.from || 0, req.query.limit || 10).then(function (instances) {
            var dataArr = [];
            for (var i = 0, l = instances.length; i < l; i++)
                dataArr.push(instances[i].schema.serialize());
            res.end(JSON.stringify({ message: "Success", error: false, instances: dataArr }));
        }).catch(function (e) {
            res.end(JSON.stringify({ message: e.message }));
        });
    };
    TodoController.prototype.onPost = function (req, res, next) {
        // Set the content type
        res.setHeader('Content-Type', 'application/json');
        // Create a new instance and pass in the post data to set the initial values
        this._models[0].createInstance(req.body).then(function (instance) {
            // Return the serialized object
            res.end(JSON.stringify({
                message: "New Todo has been created",
                instance: instance.schema.serialize(),
                error: false
            }));
        }).catch(function (e) {
            // Catch any errors
            res.end(JSON.stringify({ message: e.message, error: true }));
        });
    };
    TodoController.prototype.onPut = function (req, res, next) {
        res.send("Editing a todo");
    };
    TodoController.prototype.onDelete = function (req, res, next) {
        // Set the content type
        res.setHeader('Content-Type', "application/json");
        var ids = req.params.id.split(",");
        var selector = { $or: [] };
        for (var i = 0, l = ids.length; i < l; i++)
            selector.$or.push({ id: parseInt(ids[i]) });
        // Create a new instance and pass in the post data to set the initial values
        this._models[0].deleteInstances(selector).then(function (numRemoved) {
            // Return the serialized object
            res.end(JSON.stringify({
                message: "[" + numRemoved + "] todo's removed",
                numRemoved: numRemoved,
                error: false
            }));
        }).catch(function (e) {
            // Catch any errors
            res.end(JSON.stringify({ message: e.message, error: true }));
        });
    };
    return TodoController;
})(controllerModule.Controller);
exports.TodoController = TodoController;
