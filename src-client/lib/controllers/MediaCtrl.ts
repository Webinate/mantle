module clientAdmin
{
	/**
	* Controller for the dashboard media section
	*/
    export class MediaCtrl extends PagedContentCtrl
	{
        private mediaURL: string;
        public folderFormVisible: boolean;
        public scope: any;
        public entries: Array<any>;
        public view: string;
        public selectedEntities: Array<any>;

        // $inject annotation.
        public static $inject = ["$scope", "$http", "mediaURL"];
        constructor(scope: any, http: ng.IHttpService, mediaURL: string)
        {
            super(http);
            this.scope = scope;
            this.mediaURL = mediaURL;
            this.folderFormVisible = false;
            this.selectedEntities = [];
            this.view = "folders";
            this.updatePageContent();
        }

        /**
        * Creates a new bucket 
        */
        newFolder()
        {
            var that = this;
            that.error = false;
            that.errorMsg = "";
            that.loading = true;
            var folderName: string = $("#new-folder").val();

            if (folderName.trim() == "")
            {
                that.error = true;
                that.errorMsg = "Please specify a valid folder name";
                return;
            }

            this.http.post<UsersInterface.IResponse>(`${that.mediaURL}/create-bucket/${Authenticator.user.username}/${folderName}`, null).then(function(token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                {
                    $("#new-folder").val("");
                    that.updatePageContent();
                }

                that.loading = false;
            });
        }

        openFolder(folder: UsersInterface.IBucketEntry)
        {
            var that = this;
            var command = "files";
            this.index = 0;
            this.updatePageContent();
        }

        /**
        * Removes the selected entities
        */
        removeEntities()
        {
            var that = this;
            that.error = false;
            that.errorMsg = "";
            that.loading = true;
            var command = (this.view == "folders" ? "remove-buckets" : "remove-files");

            var entities = "";
            for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                entities += (<UsersInterface.IBucketEntry>this.selectedEntities[i]).name + ",";

            entities = (entities.length > 0 ? entities.substr(0, entities.length - 1) : "" );

            that.http.delete<UsersInterface.IResponse>(`${that.mediaURL}/${command}/${entities}`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.updatePageContent();

                that.loading = false;
            });
        }

        /**
        * Sets the selected status of a folder
        */
        selectFolder(folder)
        {
            folder.selected = !folder.selected;
            if (folder.selected)
                this.selectedEntities.push(folder);
            else
                this.selectedEntities.splice(this.selectedEntities.indexOf(folder), 1);
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
            this.selectedEntities.splice(0, this.selectedEntities.length);
            var index = this.index;
            var limit = this.limit;
            var command = "";

            if (this.view == "folders")
                command = `${that.mediaURL}/get-buckets/${Authenticator.user.username}/?index=${index}&limit=${limit}&search=${that.searchTerm}`
            else
                command = `${that.mediaURL}/get-files/${Authenticator.user.username}/?index=${index}&limit=${limit}&search=${that.searchTerm}`

            that.http.get<UsersInterface.IGetFiles>(command).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                    that.entries = [];
                    that.last = 1;
                }
                else
                {
                    that.entries = token.data.data;
                    that.last = token.data.count;
                }

                that.loading = false;
            });
        }
	}
}