import {Model, ModelInstance} from "../models/Model";
import * as mongodb from "mongodb";
import {IControllerPlugin} from "modepress-api";

export class Controller
{
    private static _models: Array<Model> = [];
    private _models: Array<Model>;

	constructor(models: Array<Model>)
    {
        this._models = [];

        if (models)
        {
            for (var ii = 0, il = models.length; ii < il; ii++)
            {
                var modelAlreadyAdded = false;

                for (var i = 0, l = Controller._models.length; i < l; i++)
                    if (Controller._models[i].collectionName == models[ii].collectionName)
                    {
                        modelAlreadyAdded = true;
                        break;
                    }

                if (!modelAlreadyAdded)
                {
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
	initialize(db: mongodb.Db): Promise<Controller>
	{
		if (!this._models)
			return Promise.resolve(this);

		// Start the initialization of all of the models
		var promises: Array<Promise<Model>> = [];
		for (var i = 0, l = this._models.length; i < l; i++)
			promises.push(this._models[i].initialize(db));


		return new Promise<Controller>((resolve, reject) =>
		{
			Promise.all(promises).then(function (promises)
			{
				resolve(this);

			}).catch(function (e: Error)
			{
				reject(e);
			});
		});
	}

	/**
	* Gets a model by its collection name
	* returns {models.Model}
	*/
	getModel(collectionName: string): Model
    {
        var models = Controller._models;
		for (var i = 0, l = models.length; i < l; i++)
			if (models[i].collectionName == collectionName)
				return models[i];

		return null;
    }

    /**
    * Transforms an array of model instances to its data ready state that can be sent to the client
    * @param {ModelInstance} instances The instances to transform
    * @param {boolean} instances If true, sensitive data will not be sanitized
    * @returns {Array<T>}
    */
    getSanitizedData<T>(instances: Array<ModelInstance<T>>, verbose: boolean = false): Array<T>
    {
        var sanitizedData = [];
        for (var i = 0, l = instances.length; i < l; i++)
            sanitizedData.push(instances[i].schema.generateCleanData<T>(!verbose, instances[i]._id));

        return sanitizedData;
    }
}