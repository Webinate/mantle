module clientAdmin
{
	/**
	* Controller for the dashboard users section
	*/
    export class SEOCtrl
	{
        protected apiURL: string;
        protected cacheURL: string;
        protected showRenders: boolean;
        protected renders: Array<Modepress.IRender>;

        private _q: ng.IQService;
        private http: ng.IHttpService;
        private error: boolean;
        private loading: boolean;
        private errorMsg: string;
        private pager: IPagerRemote;
        private searchTerm: string;

		// $inject annotation.
        public static $inject = ["$scope", "$http", "apiURL", "cacheURL", "$q"];
        constructor(scope: any, http: ng.IHttpService, apiURL: string, cacheURL: string, $q : ng.IQService)
        {
            this.showRenders = true;
            this.apiURL = apiURL;
            this.cacheURL = cacheURL;
            this.renders = [];

            this._q = $q;
            this.http = http;
            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this.searchTerm = "";
            this.pager = this.createPagerRemote();
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
                    that.loading = true;

                    return new that._q<number>(function(resolve, reject)
                    {
                        that.http.get<Modepress.IGetPosts>(`${that.apiURL}/renders/get-renders?index=${index}&verbose=true&limit=${limit}&search=${that.searchTerm}`).then(function (token)
                        {
                            if (token.data.error) {
                                that.error = true;
                                that.errorMsg = token.data.message;
                                that.renders = [];
                                resolve(1);
                            }
                            else {
                                that.renders = token.data.data;
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
                    that.renders = [];

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
	}
}