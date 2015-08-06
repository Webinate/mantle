var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_api_1 = require("modepress-api");
var PluginController_1 = require("./controllers/PluginController");
/**
* A plugin that loads the app engine controllers for use in Modepress
*/
var AppEngine = (function (_super) {
    __extends(AppEngine, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function AppEngine(server, config, e) {
        _super.call(this, null);
        this._controllers = [
            new PluginController_1.PluginController(server, config, e)
        ];
    }
    /**
    * Called to initialize this controller and its related database objects
    * @param {mongodb.Db} db The mongo database to use
    * @returns {Promise<Controller>}
    */
    AppEngine.prototype.initialize = function (db) {
        var promises = [];
        var that = this;
        for (var i = 0, ctrls = this._controllers, l = ctrls.length; i < l; i++)
            promises.push(ctrls[i].initialize(db));
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function () {
                resolve(that);
            }).catch(function (err) {
                resolve(err);
            });
        });
    };
    return AppEngine;
})(modepress_api_1.Controller);
exports.default = AppEngine;
