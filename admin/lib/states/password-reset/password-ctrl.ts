module clientAdmin
{
	/**
	* Controller for the password reset html
	*/
    export class PasswordCtrl
	{
		private http: ng.IHttpService;
        private q: ng.IQService;
        private loginToken: { user: string; key: string; password: string; };
		private error: boolean;
        private errorMsg: string;
        private usersURL: string;
        private loading: boolean;
        private origin: string;
        private complete: boolean;

		// $inject annotation.
        public static $inject = ["$http", "$q", "usersURL", "$stateParams"];
        constructor(http: ng.IHttpService, q: ng.IQService, usersURL: string, stateParams : any)
		{
			this.http = http;
            this.q = q;
            this.usersURL = usersURL;
            this.complete = false;

            var txtbox = document.createElement("textarea");
            txtbox.innerHTML = stateParams.user;
            var userClean = txtbox.value;

            txtbox.innerHTML = stateParams.origin;
            this.origin = txtbox.value;
            if (this.origin == "undefined")
                this.origin = ".";

			// Create the login token
            this.loginToken = {
                user: userClean,
                key: stateParams.key,
				password: ""
			};

            this.loading = false;
			this.error = false;
			this.errorMsg = "";
        }

        /**
        * Sends another request to reset the password
        */
        resendRequest()
        {
            var that = this;
            var token = this.loginToken;
            var host = this.usersURL;

            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            this.http.get<UsersInterface.IResponse>(`${host}/users/${that.loginToken.user}/request-password-reset`).then(function (response)
            {
                var responseToken = response.data;
                if (responseToken.error)
                {
                    that.error = true;
                    that.errorMsg = responseToken.message;
                }
                else
                {
                    that.error = false;
                    that.errorMsg = responseToken.message;
                }

                that.loading = false;

            }).catch(function (err)
            {
                that.error = true;
                that.loading = false;
                that.errorMsg = "Could not communicate with server";
            });

        }

		/**
		* Attempts to reset the password based on the current credentials
		*/
		resetPassword()
		{
			var that = this;
			var token = this.loginToken;
            var host = this.usersURL;

            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            this.http.put<UsersInterface.IResponse>(`${host}/password-reset`, token).then(function (response)
			{
                var responseToken = response.data;
                if (responseToken.error)
                {
                    that.error = true;
                    that.errorMsg = responseToken.message;
                }
                else
                {
                    that.error = false;
                    that.errorMsg = responseToken.message;
                    that.complete = true;
                }

                that.loading = false;

			}).catch( function(err)
			{
                that.error = true;
                that.loading = false;
				that.errorMsg = "Could not communicate with server";
			});
		}
	}
}