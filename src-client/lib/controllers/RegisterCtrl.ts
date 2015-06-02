module clientAdmin
{
	/**
	* Controller for the registration HTML
	*/
	export class RegisterCtrl
	{
		private http: ng.IHttpService;
        private q: ng.IQService;
        private registerToken: UsersInterface.IRegisterToken;
		private error: boolean;
		private errorMsg: string;
		private showSuccessMessage: boolean;
		private successMessage: string;
		private loading: boolean;

		// $inject annotation.
        public static $inject = ["$http", "$q", "capthaPublicKey"];
        constructor(http: ng.IHttpService, q: ng.IQService, capthaPublicKey: string)
		{
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
			jQuery('#google-captcha').each(function(){				
				Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", this, { theme: "white" });
			});
		}

		/**
		* Resends the activation link
		*/
		resendActivation()
		{
			var that = this;
			var token = this.registerToken;
			var user = (token.email && token.email != "" ? token.email : token.username);
			
			this.loading = true;
			this.error = false;
			this.showSuccessMessage = false;
			this.errorMsg = "";
			this.successMessage = "";

			if (!user || user == "")
			{
				this.error = true;
				this.loading = false;
				this.errorMsg = "Please enter a valid email or username";
				return;
			}

            this.http.post<UsersInterface.IResponse>("/api/users/resend-activation", { username: user }).then(function (response)
			{
				var responseToken = response.data;
				if (responseToken.error)
				{
					that.error = true;
					that.errorMsg = responseToken.message;
				}
				else
				{
					that.showSuccessMessage = true;
					that.successMessage = responseToken.message;
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
		* Attempts to register a new user
		*/
		register()
		{
			var that = this;
			var token = this.registerToken;
			this.error = false;
			this.loading = true;
			this.showSuccessMessage = false;
			this.errorMsg = "";
			this.successMessage = "";

			token.challenge = Recaptcha.get_challenge();
			token.captcha = Recaptcha.get_response();

            this.http.post<UsersInterface.IAuthenticationResponse>("/api/users/register", token).then(function (response)
			{
				var responseToken = response.data;
				if (responseToken.error)
				{
					that.error = true;
					that.errorMsg = responseToken.message;
				}
				else
				{
					that.showSuccessMessage = true;
					that.successMessage = responseToken.message;
				}

				that.loading = false;

			}).catch(function (err)
			{
				that.loading = false;
				that.error = true;
				that.errorMsg = "Could not communicate with server";
			});
		}
	}
}