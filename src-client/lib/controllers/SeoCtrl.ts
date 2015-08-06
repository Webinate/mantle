module clientAdmin
{
	/**
	* Controller for the dashboard users section
	*/
    export class SEOCtrl extends PagedContentCtrl
	{
        protected apiURL: string;
        protected cacheURL: string;
        protected showRenders: boolean;
        protected renders: Array<Modepress.IRender>;

		// $inject annotation.
        public static $inject = ["$scope", "$http", "apiURL", "cacheURL"];
        constructor(scope: any, http: ng.IHttpService, apiURL: string, cacheURL: string)
        {
            super(http);
            this.showRenders = true;
            this.apiURL = apiURL;
            this.cacheURL = cacheURL;
            this.renders = [];
            this.updatePageContent();
        }

        /**
        * Clears all render items
        */
        clearRenders()
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that.http.delete<Modepress.IResponse>(`${that.apiURL}/renders/clear-renders`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                {
                    that.renders = [];
                    that.last = 1;
                }

                that.loading = false;
            });
        }

        /**
        * Removes a render from the database
        */
        removeRender(render: Modepress.IRender)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that.http.delete<Modepress.IResponse>(`${that.apiURL}/renders/remove-render/${render._id}`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.renders.splice(that.renders.indexOf(render), 1);

                that.loading = false;
                (<any>render).confirmDelete = false;
            });
        }    

        /**
        * Fetches the users from the database
        */
        updatePageContent()
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var index = this.index;
            var limit = this.limit;

            that.http.get<Modepress.IGetRenders>(`${that.apiURL}/renders/get-renders?index=${index}&limit=${limit}&search=${that.searchTerm}`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                    that.renders = [];
                    that.last = 1;
                }
                else
                {
                    that.renders = token.data.data;
                    that.last = token.data.count;
                }

                that.loading = false;
            });
        }
	}
}