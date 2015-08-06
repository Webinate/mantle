var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var events = require("events");
var logger = require("../Logger");
var Model = (function (_super) {
    __extends(Model, _super);
    /**
    * Creates an instance of the Model class
    */
    function Model(db) {
        _super.call(this);
        this._db = db;
        this._collections = {};
    }
    Model.prototype.collection = function (name) {
        return this._db.collection(name);
    };
    /**
    * Creates the collections for this database
    */
    Model.prototype.initializeCollections = function () {
        var that = this;
        var db = this._db;
        var totalCollections = 0;
        var loaded = 0;
        var collections = {
            users: { index: "email" },
            sessions: { index: null },
            projects: { index: null },
            builds: { index: null },
            behaviours: { index: null },
            plugins: { index: null },
            groups: { index: null },
            assets: { index: null },
            files: { index: null },
            logs: { index: null },
            scripts: { index: null }
        };
        for (var i in collections)
            totalCollections++;
        // Called a collection is loaded
        var onLoaded = function (collectionName) {
            loaded++;
            logger.log("'" + collectionName + "' loaded [" + loaded.toString() + "/" + totalCollections.toString() + "]" + "...");
            if (loaded >= totalCollections) {
                logger.log("Collections loaded...");
                that.emit("ready");
            }
        };
        // Try to load each of the collections
        var collectionReceived = function (err, collection) {
            if (err || !collection) {
                that.emit("error", "Error creating collection: " + err.message);
                return;
            }
            var collectionName = collection.collectionName;
            that._collections[collectionName] = collection;
            // If the collection has an index, then set it			
            var index = collections[collectionName].index;
            if (index) {
                logger.log("Settings index '" + index + "' for collection '" + collectionName + "'");
                var fieldOrSpec = {};
                fieldOrSpec[index] = 1;
                collection.ensureIndex(fieldOrSpec, { unique: true }, function (err, indexName) {
                    if (err) {
                        that.emit("error", "Error setting collection index for '" + collectionName + "': " + err.message);
                        return;
                    }
                    else {
                        logger.log("Index '" + index + "' set for collection '" + collectionName + "'", logger.LogType.SUCCESS);
                        onLoaded(collectionName);
                        return;
                    }
                });
            }
            else
                onLoaded(collectionName);
        };
        logger.log("Loading collections...");
        for (var i in collections) {
            // Projects
            if (!db.collection(i))
                db.createCollection(i, collectionReceived);
            else
                db.collection(i, collectionReceived);
        }
    };
    /**
    * Gets the model singleton
    */
    Model.getSingleton = function (db) {
        if (!Model._singleton && db) {
            Model._singleton = new Model(db);
            return Model._singleton;
        }
        else if (Model._singleton)
            return Model._singleton;
        else
            return null;
    };
    /**
    * Gets the collections singleton
    */
    Model.collections = function (name) {
        if (!Model._singleton)
            throw (new Error("Model not yet initialized"));
        return Model.getSingleton()._collections[name];
    };
    return Model;
})(events.EventEmitter);
module.exports = Model;
