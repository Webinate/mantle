var clientAdmin;
(function (clientAdmin) {
    'use strict';
    /**
    * Configures the Angular application
    */
    var Config = (function () {
        /**
        * Creates an instance of the configurator
        */
        function Config(routeProvider, stateProvider, $locationProvider) {
            $locationProvider.html5Mode(true);
            // if the path doesn't match any of the urls you configured
            // 'otherwise' will take care of routing back to the index
            routeProvider.otherwise("/");
            //stateProvider.state("home", { url: "/", templateUrl: "templates/home.html", controller: "homeCtrl", controllerAs: "controller" });
            //stateProvider.state("about", { url: "/about", templateUrl: "templates/about.html", controller: "aboutCtrl", controllerAs: "controller" });
            //stateProvider.state("contact", { url: "/contact", templateUrl: "templates/contact.html", controller: "contactCtrl", controllerAs: "controller" });
            //stateProvider.state("projects", { url: "/projects", templateUrl: "templates/projects.html" });
            //stateProvider.state("about", { url: "/about", templateUrl: "templates/about.html" });
        }
        // $inject annotation.
        Config.$inject = [
            "$urlRouterProvider",
            "$stateProvider",
            "$locationProvider"
        ];
        return Config;
    })();
    clientAdmin.Config = Config;
})(clientAdmin || (clientAdmin = {}));
//# sourceMappingURL=Config.js.map