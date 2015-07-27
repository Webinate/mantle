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
        public selectedEntities: Array<UsersInterface.IBucketEntry | UsersInterface.IFileEntry>;
        public selectedFolder: UsersInterface.IBucketEntry;
        public uploader: any;
        public confirmDelete: boolean;

        // $inject annotation.
        public static $inject = ["$scope", "$http", "mediaURL", "Upload"];
        constructor(scope: any, http: ng.IHttpService, mediaURL: string, upload: any)
        {
            super(http);
            this.scope = scope;
            this.mediaURL = mediaURL;
            this.folderFormVisible = false;
            this.confirmDelete = false;
            this.selectedFolder = null;
            this.uploader = upload;
            this.selectedEntities = [];
            this.updatePageContent();
        }

        upload(files)
        {
            var that = this;

            if (files && files.length)
            {

                for (var i = 0; i < files.length; i++)

                for (var i = 0; i < files.length; i++)
                {
                    var file = files[i];
                    this.uploader.upload({
                        url: `${that.mediaURL}/upload/${that.selectedFolder.name}`,
                        file: file

                    }).progress(function (evt)
                    {
                        var progressPercentage = parseInt((100.0 * evt.loaded / evt.total).toString());
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);

                    }).success(function (data, status, headers, config)
                    {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        that.updatePageContent();

                    }).error(function (data, status, headers, config)
                    {
                        console.log('error status: ' + status);
                    })
                }
            }
        };

        /**
        * Creates a new folder 
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
        
        /**
        * Attempts to open a folder
        */
        openFolder(folder: UsersInterface.IBucketEntry)
        {
            var that = this;
            var command = "files";
            this.index = 0;
            this.selectedFolder = folder;
            this.folderFormVisible = false;
            this.confirmDelete = false;
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
            var command = (this.selectedFolder ? "remove-files" : "remove-buckets");

            var entities = "";

            if (this.selectedFolder)
            {
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += (<UsersInterface.IFileEntry>this.selectedEntities[i]).identifier + ",";
            }
            else
            {
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += (<UsersInterface.IBucketEntry>this.selectedEntities[i]).name + ",";
            }

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
        * Sets the selected status of a file or folder
        */
        selectEntity(entity)
        {
            entity.selected = !entity.selected;

            if (entity.selected)
                this.selectedEntities.push(entity);
            else
                this.selectedEntities.splice(this.selectedEntities.indexOf(entity), 1);

            if (this.selectedEntities.length == 0)
                this.confirmDelete = false;
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

            if (this.selectedFolder)
                command = `${that.mediaURL}/get-files/${Authenticator.user.username}/${this.selectedFolder.name}/?index=${index}&limit=${limit}&search=${that.searchTerm}`
            else
                command = `${that.mediaURL}/get-buckets/${Authenticator.user.username}/?index=${index}&limit=${limit}&search=${that.searchTerm}`

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