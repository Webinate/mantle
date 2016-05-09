"use strict";
const mongodb = require("mongodb");
class MongoWrapper {
    /**
    * Connects to the mongo database
    * @param {string} host The host URI
    * @param {number} port The port number
    * @param {mongodb.ServerOptions} opts Any additional options
    * @returns {Promise<mongodb.Db>}
    */
    static connect(host, port, database, opts) {
        return new Promise(function (resolve, reject) {
            if (!host)
                return reject(new Error("Please provide a 'host' field in your configuration"));
            if (!port)
                return reject(new Error("Please provide a 'port' field in your configuration"));
            if (!database)
                return reject(new Error("Please provide a 'databaseName' field in your configuration"));
            var mongoServer = new mongodb.Server(host, port, opts);
            var mongoDB = new mongodb.Db(database, mongoServer, { w: 1 });
            mongoDB.open(function (err, db) {
                if (err || !db)
                    reject(err);
                else
                    resolve(db);
            });
        });
    }
    /**
    * Connects to the mongo database
    * @param {string} host The host URI
    * @param {number} port The port number
    * @param {mongodb.ServerOptions} opts Any additional options
    * @returns {Promise<mongodb.Db>}
    */
    static find(host, port, opts) {
        return new Promise(function (resolve, reject) {
            var mongoServer = new mongodb.Server(host, port, opts);
            var mongoDB = new mongodb.Db("animate", mongoServer, { w: 1 });
            mongoDB.open(function (err, db) {
                if (err || !db)
                    reject(err);
                else
                    resolve(db);
            });
        });
    }
}
exports.MongoWrapper = MongoWrapper;
