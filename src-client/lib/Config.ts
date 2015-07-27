module clientAdmin
{
	'use strict';

	/**
	* Configures the Angular application
	*/
	export class Config
	{
		// $inject annotation.
		public static $inject = [
			"$urlRouterProvider",
            "$stateProvider",
            "$locationProvider",
            "$httpProvider",
            "cfpLoadingBarProvider"
		];

		/**
		* Creates an instance of the configurator
		*/
        constructor(routeProvider: angular.ui.IUrlRouterProvider, stateProvider: angular.ui.IStateProvider, $locationProvider: angular.ILocationProvider, $httpProvider: angular.IHttpProvider, cfpLoadingBarProvider)
		{
            $locationProvider.html5Mode(true);
            
            // Turn off the loading bar spinner
            cfpLoadingBarProvider.includeSpinner = false;
        
            // Allows us to use CORS with angular
            $httpProvider.defaults.withCredentials = true;
            
            // When we go to logout - it redirects us back to the login screen after its task is complete
            routeProvider.when("/admin/logout", ["$state", "Authenticator", function(state: ng.ui.IStateService, auth: Authenticator)
            {
                return auth.logout().then(function (val)
                {
                    state.go("login");
                });
            }]);
			
            // If the path doesn't match any of the urls go to the default state
            routeProvider.otherwise(function ($injector, $location)
            {
                var $state = $injector.get("$state");
                $state.go("default");
            });
			
            // Setup the different states
			stateProvider
                .state("default",
                {
                    views: {
                        "main-view": {
                            templateUrl: "admin/templates/dashboard.html"
                        }
                    },
                    url: "/admin",
                    authenticate: true
                })
                .state('default.seo', {
                    templateUrl: 'admin/templates/dash-seo.html',
                    authenticate: true,
                    controller: "seoCtrl",
                    controllerAs: "controller"
                })
                .state('default.media', {
                    templateUrl: 'admin/templates/dash-media.html',
                    authenticate: true,
                    controller: "mediaCtrl",
                    controllerAs: "mediaController"
                })
                .state('default.users', {
                    templateUrl: 'admin/templates/dash-users.html',
                    authenticate: true,
                    controller: "usersCtrl",
                    controllerAs: "controller"
                })
                .state('default.posts', {
                    templateUrl: 'admin/templates/dash-posts.html',
                    authenticate: true,
                    controller: "postsCtrl",
                    controllerAs: "controller",
                    onExit: function()
                    {
                        tinymce.remove("textarea");
                    },
                    resolve: {
                        categories: ["$http", "apiURL", function ($http: ng.IHttpService, apiURL: string)
                        {
                            return $http.get<modepress.IGetCategories>(`${apiURL}/posts/get-categories`).then(function (categories)
                            {
                                return categories.data.data;
                            });
                        }]
                    }
                })
                .state("login",
				{
					views: {
						"main-view": {
                            templateUrl: "admin/templates/log-in.html",
							controller: "loginCtrl",
							controllerAs: "controller"
						}
					},
                    url: '/admin/login',
                    authenticate: false
                })
				.state("register",
				{
					views: {
						"main-view": {
                            templateUrl: "admin/templates/register.html",
                            controller: "registerCtrl",
							controllerAs: "controller"
						}
                    },
					onExit: function ()
					{
						Recaptcha.destroy();
					},					
                    url: '/admin/register',
                    authenticate: false		
				})
				.state("message",
				{
					views: {
						"main-view": {
                            templateUrl: "admin/templates/message.html",
                            controller: ["$scope", "$stateParams", function ($scope, $stateParams )
							{
								// Decodes the html
                                var txtbox = document.createElement("textarea");
                                txtbox.innerHTML = $stateParams.message;
								$scope.message = txtbox.value;
                                $scope.error = ($stateParams.status == "error" ? true : false );
							}]
						}
					},					
                    url: "/admin/message/:message/:status"
                })
		}
	}
}