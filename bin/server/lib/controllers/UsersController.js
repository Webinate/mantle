var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Controller_1 = require("./Controller");
var Model_1 = require("../models/Model");
var UsersController = (function (_super) {
    __extends(UsersController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {express.Express} e The express instance of this server
    * @param {users.IConfig} config The config file to setup the users
    */
    function UsersController(e, config) {
        _super.call(this, [new Model_1.Model("users"), new Model_1.Model("sessions")]);
        //this._config = config;
        //var router = express.Router();
        //router.use(bodyParser.urlencoded({ 'extended': true }));
        //router.use(bodyParser.json());
        //router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        //// Routes
        //router.get("/authenticated", this.authenticated.bind(this));
        //router.get("/activate-account", this.activateAccount.bind(this));
        //router.post("/login", this.login.bind(this));
        //router.post("/register", this.register.bind(this));
        //router.post("/resend-activation", this.resendActivation.bind(this));
        // Register the path
        //e.use("/api/users", router);
    }
    return UsersController;
})(Controller_1.Controller);
exports.UsersController = UsersController;
