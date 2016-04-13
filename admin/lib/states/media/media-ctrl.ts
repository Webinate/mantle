module clientAdmin
{
	/**
	* Controller for the dashboard media section
	*/
    export class MediaCtrl
	{
        private usersURL: string;
        public folderFormVisible: boolean;
        public scope: any;
        public entries: Array<any>;
        public selectedEntities: Array<UsersInterface.IBucketEntry | UsersInterface.IFileEntry>;
        public selectedEntity: UsersInterface.IBucketEntry | UsersInterface.IFileEntry;
        public selectedFolder: UsersInterface.IBucketEntry;
        public uploader: any;
        public confirmDelete: boolean;
        public editMode: boolean;
        public multiSelect: boolean;
        public editFileMode: boolean;

        private _q: ng.IQService;
        private http: ng.IHttpService;
        private error: boolean;
        private loading: boolean;
        private errorMsg: string;
        private pager: IPagerRemote;
        private searchTerm: string;

        // $inject annotation.
        public static $inject = ["$scope", "$http", "usersURL", "Upload", "$q"];
        constructor(scope: any, http: ng.IHttpService, usersURL: string, upload: any, $q : ng.IQService)
        {
            this.scope = scope;
            this.usersURL = usersURL;
            this.folderFormVisible = false;
            this.confirmDelete = false;
            this.editMode = false;
            this.selectedFolder = null;
            this.uploader = upload;
            this.selectedEntities = [];
            this.selectedEntity = null;
            this.multiSelect = true;
            this.editFileMode = false;

            this._q = $q;
            this.http = http;
            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this.searchTerm = "";
            this.pager = this.createPagerRemote();
        }

        upload(files)
        {
            var that = this;
            that.error = false;

            if (files && files.length)
            {

                for (var i = 0; i < files.length; i++)

                for (var i = 0; i < files.length; i++)
                {
                    var file = files[i];
                    this.uploader.upload({
                        url: `${that.usersURL}/buckets/${that.selectedFolder.name}/upload`,
                        file: file

                    }).success(function (data, status, headers, config)
                    {
                        that.pager.invalidate();

                    }).error(function (data, status, headers, config)
                    {
                        that.error = true;
                        that.errorMsg = status;
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

            this.http.post<UsersInterface.IResponse>(`${that.usersURL}/users/${Authenticator.user.username}/buckets/${folderName}`, null).then(function(token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                {
                    $("#new-folder").val("");
                    that.pager.invalidate();
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
            this.selectedFolder = folder;
            this.folderFormVisible = false;
            this.confirmDelete = false;
            that.pager.goFirst();
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
            var command = (this.selectedFolder ? "files" : "buckets");

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

            that.http.delete<UsersInterface.IResponse>(`${that.usersURL}/${command}/${entities}`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.pager.invalidate();

                that.loading = false;
                that.confirmDelete = false;
            });
        }

        /**
        * Attempts to rename a file
        */
        renameFile(file: UsersInterface.IFileEntry)
        {
            var that = this;
            that.error = false;
            that.errorMsg = "";
            that.loading = true;

            that.http.put<UsersInterface.IResponse>(`${that.usersURL}/files/${file.identifier}/rename-file`, { name: $("#file-name").val() }).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                    return
                }

                file.name = $("#file-name").val();
                that.loading = false;
                that.editFileMode = false;
            });
        }

        /**
        * Sets the selected status of a file or folder
        */
        selectEntity(entity)
        {
            entity.selected = !entity.selected;
            var ents = this.selectedEntities;

            if (entity.selected)
            {
                if (this.multiSelect == false)
                {
                    for (var i = 0, l = ents.length; i < l; i++)
                        (<any>ents[i]).selected = false;

                    ents.splice(0, ents.length);
                }

                ents.push(entity);
            }
            else
                ents.splice(ents.indexOf(entity), 1);

            if (ents.length == 0)
            {
                this.confirmDelete = false;
                this.selectedEntity = null;
            }
            else
                this.selectedEntity = ents[ents.length - 1];
        }

        /**
         * Fetches the media entries (folers/actual media) from the database
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
                    that.selectedEntities.splice(0, that.selectedEntities.length);
                    that.selectedEntity = null;
                    var command = "";

                    if (that.selectedFolder)
                        command = `${that.usersURL}/users/${Authenticator.user.username}/buckets/${that.selectedFolder.name}/files?index=${index}&limit=${limit}&search=${that.searchTerm}`
                    else
                        command = `${that.usersURL}/users/${Authenticator.user.username}/buckets?index=${index}&limit=${limit}&search=${that.searchTerm}`

                    return new that._q<number>(function(resolve, reject)
                    {
                        that.http.get<UsersInterface.IGetFiles>(command).then(function (token)
                        {
                            if (token.data.error) {
                                that.error = true;
                                that.errorMsg = token.data.message;
                                that.entries = [];
                                resolve(1);
                            }
                            else {
                                that.entries = token.data.data;
                                resolve(token.data.count);
                            }

                            that.loading = false;
                        });
                    });
                }
            };

            return remote;
        }
	}
}