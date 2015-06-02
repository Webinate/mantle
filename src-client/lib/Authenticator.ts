module clientAdmin
{
	/**
	* An authentication service for checking if the user is logged in
	*/
    export class Authenticator
	{
		private _http: ng.IHttpService;
        private _q: ng.IQService;
        private _usersURL: string;
        
		// $inject annotation.
        public static $inject = ["$http", "$q", "usersURL"];
        constructor(http: ng.IHttpService, q: ng.IQService, usersURL: string )
		{
            this._http = http;
            this._q = q;
            this._usersURL = usersURL;
        }

        /**
		* Logs the user out if they are already logged in
        * @returns {ng.IPromise<boolean>}
		*/
        public logout(): ng.IPromise<boolean>
        {
            var that = this;
            return new this._q(function (resolve, reject)
            {
                that._http.get<UsersInterface.IResponse>(`${that._usersURL}/logout`).then(function (response)
                {
                    var token: UsersInterface.IResponse = response.data;
                    if (token.error)
                        return resolve(false);

                    return resolve(true);

                }).catch(function (error: Error)
                {
                    return resolve(false);
                });
            });
        }

		/**
		* Checks to see if the current session is authenticated
        * @returns {ng.IPromise<boolean>}
		*/
        public authenticated(): ng.IPromise<boolean>
        {
            var that = this;
            return new this._q( function(resolve, reject)
            {
                that._http.get<UsersInterface.IAuthenticationResponse>(`${that._usersURL}/authenticated`).then(function (response)
                {
                    var token: UsersInterface.IAuthenticationResponse = response.data;
                    if (token.error)
                        return resolve(false);

                    return resolve(token.authenticated);

                }).catch(function(error: Error)
                {
                    return resolve(false);
                });
            });
		}
	}
}