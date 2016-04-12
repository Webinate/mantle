module clientAdmin
{
	/**
	* Controller for the dashboard users section
	*/
    export class UsersCtrl
	{
        private newUser: { username: string; password: string; email: string; type: string; privileges: number };
        private usersURL: string;
        protected users: Array<UsersInterface.IUserEntry>;
        public showUserForm: boolean;
        public scope: any;

        private _q: ng.IQService;
        private http: ng.IHttpService;
        private error: boolean;
        private loading: boolean;
        private errorMsg: string;
        private pager: IPagerRemote;
        private searchTerm: string;

		// $inject annotation.
        public static $inject = ["$scope", "$http", "usersURL", "$q"];
        constructor(scope: any, http: ng.IHttpService, usersURL: string, $q: ng.IQService)
        {
            this.http = http;
            this.scope = scope;
            this.usersURL = usersURL;
            this.users = [];
            this.showUserForm = false;
            this.newUser = { email: "", password: "", username: "", type: "3", privileges: 3 };

            this._q = $q;
            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this.searchTerm = "";
            this.pager = this.createPagerRemote();
        }

        /**
        * Opens the new user form
        */
        newUserMode()
        {
            this.scope.newUserForm.$setUntouched();
            this.scope.newUserForm.$setPristine();
            this.showUserForm = !this.showUserForm
        }

        /**
         * Fetches the users from the database
         * @returns {IPagerRemote}
         */
        createPagerRemote(): IPagerRemote
        {
            var that = this;
            var remote: IPagerRemote = {
                update: function(index?: number, limit? : number)
                {
                    that.error = false;
                    that.errorMsg = "";

                    return new that._q<number>(function(resolve, reject)
                    {
                        that.http.get<Modepress.IGetPosts>(`${that.usersURL}/users?verbose=true&index=${index}&limit=${limit}&search=${that.searchTerm}`).then(function (token)
                        {
                            if (token.data.error) {
                                that.error = true;
                                that.errorMsg = token.data.message;
                                that.users = [];
                                resolve(1);
                            }
                            else {
                                that.users = token.data.data;
                                resolve(token.data.count);
                            }

                            that.loading = false;
                        });
                    });
                }
            };

            return remote;
        }

        /**
        * Removes a user from the database
        * @param {UsersInterface.IUserEntry} user The user to remove
        */
        removeUser(user: UsersInterface.IUserEntry)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that.http.delete<UsersInterface.IResponse>(`${that.usersURL}/remove-user/${user.username}`).then(function (token)
            {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.users.splice(that.users.indexOf(user), 1);

                that.loading = false;
                (<any>user).confirmDelete = false;
            });
        }

        /**
        * Creates a new user
        */
        createNewUser()
        {
            this.scope.newUserForm.$setSubmitted();

            if (this.scope.newUserForm.$valid == false)
                return;

            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var registerToken = this.newUser;

            registerToken.privileges = registerToken.type == "2" ? 2 : 3;

            that.http.post<UsersInterface.IGetUser>(`${that.usersURL}/create-user`, registerToken).then(function(token)
            {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.users.push(token.data.data);

                that.loading = false;
            });
        }
	}
}