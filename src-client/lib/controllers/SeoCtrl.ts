module clientAdmin
{
	/**
	* Controller for the dashboard users section
	*/
    export class SEOCtrl
	{
        protected http: ng.IHttpService;
        protected error: boolean;
        protected errorMsg: string;
        protected apiURL: string;
        protected cacheURL: string;
        protected searchTerm: string;        
        protected loading: boolean;
        protected showCache: boolean;
        protected limit: number;
        protected index: number;
        protected last: number;
        protected cacheItems: Array<modepress.ICacheItem>;

		// $inject annotation.
        public static $inject = ["$scope", "$http", "apiURL", "cacheURL"];
        constructor(scope: any, http: ng.IHttpService, apiURL: string, cacheURL: string)
        {
            this.http = http;
            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this.showCache = true;
            this.limit = 30;
            this.last = Infinity;
            this.index = 0;
            this.apiURL = apiURL;
            this.cacheURL = cacheURL;
            this.searchTerm = "";
            this.cacheItems = [];

            this.getCache();
        }

        /**
        * Clears all cache items
        */
        clearCache()
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that.http.delete<modepress.IResponse>(`${that.apiURL}/renders/clear-cache`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                {
                    that.cacheItems = [];
                    that.last = Infinity;
                }

                that.loading = false;
            });
        }

        /**
        * Fetches the users from the database
        */
        getCache()
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var index = this.index;
            var limit = this.limit;

            that.http.get<modepress.IGetRenders>(`${that.apiURL}/renders/get-renders?index=${index}&limit=${limit}&search=${that.searchTerm}`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                    that.cacheItems = [];
                    that.last = Infinity;
                }
                else
                {
                    that.cacheItems = token.data.data;
                    that.last = token.data.count;
                }

                that.loading = false;
            });
        }
	}
}