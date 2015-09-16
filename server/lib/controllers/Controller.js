var Controller = (function () {
    function Controller(models) {
        this._models = models;
    }
    /**
    * Called to initialize this controller and its related database objects
    * @param {mongodb.Db} db The mongo database to use
    * @returns {Promise<Controller>}
    */
    Controller.prototype.initialize = function (db) {
        if (!this._models)
            return Promise.resolve(this);
        // Start the initialization of all of the models
        var promises = [];
        for (var i = 0, l = this._models.length; i < l; i++)
            promises.push(this._models[i].initialize(db));
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function (promises) {
                resolve(this);
            }).catch(function (e) {
                reject(e);
            });
        });
    };
    /**
    * Gets a model by its collection name
    * returns {models.Model}
    */
    Controller.prototype.getModel = function (collectionName) {
        var models = this._models;
        for (var i = 0, l = models.length; i < l; i++)
            if (models[i].collectionName == collectionName)
                return models[i];
        return null;
    };
    /**
    * Transforms an array of model instances to its data ready state that can be sent to the client
    * @param {ModelInstance} instances The instances to transform
    * @param {boolean} instances If true, sensitive data will not be sanitized
    * @returns {Array<T>}
    */
    Controller.prototype.getSanitizedData = function (instances, verbose) {
        if (verbose === void 0) { verbose = false; }
        var sanitizedData = [];
        for (var i = 0, l = instances.length; i < l; i++)
            sanitizedData.push(instances[i].schema.generateCleanData(!verbose, instances[i]._id));
        return sanitizedData;
    };
    return Controller;
})();
exports.Controller = Controller;
