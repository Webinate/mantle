var clientAdmin;
(function (clientAdmin) {
    /**
    * Controller for the login HTML
    */
    var LoginCtrl = (function () {
        function LoginCtrl(http, q, usersURL, state) {
            this.http = http;
            this.q = q;
            this.usersURL = usersURL;
            this._state = state;
            // Create the login token
            this.loginToken = {
                username: "",
                password: "",
                rememberMe: true
            };
            this.loading = false;
            this.error = false;
            this.errorMsg = "Hello";
        }
        /**
        * Attempts to log the user in
        */
        LoginCtrl.prototype.logIn = function () {
            var that = this;
            var token = this.loginToken;
            var host = this.usersURL;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            this.http.post(host + "/login", token).then(function (response) {
                var responseToken = response.data;
                if (responseToken.error) {
                    that.error = true;
                    that.errorMsg = responseToken.message;
                }
                else
                    that._state.go("default");
                that.loading = false;
            }).catch(function (err) {
                that.error = true;
                that.loading = false;
                that.errorMsg = "Could not communicate with server";
            });
        };
        // $inject annotation.
        LoginCtrl.$inject = ["$http", "$q", "usersURL", "$state"];
        return LoginCtrl;
    })();
    clientAdmin.LoginCtrl = LoginCtrl;
})(clientAdmin || (clientAdmin = {}));
var clientAdmin;
(function (clientAdmin) {
    /**
    * Controller for the registration HTML
    */
    var RegisterCtrl = (function () {
        function RegisterCtrl(http, q, capthaPublicKey) {
            this.http = http;
            this.q = q;
            // Create the register token
            this.registerToken = {
                username: "",
                password: "",
                email: "",
                captcha: "",
                challenge: "",
                privileges: 3
            };
            this.error = false;
            this.showSuccessMessage = false;
            this.errorMsg = "";
            this.successMessage = "";
            this.loading = false;
            // Initialize the google captcha
            jQuery('#google-captcha').each(function () {
                Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", this, { theme: "white" });
            });
        }
        /**
        * Resends the activation link
        */
        RegisterCtrl.prototype.resendActivation = function () {
            var that = this;
            var token = this.registerToken;
            var user = (token.email && token.email != "" ? token.email : token.username);
            this.loading = true;
            this.error = false;
            this.showSuccessMessage = false;
            this.errorMsg = "";
            this.successMessage = "";
            if (!user || user == "") {
                this.error = true;
                this.loading = false;
                this.errorMsg = "Please enter a valid email or username";
                return;
            }
            this.http.post("/api/users/resend-activation", { username: user }).then(function (response) {
                var responseToken = response.data;
                if (responseToken.error) {
                    that.error = true;
                    that.errorMsg = responseToken.message;
                }
                else {
                    that.showSuccessMessage = true;
                    that.successMessage = responseToken.message;
                }
                that.loading = false;
            }).catch(function (err) {
                that.error = true;
                that.loading = false;
                that.errorMsg = "Could not communicate with server";
            });
        };
        /**
        * Attempts to register a new user
        */
        RegisterCtrl.prototype.register = function () {
            var that = this;
            var token = this.registerToken;
            this.error = false;
            this.loading = true;
            this.showSuccessMessage = false;
            this.errorMsg = "";
            this.successMessage = "";
            token.challenge = Recaptcha.get_challenge();
            token.captcha = Recaptcha.get_response();
            this.http.post("/api/users/register", token).then(function (response) {
                var responseToken = response.data;
                if (responseToken.error) {
                    that.error = true;
                    that.errorMsg = responseToken.message;
                }
                else {
                    that.showSuccessMessage = true;
                    that.successMessage = responseToken.message;
                }
                that.loading = false;
            }).catch(function (err) {
                that.loading = false;
                that.error = true;
                that.errorMsg = "Could not communicate with server";
            });
        };
        // $inject annotation.
        RegisterCtrl.$inject = ["$http", "$q", "capthaPublicKey"];
        return RegisterCtrl;
    })();
    clientAdmin.RegisterCtrl = RegisterCtrl;
})(clientAdmin || (clientAdmin = {}));
var clientAdmin;
(function (clientAdmin) {
    /**
    * Abstract class for controllers that page through content items.
    */
    var PagedContentCtrl = (function () {
        function PagedContentCtrl(http) {
            PagedContentCtrl.singleton = this;
            this.http = http;
            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this.index = 0;
            this.limit = 10;
            this.last = Infinity;
            this.searchTerm = "";
        }
        /**
       * Gets the current page number
       * @returns {number}
       */
        PagedContentCtrl.prototype.getPageNum = function () {
            return (this.index / this.limit) + 1;
        };
        /**
        * Gets the total number of pages
        * @returns {number}
        */
        PagedContentCtrl.prototype.getTotalPages = function () {
            return Math.ceil(this.last / this.limit);
        };
        /**
        * Sets the page search back to index = 0
        */
        PagedContentCtrl.prototype.goFirst = function () {
            this.index = 0;
        };
        /**
        * Gets the last set of users
        */
        PagedContentCtrl.prototype.goLast = function () {
            this.index = this.last - this.limit;
        };
        /**
        * Sets the page search back to index = 0
        */
        PagedContentCtrl.prototype.goNext = function () {
            this.index += this.limit;
        };
        /**
        * Sets the page search back to index = 0
        */
        PagedContentCtrl.prototype.goPrev = function () {
            this.index -= this.limit;
            if (this.index < 0)
                this.index = 0;
        };
        /**
        * Called when the controller is being destroyed
        */
        PagedContentCtrl.prototype.onDispose = function () {
        };
        return PagedContentCtrl;
    })();
    clientAdmin.PagedContentCtrl = PagedContentCtrl;
})(clientAdmin || (clientAdmin = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var clientAdmin;
(function (clientAdmin) {
    /**
    * Controller for the dashboard users section
    */
    var UsersCtrl = (function (_super) {
        __extends(UsersCtrl, _super);
        function UsersCtrl(scope, http, usersURL) {
            _super.call(this, http);
            this.scope = scope;
            this.usersURL = usersURL;
            this.users = [];
            this.showUserForm = false;
            this.newUser = { email: "", password: "", username: "", type: "3", privileges: 3 };
            this.getUsers();
        }
        /**
        * Opens the new user form
        */
        UsersCtrl.prototype.newUserMode = function () {
            this.scope.newUserForm.$setUntouched();
            this.scope.newUserForm.$setPristine();
            this.showUserForm = !this.showUserForm;
        };
        /**
        * Sets the page search back to index = 0
        */
        UsersCtrl.prototype.goFirst = function () {
            _super.prototype.goFirst.call(this);
            this.getUsers();
        };
        /**
        * Gets the last set of users
        */
        UsersCtrl.prototype.goLast = function () {
            _super.prototype.goLast.call(this);
            this.getUsers();
        };
        /**
        * Sets the page search back to index = 0
        */
        UsersCtrl.prototype.goNext = function () {
            _super.prototype.goNext.call(this);
            this.getUsers();
        };
        /**
        * Sets the page search back to index = 0
        */
        UsersCtrl.prototype.goPrev = function () {
            _super.prototype.goPrev.call(this);
            this.getUsers();
        };
        /**
        * Fetches the users from the database
        */
        UsersCtrl.prototype.getUsers = function () {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var index = this.index;
            var limit = this.limit;
            that.http.get(that.usersURL + "/users?verbose=true&index=" + index + "&limit=" + limit + "&search=" + that.searchTerm).then(function (token) {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                    that.users = [];
                    that.last = Infinity;
                }
                else {
                    that.users = token.data.data;
                    that.last = token.data.count;
                }
                that.loading = false;
            });
        };
        /**
        * Removes a user from the database
        * @param {UsersInterface.IUserEntry} user The user to remove
        */
        UsersCtrl.prototype.removeUser = function (user) {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            that.http.delete(that.usersURL + "/remove-user/" + user.username).then(function (token) {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.users.splice(that.users.indexOf(user), 1);
                that.loading = false;
                user.confirmDelete = false;
            });
        };
        /**
        * Creates a new user
        */
        UsersCtrl.prototype.createNewUser = function () {
            this.scope.newUserForm.$setSubmitted();
            if (this.scope.newUserForm.$valid == false)
                return;
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var registerToken = this.newUser;
            registerToken.privileges = registerToken.type == "2" ? 2 : 3;
            that.http.post(that.usersURL + "/create-user", registerToken).then(function (token) {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.users.push(token.data.data);
                that.loading = false;
            });
        };
        // $inject annotation.
        UsersCtrl.$inject = ["$scope", "$http", "usersURL"];
        return UsersCtrl;
    })(clientAdmin.PagedContentCtrl);
    clientAdmin.UsersCtrl = UsersCtrl;
})(clientAdmin || (clientAdmin = {}));
var clientAdmin;
(function (clientAdmin) {
    /**
    * Controller for the dashboard posts section
    */
    var PostsCtrl = (function (_super) {
        __extends(PostsCtrl, _super);
        function PostsCtrl(scope, http, apiURL, categories) {
            _super.call(this, http);
            this.newCategoryMode = false;
            this.scope = scope;
            this.apiURL = apiURL;
            this.posts = [];
            this.successMessage = "";
            this.tagString = "";
            this.showNewPostForm = false;
            this.showCategoryDelete = false;
            this.editMode = false;
            this.showFilters = false;
            this.searchKeyword = "";
            this.searchCategory = "";
            this.sortOrder = "desc";
            this.sortType = "created";
            this.postToken = { title: "", content: "", slug: "", tags: [], categories: [], public: true };
            this.getPosts();
            tinymce.init({
                height: 350,
                selector: "textarea", plugins: ["media", "image", "link", "code", "textcolor", "colorpicker", "table", "wordcount", "lists", "contextmenu"],
                toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons"
            });
            // The category token
            this.categoryToken = { title: "", description: "", slug: "" };
            // Fetches the categories
            this.categories = categories;
        }
        PostsCtrl.prototype.swapOrder = function () {
            this.sortOrder = (this.sortOrder == 'asc' ? 'desc' : 'asc');
            this.getPosts();
        };
        PostsCtrl.prototype.swapSortType = function () {
            this.sortType = (this.sortType == 'created' ? 'updated' : 'created');
            this.getPosts();
        };
        /**
        * Gets a list of categories
        */
        PostsCtrl.prototype.getCategories = function () {
            var that = this;
            that.http.get(that.apiURL + "/posts/get-categories").then(function (categories) {
                that.categories = categories.data.data;
            });
        };
        /**
        * Sets the page into post mode
        */
        PostsCtrl.prototype.newPostMode = function () {
            this.scope.newPostForm.$setUntouched();
            this.scope.newPostForm.$setPristine();
            this.postToken = { title: "", content: "", slug: "", tags: [], categories: [], public: true };
            this.editMode = false;
            this.successMessage = "";
            tinymce.editors[0].setContent("");
            this.showNewPostForm = !this.showNewPostForm;
        };
        /**
        * Sets the page into edit mode
        */
        PostsCtrl.prototype.editPostMode = function (post) {
            this.newPostMode();
            this.editMode = true;
            this.loading = true;
            this.showNewPostForm = true;
            var that = this;
            that.http.get(that.apiURL + "/posts/get-post/" + post.slug).then(function (post) {
                that.postToken = post.data.data;
                that.loading = false;
                tinymce.editors[0].setContent(that.postToken.content);
            });
        };
        /**
        * Sets the page search back to index = 0
        */
        PostsCtrl.prototype.goFirst = function () {
            _super.prototype.goFirst.call(this);
            this.getPosts();
        };
        /**
        * Gets the last set of users
        */
        PostsCtrl.prototype.goLast = function () {
            _super.prototype.goLast.call(this);
            this.getPosts();
        };
        /**
        * Sets the page search back to index = 0
        */
        PostsCtrl.prototype.goNext = function () {
            _super.prototype.goNext.call(this);
            this.getPosts();
        };
        /**
        * Sets the page search back to index = 0
        */
        PostsCtrl.prototype.goPrev = function () {
            _super.prototype.goPrev.call(this);
            this.getPosts();
        };
        /**
        * Fetches the posts from the database
        */
        PostsCtrl.prototype.getPosts = function () {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var index = this.index;
            var limit = this.limit;
            var keyword = this.searchKeyword;
            var searchCategory = this.searchCategory;
            var order = this.sortOrder;
            var sortType = this.sortType;
            that.http.get(that.apiURL + "/posts/get-posts?visibility=all&verbose=true&sort=" + sortType + "&sortOrder=" + order + "&categories=" + searchCategory + "&index=" + index + "&limit=" + limit + "&keyword=" + keyword).then(function (token) {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                    that.posts = [];
                    that.last = Infinity;
                }
                else {
                    that.posts = token.data.data;
                    that.last = token.data.count;
                }
                that.loading = false;
            });
        };
        /**
        * Processes the tags in a post array of keywords
        */
        PostsCtrl.prototype.processTags = function () {
            var newTags = this.tagString.split(",");
            for (var i = 0, l = newTags.length; i < l; i++) {
                var newTag = newTags[i].trim();
                if (newTag != "" && this.postToken.tags.indexOf(newTag) == -1)
                    this.postToken.tags.push(newTag);
            }
            this.scope.tagForm.$setUntouched();
            this.scope.tagForm.$setPristine();
            this.tagString = "";
        };
        /**
        * Removes a tag from the post array
        */
        PostsCtrl.prototype.removeTag = function (tag) {
            this.postToken.tags.splice(this.postToken.tags.indexOf(tag), 1);
        };
        /**
        * Removes a user from the database
        * @param {UsersInterface.IUserEntry} user The user to remove
        */
        PostsCtrl.prototype.removePost = function (post) {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            that.http.delete(that.apiURL + "/posts/remove-post/" + post._id).then(function (token) {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.posts.splice(that.posts.indexOf(post), 1);
                that.loading = false;
                post.confirmDelete = false;
            });
        };
        /**
        * Removes a category from the database by ID
        * @param {modepress.ICategory} category The category to remove
        */
        PostsCtrl.prototype.removeCategory = function (category) {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            that.http.delete(that.apiURL + "/posts/remove-category/" + category._id).then(function (token) {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else {
                    if (that.postToken.categories.indexOf(category.slug) != -1)
                        that.postToken.categories.splice(that.postToken.categories.indexOf(category.slug), 1);
                    that.categories.splice(that.categories.indexOf(category), 1);
                }
                that.loading = false;
            });
        };
        /**
        * Creates a new user
        */
        PostsCtrl.prototype.createPost = function () {
            this.scope.newPostForm.$setSubmitted();
            if (this.scope.newPostForm.$valid == false)
                return;
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var postToken = this.postToken;
            postToken.content = tinymce.editors[0].getContent();
            if (this.editMode) {
                that.http.put(that.apiURL + "/posts/update-post/" + postToken._id, postToken).then(function (token) {
                    if (token.data.error) {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else {
                        that.successMessage = token.data.message;
                        postToken.lastUpdated = Date.now();
                    }
                    that.loading = false;
                });
            }
            else {
                that.http.post(that.apiURL + "/posts/create-post", postToken).then(function (token) {
                    if (token.data.error) {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else {
                        that.posts.push(token.data.data);
                        that.showNewPostForm = false;
                    }
                    that.loading = false;
                });
            }
        };
        /**
        * Creates a new category
        */
        PostsCtrl.prototype.createCategory = function () {
            this.scope.newCategoryForm.$setSubmitted();
            if (this.scope.newCategoryForm.$valid == false)
                return;
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var categoryToken = this.categoryToken;
            that.http.post(that.apiURL + "/posts/create-category", categoryToken).then(function (token) {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else {
                    that.categories.push(token.data.data);
                    that.categoryToken.description = "";
                    that.categoryToken.title = "";
                    that.categoryToken.slug = "";
                }
                that.loading = false;
                that.scope.newCategoryForm.$setUntouched();
                that.scope.newCategoryForm.$setPristine();
            });
        };
        /**
        * Adds this category to the post's selected categories
        */
        PostsCtrl.prototype.selectCategory = function (category) {
            if (this.postToken.categories.indexOf(category.slug) == -1)
                this.postToken.categories.push(category.slug);
            else
                this.postToken.categories.splice(this.postToken.categories.indexOf(category.slug), 1);
        };
        // $inject annotation.
        PostsCtrl.$inject = ["$scope", "$http", "apiURL", "categories"];
        return PostsCtrl;
    })(clientAdmin.PagedContentCtrl);
    clientAdmin.PostsCtrl = PostsCtrl;
})(clientAdmin || (clientAdmin = {}));
var clientAdmin;
(function (clientAdmin) {
    /**
    * An authentication service for checking if the user is logged in
    */
    var Authenticator = (function () {
        function Authenticator(http, q, usersURL) {
            this._http = http;
            this._q = q;
            this._usersURL = usersURL;
        }
        /**
        * Logs the user out if they are already logged in
        * @returns {ng.IPromise<boolean>}
        */
        Authenticator.prototype.logout = function () {
            var that = this;
            return new this._q(function (resolve, reject) {
                that._http.get(that._usersURL + "/logout").then(function (response) {
                    var token = response.data;
                    if (token.error)
                        return resolve(false);
                    return resolve(true);
                }).catch(function (error) {
                    return resolve(false);
                });
            });
        };
        /**
        * Checks to see if the current session is authenticated
        * @returns {ng.IPromise<boolean>}
        */
        Authenticator.prototype.authenticated = function () {
            var that = this;
            return new this._q(function (resolve, reject) {
                that._http.get(that._usersURL + "/authenticated").then(function (response) {
                    var token = response.data;
                    if (token.error)
                        return resolve(false);
                    return resolve(token.authenticated);
                }).catch(function (error) {
                    return resolve(false);
                });
            });
        };
        // $inject annotation.
        Authenticator.$inject = ["$http", "$q", "usersURL"];
        return Authenticator;
    })();
    clientAdmin.Authenticator = Authenticator;
})(clientAdmin || (clientAdmin = {}));
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
        function Config(routeProvider, stateProvider, $locationProvider, $httpProvider) {
            $locationProvider.html5Mode(true);
            // Allows us to use CORS with angular
            $httpProvider.defaults.withCredentials = true;
            // When we go to logout - it redirects us back to the login screen after its task is complete
            routeProvider.when("/admin/logout", ["$state", "Authenticator", function (state, auth) {
                    return auth.logout().then(function (val) {
                        state.go("login");
                    });
                }]);
            // If the path doesn't match any of the urls go to the default state
            routeProvider.otherwise(function ($injector, $location) {
                var $state = $injector.get("$state");
                $state.go("default");
            });
            // Setup the different states
            stateProvider
                .state("default", {
                views: {
                    "main-view": {
                        templateUrl: "admin/templates/dashboard.html"
                    }
                },
                url: "/admin",
                authenticate: true
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
                onExit: function () {
                    tinymce.remove("textarea");
                },
                resolve: {
                    categories: ["$http", "apiURL", function ($http, apiURL) {
                            return $http.get(apiURL + "/posts/get-categories").then(function (categories) {
                                return categories.data.data;
                            });
                        }]
                }
            })
                .state("login", {
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
                .state("register", {
                views: {
                    "main-view": {
                        templateUrl: "admin/templates/register.html",
                        controller: "registerCtrl",
                        controllerAs: "controller"
                    }
                },
                onExit: function () {
                    Recaptcha.destroy();
                },
                url: '/admin/register',
                authenticate: false
            })
                .state("message", {
                views: {
                    "main-view": {
                        templateUrl: "admin/templates/message.html",
                        controller: ["$scope", "$stateParams", function ($scope, $stateParams) {
                                // Decodes the html
                                var txtbox = document.createElement("textarea");
                                txtbox.innerHTML = $stateParams.message;
                                $scope.message = txtbox.value;
                                $scope.error = ($stateParams.status == "error" ? true : false);
                            }]
                    }
                },
                url: "/admin/message/:message/:status"
            });
            //.state('myProtectedContent', {
            //	url: '/myProtectedContent',
            //	templateUrl: 'sections/myProtectedContent.html',
            //	controller: 'myProtectedContentCtrl',
            //	controllerAs: "controller",
            //	resolve: { authenticate: authenticate }
            //})
            //.state('alsoProtectedContent', {
            //	url: '/alsoProtectedContent',
            //	templateUrl: 'sections/alsoProtectedContent.html',
            //	controller: 'alsoProtectedContentCtrl',
            //	controllerAs: "controller",
            //	resolve: {
            //		authenticated: ["AdminService", function (adminService: AdminService)
            //		{
            //			return adminService.authenticated();
            //		}]
            //	}
            //})
            //function authenticate($q: angular.IQService, user, $state, $timeout)
            //{
            //	if (user.isAuthenticated())
            //	{
            //		// Resolve the promise successfully
            //		return $q.when()
            //	} else
            //	{
            //		// The next bit of code is asynchronously tricky.
            //		$timeout(function ()
            //		{
            //			// This code runs after the authentication promise has been rejected.
            //			// Go to the log-in page
            //			$state.go('logInPage')
            //		})
            //		// Reject the authentication promise to prevent the state from loading
            //		return $q.reject()
            //	}
            //}
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
            "$locationProvider",
            "$httpProvider"
        ];
        return Config;
    })();
    clientAdmin.Config = Config;
})(clientAdmin || (clientAdmin = {}));
/**
* The admin code for the website
*/
var clientAdmin;
(function (clientAdmin) {
    'use strict';
    angular.module('admin', ["ui.router", "ngAnimate", "ngSanitize"])
        .constant("usersURL", _users)
        .constant("apiURL", "./api")
        .filter("htmlToPlaintext", function () {
        return function (text) {
            return String(text).replace(/<[^>]+>/gm, '');
        };
    })
        .constant("capthaPublicKey", "6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT")
        .controller("loginCtrl", clientAdmin.LoginCtrl)
        .controller("registerCtrl", clientAdmin.RegisterCtrl)
        .controller("usersCtrl", clientAdmin.UsersCtrl)
        .controller("postsCtrl", clientAdmin.PostsCtrl)
        .service("Authenticator", clientAdmin.Authenticator)
        .config(clientAdmin.Config)
        .run(["$rootScope", "$location", "$state", "Authenticator", function ($rootScope, $location, $state, auth) {
            // Redirect to login if route requires auth and you're not logged in
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                if (!toState.forceTransition && toState.authenticate !== undefined) {
                    event.preventDefault();
                    auth.authenticated().then(function (val) {
                        if (toState.authenticate && !val) {
                            $rootScope.returnToState = toState.url;
                            $rootScope.returnToStateParams = toParams.Id;
                            //$location.path('/login');
                            toState.forceTransition = false;
                            $state.go("login");
                        }
                        else if (!toState.authenticate && val) {
                            $rootScope.returnToState = toState.url;
                            $rootScope.returnToStateParams = toParams.Id;
                            //$location.path('/login');
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
})(clientAdmin || (clientAdmin = {}));
/// <reference path="../src-server/modepress.d.ts" />
/// <reference path="lib/definitions/jquery.d.ts" />
/// <reference path="lib/definitions/angular.d.ts" />
/// <reference path="lib/definitions/angular-ui-router.d.ts" />
/// <reference path="lib/definitions/tinymce.d.ts" />
/// <reference path="lib/definitions/recaptcha.d.ts" />
/// <reference path="lib/definitions/webinate-users.d.ts" />
/// <reference path="lib/controllers/LoginCtrl.ts" />
/// <reference path="lib/controllers/RegisterCtrl.ts" />
/// <reference path="lib/controllers/PagedContentCtrl.ts" />
/// <reference path="lib/controllers/UsersCtrl.ts" />
/// <reference path="lib/controllers/PostsCtrl.ts" />
/// <reference path="lib/Authenticator.ts" />
/// <reference path="lib/Config.ts" />
/// <reference path="lib/Application.ts" /> 
