var HatcheryPlugin;
(function (HatcheryPlugin) {
    var AppEnginePlugin = (function () {
        function AppEnginePlugin() {
            this.dashboardLinks = [{
                    icon: "/admin/plugins/app-engine/resources/media/hatchery-icon.png",
                    label: "Hatchery",
                    state: "default.hatchery-users",
                    children: [{
                            icon: "/admin/media/images/users.png",
                            label: "Users",
                            state: "default.hatchery-users"
                        },
                        {
                            icon: "/admin/plugins/app-engine/resources/media/hatchery-plugins.png",
                            label: "Plugins",
                            state: "default.hatchery-plugins"
                        }]
                }];
        }
        /**
        * Called when the application module is being setup
        */
        AppEnginePlugin.prototype.onInit = function (mod) {
            mod.controller("pluginCtrl", HatcheryPlugin.PluginCtrl);
        };
        /**
        * Called when the states are being setup in config
        */
        AppEnginePlugin.prototype.onStatesInit = function (stateProvider) {
            stateProvider
                .state('default.hatchery-plugins', {
                templateUrl: 'admin/plugins/app-engine/resources/templates/hatchery-plugins.html',
                authenticate: true,
                controller: "pluginCtrl",
                controllerAs: "controller",
                url: "/hatchery-plugins"
            });
        };
        return AppEnginePlugin;
    })();
    HatcheryPlugin.AppEnginePlugin = AppEnginePlugin;
})(HatcheryPlugin || (HatcheryPlugin = {}));
_plugins.push(new HatcheryPlugin.AppEnginePlugin());
/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/angular.d.ts" />
/// <reference path="./definitions/angular-ui-router.d.ts" />
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/es6-promise.d.ts" />
/// <reference path="./definitions/express.d.ts" />
/// <reference path="../source-server/definitions/webinate-users.d.ts" />
/// <reference path="../source-server/definitions/modepress-api.d.ts" />
/// <reference path="../source-server/custom-definitions/app-engine.d.ts" />
/// <reference path="lib/Plugin.ts" /> 
var HatcheryPlugin;
(function (HatcheryPlugin) {
    /**
    * Class for keeping track of
    */
    var Pager = (function () {
        function Pager(loader) {
            this.loader = loader;
            this.index = 0;
            this.limit = 10;
            this.last = 1;
            this.searchTerm = "";
            this._proxyReject = this.onReject.bind(this);
            this._proxyResolve = this.onResolve.bind(this);
        }
        Pager.prototype.onResolve = function (response) {
            this.last = response.data.count;
            if (this.last == 0)
                this.last = 1;
        };
        Pager.prototype.onReject = function (err) {
            this.last = 1;
        };
        Pager.prototype.canNext = function () {
            return (this.index + this.limit < this.last);
        };
        Pager.prototype.canLast = function () {
            return (this.index < this.last - this.limit);
        };
        /**
        * Gets the current page number
        * @returns {number}
        */
        Pager.prototype.getPageNum = function () {
            return (this.index / this.limit) + 1;
        };
        /**
        * Gets the total number of pages
        * @returns {number}
        */
        Pager.prototype.getTotalPages = function () {
            return Math.ceil(this.last / this.limit);
        };
        /**
        * Sets the page search back to index = 0
        */
        Pager.prototype.goFirst = function () {
            var that = this;
            this.index = 0;
            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        };
        /**
        * Gets the last set of users
        */
        Pager.prototype.goLast = function () {
            var that = this;
            this.index = this.last - (this.last % this.limit);
            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        };
        /**
        * Sets the page search back to index = 0
        */
        Pager.prototype.goNext = function () {
            var that = this;
            this.index += this.limit;
            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        };
        /**
        * Sets the page search back to index = 0
        */
        Pager.prototype.goPrev = function () {
            var that = this;
            this.index -= this.limit;
            if (this.index < 0)
                this.index = 0;
            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        };
        /**
        * Called when the controller is being destroyed
        */
        Pager.prototype.onDispose = function () {
        };
        return Pager;
    })();
    HatcheryPlugin.Pager = Pager;
})(HatcheryPlugin || (HatcheryPlugin = {}));
var HatcheryPlugin;
(function (HatcheryPlugin) {
    var PluginCtrl = (function () {
        function PluginCtrl(scope, http, apiUrl) {
            this.plugins = [];
            this.error = false;
            this.errorMsg = "";
            this.loading = false;
            this.http = http;
            this.scope = scope;
            this.apiURL = apiUrl;
            this.successMessage = "";
            this.editMode = false;
            this.pluginToken = {};
            this.pager = new HatcheryPlugin.Pager(this.fetchPlugins.bind(this));
            this.pager.goFirst();
        }
        /**
        * Gets a list of plugins
        */
        PluginCtrl.prototype.fetchPlugins = function (index, limit) {
            var that = this;
            that.loading = true;
            that.error = false;
            that.errorMsg = "";
            var toRet = this.http.get(appEngineURL + "/app-engine/plugins?index=" + index + "&limit=" + limit);
            toRet.then(function (response) {
                that.plugins = response.data.data;
            }).catch(function (err) {
                that.error = true;
                that.errorMsg = err.message;
            }).finally(function () {
                that.loading = false;
            });
            return toRet;
        };
        /**
        * Creates a new plugin
        */
        PluginCtrl.prototype.createPlugin = function () {
            this.scope.newPluginForm.$setSubmitted();
            if (this.scope.newPluginForm.$valid == false)
                return;
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var pluginToken = this.pluginToken;
            if (this.editMode) {
                that.http.put(appEngineURL + "/plugins/update/" + pluginToken._id, pluginToken).then(function (token) {
                    if (token.data.error) {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else {
                        that.successMessage = token.data.message;
                        pluginToken.lastModified = Date.now();
                    }
                    that.loading = false;
                });
            }
            else {
                that.http.post(appEngineURL + "/plugins/create", pluginToken).then(function (response) {
                    if (response.data.error) {
                        that.error = true;
                        that.errorMsg = response.data.message;
                    }
                    else {
                        that.plugins.push(response.data.data);
                        that.showNewPluginForm = false;
                    }
                    that.loading = false;
                });
            }
        };
        /**
        * Opens the media browser
        */
        PluginCtrl.prototype.openMediaBrowser = function () {
            this.showMediaBrowser = true;
        };
        /**
        * Closes the media browser
        */
        PluginCtrl.prototype.closeMediaBrowser = function () {
            this.showMediaBrowser = false;
        };
        /**
        * Selects a file from the media browser
        */
        PluginCtrl.prototype.selectFile = function (file) {
            this.showMediaBrowser = false;
            this.pluginToken.image = file.publicURL;
        };
        /**
        * Sets the page into post mode
        */
        PluginCtrl.prototype.newPluginMode = function () {
            this.scope.newPluginForm.$setUntouched();
            this.scope.newPluginForm.$setPristine();
            this.pluginToken = {
                name: "",
                description: "",
                plan: "Basic",
                path: "",
                deployables: [],
                image: "",
                author: "Mathew Henson",
                version: "0.0.1"
            };
            this.editMode = false;
            this.successMessage = "";
            this.showNewPluginForm = !this.showNewPluginForm;
        };
        PluginCtrl.$inject = ["$scope", "$http", "apiURL"];
        return PluginCtrl;
    })();
    HatcheryPlugin.PluginCtrl = PluginCtrl;
})(HatcheryPlugin || (HatcheryPlugin = {}));
