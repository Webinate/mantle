"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
        return __awaiter(this, void 0, Promise, function* () {
            if (!this._models)
                return this;
            // Start the initialization of all of the models
            var promises = [];
            for (var i = 0, l = this._models.length; i < l; i++)
                promises.push(this._models[i].initialize(db));
            yield Promise.all(promises);
            return this;
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
