declare var _users: string;
declare var _cache: string;
declare var _plugins: Array<ModepressAdmin.IAdminPlugin>;

/**
* The admin code for the website
*/
module clientAdmin
{
    'use strict';

    var appModule = angular.module("admin", ["ui.router", "ngAnimate", "ngSanitize", 'angular-loading-bar', 'ngFileUpload', 'admin-templates'])
        .constant("usersURL", _users )
        .constant("apiURL", "./api")
        .constant("cacheURL", _cache)
        .constant("capthaPublicKey", "6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT")
        .filter("htmlToPlaintext", function()
        {
            return function (text)
            {
                return String(text).replace(/<[^>]+>/gm, '');
            }
        })
        .filter('bytes', function ()
        {
            return function (bytes, precision)
            {
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                    number = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
            }
        })
        .controller("loginCtrl", LoginCtrl)
        .controller("registerCtrl", RegisterCtrl)
        .controller("passwordCtrl", PasswordCtrl)
        .controller("usersCtrl", UsersCtrl)
        .controller("postsCtrl", PostsCtrl)
        .controller("seoCtrl", SEOCtrl)
        .controller("mediaCtrl", MediaCtrl)
        .service("Authenticator", Authenticator)
        .directive('pager', Pager.factory())
        .directive('errorModal', ErrorModal.factory())
        .directive('addButton', AddButton.factory())
        .directive('approveButton', ApproveButton.factory())
        .directive('removeButton', RemoveButton.factory())
        .directive('toggleButton', ToggleButton.factory())
        .directive('itemPanel', ItemPanel.factory())
        .directive('searchBar', SearchBar.factory())
        .config(Config)
        .run(["$rootScope", "$location", "$state", "Authenticator", function ($rootScope, $location, $state: ng.ui.IStateService, auth: Authenticator)
        {
            // Redirect to login if route requires auth and you're not logged in
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams )
            {
                if (!toState.forceTransition && toState.authenticate !== undefined) {
                    event.preventDefault();

                    auth.authenticated().then(function (val)
                    {
                        if (toState.authenticate && !val) {
                            $rootScope.returnToState = toState.url;
                            $rootScope.returnToStateParams = toParams.Id;
                            toState.forceTransition = false;
                            $state.go("login");
                        }
                        else if (!toState.authenticate && val) {
                            $rootScope.returnToState = toState.url;
                            $rootScope.returnToStateParams = toParams.Id;
                            toState.forceTransition = false;
                            $state.go("default");
                        }
                        else {
                            toState.forceTransition = true;
                            $state.go(toState.name);
                        }
                    });
                }
            });
        }]);

    for (var i = 0, l = _plugins.length; i < l; i++)
        _plugins[i].onInit(appModule);
}