var Animate;
(function (Animate) {
    /*
    * The payment type of the user
    */
    (function (UserPlan) {
        UserPlan[UserPlan["Free"] = 1] = "Free";
        UserPlan[UserPlan["Bronze"] = 2] = "Bronze";
        UserPlan[UserPlan["Silver"] = 3] = "Silver";
        UserPlan[UserPlan["Gold"] = 4] = "Gold";
        UserPlan[UserPlan["Platinum"] = 5] = "Platinum";
        UserPlan[UserPlan["Custom"] = 6] = "Custom";
    })(Animate.UserPlan || (Animate.UserPlan = {}));
    var UserPlan = Animate.UserPlan;
})(Animate || (Animate = {}));
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
/// <reference path="../source-client/lib/core/UserPlan.ts" />
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
    /**
    * A Class for managing the plugins screen
    */
    var PluginCtrl = (function () {
        function PluginCtrl(scope, http) {
            this.plugins = [];
            this.error = false;
            this.errorMsg = "";
            this.loading = false;
            this.http = http;
            this.scope = scope;
            this.successMessage = "";
            this.searchKeyword = "";
            this.editMode = false;
            this.pluginToken = {};
            this.pager = new HatcheryPlugin.Pager(this.fetchPlugins.bind(this));
            this.pager.goFirst();
            scope.planEnum = Animate.UserPlan;
            scope.plans = [];
            for (var i in Animate.UserPlan)
                if (!isNaN(parseInt(i)))
                    scope.plans.push({ value: parseInt(i), name: Animate.UserPlan[i], selected: false });
                else
                    break;
        }
        PluginCtrl.prototype.editPluginMode = function (plugin) {
            this.newPluginMode();
            this.editMode = true;
            this.loading = true;
            this.showNewPluginForm = true;
            var that = this;
            that.http.get(appEngineURL + "/app-engine/plugins/" + plugin._id).then(function (response) {
                that.pluginToken = response.data.data[0];
                that.loading = false;
            });
        };
        /**
        * Removes a plugin
        */
        PluginCtrl.prototype.removePlugin = function (plugin) {
            this.loading = true;
            var that = this;
            that.error = false;
            that.errorMsg = "";
            that.http.delete(appEngineURL + "/app-engine/plugins/" + plugin._id).then(function (response) {
                that.loading = false;
                plugin.confirmDelete = false;
                if (that.pluginToken = response.data.error) {
                    that.error = true;
                    that.errorMsg = response.data.message;
                    return;
                }
                that.plugins.splice(that.plugins.indexOf(plugin), 1);
            });
        };
        /**
        * Gets a list of plugins
        */
        PluginCtrl.prototype.fetchPlugins = function (index, limit) {
            var that = this;
            that.loading = true;
            that.error = false;
            that.errorMsg = "";
            var toRet = this.http.get(appEngineURL + "/app-engine/plugins?index=" + index + "&limit=" + limit + "&search=" + that.searchKeyword);
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
                that.http.put(appEngineURL + "/app-engine/plugins/" + pluginToken._id, pluginToken).then(function (token) {
                    if (token.data.error) {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else {
                        that.successMessage = token.data.message;
                        for (var i = 0, l = that.plugins.length; i < l; i++)
                            if (that.plugins[i]._id == that.pluginToken._id) {
                                that.plugins.splice(i, 1, that.pluginToken);
                                break;
                            }
                        pluginToken.lastModified = Date.now();
                    }
                    that.loading = false;
                });
            }
            else {
                that.http.post(appEngineURL + "/app-engine/plugins/create", pluginToken).then(function (response) {
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
                plan: Animate.UserPlan.Free,
                deployables: [],
                image: "",
                author: "Mathew Henson",
                version: "0.0.1"
            };
            this.editMode = false;
            this.successMessage = "";
            this.showNewPluginForm = !this.showNewPluginForm;
        };
        PluginCtrl.$inject = ["$scope", "$http"];
        return PluginCtrl;
    })();
    HatcheryPlugin.PluginCtrl = PluginCtrl;
})(HatcheryPlugin || (HatcheryPlugin = {}));
