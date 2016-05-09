"use strict";
class Controller {
    constructor(models) {
        this._models = [];
        if (models) {
            for (var ii = 0, il = models.length; ii < il; ii++) {
                var modelAlreadyAdded = false;
                for (var i = 0, l = Controller._models.length; i < l; i++)
                    if (Controller._models[i].collectionName == models[ii].collectionName) {
                        modelAlreadyAdded = true;
                        break;
                    }
                if (!modelAlreadyAdded) {
                    this._models.push(models[ii]);
                    Controller._models.push(models[ii]);
                }
            }
        }
    }
    /**
    * Called to initialize this controller and its related database objects
    * @param {mongodb.Db} db The mongo database to use
    * @returns {Promise<Controller>}
    */
    initialize(db) {
        if (!this._models)
            return Promise.resolve(this);
        // Start the initialization of all of the models
        var promises = [];
        for (var i = 0, l = this._models.length; i < l; i++)
            promises.push(this._models[i].initialize(db));
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(function (promises) {
                resolve(this);
            }).catch(function (e) {
                reject(e);
            });
        });
    }
    /**
    * Gets a model by its collection name
    * returns {models.Model}
    */
    getModel(collectionName) {
        var models = Controller._models;
        for (var i = 0, l = models.length; i < l; i++)
            if (models[i].collectionName == collectionName)
                return models[i];
        return null;
    }
}
Controller._models = [];
exports.Controller = Controller;
