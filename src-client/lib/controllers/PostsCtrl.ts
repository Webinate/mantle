module clientAdmin
{
	/**
	* Controller for the dashboard posts section
	*/
    export class PostsCtrl extends PagedContentCtrl
    {
        public postToken: modepress.IPost;
        public posts: Array<modepress.IPost>;
        public showNewPostForm: boolean;
        public editMode: boolean;
        public apiURL: string;
        public mediaURL: string;
        public scope: any;
        public successMessage: string;
        public tagString: string;
        public newCategoryMode: boolean;
        public showCategoryDelete: boolean;
        public categories: Array<modepress.ICategory>;
        public categoryToken: modepress.ICategory;
        public searchKeyword: string;
        public searchCategory: string;
        public sortOrder: string;
        public sortType: string;
        public showFilters: boolean;
        public showMediaBrowser: boolean;
        public defaultSlug: string;
        public targetImgReciever: string;

		// $inject annotation.
        public static $inject = ["$scope", "$http", "apiURL", "mediaURL", "categories"];
        constructor(scope, http: ng.IHttpService, apiURL: string, mediaURL: string, categories: Array<modepress.ICategory>)
        {
            super(http);
            this.newCategoryMode = false;
            this.scope = scope;
            this.apiURL = apiURL;
            this.mediaURL = mediaURL;
            this.posts = [];
            this.successMessage = "";
            this.tagString = "";
            this.showNewPostForm = false;
            this.showCategoryDelete = false;
            this.editMode = false;
            this.showFilters = false;
            this.searchKeyword = "";
            this.searchCategory = "";
            this.sortOrder = "desc";
            this.sortType = "created";
            this.defaultSlug = "";
            this.showMediaBrowser = false;
            this.targetImgReciever = "";

            this.postToken = { title: "", content: "", slug: "", tags: [], categories: [], public: true, brief: "" };
            this.updatePageContent();
            var that = this;

            tinymce.init({
                height: 350,
                setup: function (editor)
                {
                    editor.addButton('drive', {
                        text: "",
                        image: "/admin/media/images/image-icon.png",
                        onclick: function ()
                        {
                            that.openMediaBrowser();
                            scope.$apply();
                        }
                    });
                },
                selector: "textarea", plugins: ["media", "image", "link", "code", "textcolor", "colorpicker", "table", "wordcount", "lists", "contextmenu", "charmap", "fullpage", "pagebreak", "print", "spellchecker", "fullscreen", "searchreplace"],
                toolbar1: "insertfile undo redo | styleselect | bold italic charmap | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link drive | print preview media | forecolor backcolor emoticons",
                toolbar2: "pagebreak | spellchecker searchreplace | fullpage fullscreen"
            });
            
            // The category token
            this.categoryToken = { title: "", description: "", slug: "" };

            // Fetches the categories
            this.categories = categories;
        }

        /**
        * Opens the media browser
        */
        openMediaBrowser(target: string = "content")
        {
            this.showMediaBrowser = true;
            this.targetImgReciever = target;
        }

        /**
        * Closes the media browser
        */
        closeMediaBrowser()
        {
            this.showMediaBrowser = false;
        }

        /**
        * Selects a file from the media browser
        */
        selectFile(file: UsersInterface.IFileEntry)
        {
            this.showMediaBrowser = false;

            if (this.targetImgReciever == "content")
            {
                if (file.mimeType.match(/image/))
                    tinymce.editors[0].insertContent(`<img src='${file.publicURL}' />`);
                else
                    tinymce.editors[0].insertContent(`<a href href='${file.publicURL}' target='_blank'>${file.name}</a>`);
            }
            else if (this.targetImgReciever == "featured-image")
                this.postToken.featuredImage = file.publicURL;
        }

        /**
        * Makes sure the slug doesnt have any spaces
        */
        checkSlug()
        {
            if (this.postToken.slug)
                this.postToken.slug = this.postToken.slug.replace(/\s+/g, '-');
        }

        /**
        * Sets the slug to be the same as the title - except with spaces and in lower case (only if not touched first by user)
        */
        updateDefaultSlug(form)
        {
            if (!form.nSlug.$touched || !this.postToken.slug || this.postToken.slug == "")
                this.postToken.slug = this.postToken.title.split(' ').join('-').toLowerCase();
        }

        swapOrder()
        {
            this.sortOrder = (this.sortOrder == 'asc' ? 'desc' : 'asc');
            this.updatePageContent();
        }

        swapSortType()
        {
            this.sortType = (this.sortType == 'created' ? 'updated' : 'created');
            this.updatePageContent();
        }

        /**
        * Gets a list of categories
        */
        getCategories()
        {
            var that = this;
            that.http.get<modepress.IGetCategories>(`${that.apiURL}/posts/get-categories`).then(function (categories)
            {
                that.categories = categories.data.data;
            });
        }

        /**
        * Sets the page into post mode
        */
        newPostMode()
        {
            this.scope.newPostForm.$setUntouched();
            this.scope.newPostForm.$setPristine();
            this.postToken = { title: "", content: "", slug: "", tags: [], categories: [], public : true };
            this.editMode = false;
            this.successMessage = "";
            tinymce.editors[0].setContent("");
            this.showNewPostForm = !this.showNewPostForm
        }

        /**
        * Sets the page into edit mode
        */
        editPostMode(post: modepress.IPost)
        {
            this.newPostMode();
            this.editMode = true;
            this.loading = true;
            this.showNewPostForm = true;

            var that = this;
            that.http.get<modepress.IGetPost>(`${that.apiURL}/posts/get-post/${post.slug}`).then(function (post)
            {
                that.postToken = post.data.data;
                that.loading = false;
                tinymce.editors[0].setContent(that.postToken.content);
            });
        }
        
        /**
		* Fetches the posts from the database
		*/
        updatePageContent()
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var index = this.index;
            var limit = this.limit;
            var keyword = this.searchKeyword;
            var searchCategory = this.searchCategory;
            var order = this.sortOrder;
            var sortType = this.sortType;

            that.http.get<modepress.IGetPosts>(`${that.apiURL}/posts/get-posts?visibility=all&verbose=true&sort=${sortType}&sortOrder=${order}&categories=${searchCategory}&index=${index}&limit=${limit}&keyword=${keyword}`).then(function (token)
            {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                    that.posts = [];
                    that.last = 1;
                }
                else {
                    that.posts = token.data.data;
                    that.last = token.data.count;
                }
               
                that.loading = false;
            });
        }

        /**
		* Processes the tags in a post array of keywords
		*/
        processTags()
        {
            var newTags = this.tagString.split(",");

            for (var i = 0, l = newTags.length; i < l; i++)
            {
                var newTag = newTags[i].trim();
                if (newTag != "" && this.postToken.tags.indexOf(newTag) == -1)
                    this.postToken.tags.push(newTag);
            }
            
            this.scope.tagForm.$setUntouched();
            this.scope.tagForm.$setPristine();

            this.tagString = "";
        }

        /**
		* Removes a tag from the post array
		*/
        removeTag(tag : string)
        {
            this.postToken.tags.splice(this.postToken.tags.indexOf(tag), 1);
        }

        /**
        * Removes a user from the database
        * @param {UsersInterface.IUserEntry} user The user to remove
        */
        removePost(post: modepress.IPost)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that.http.delete<modepress.IResponse>(`${that.apiURL}/posts/remove-post/${post._id}`).then(function (token)
            {
                if (token.data.error) {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                    that.posts.splice(that.posts.indexOf(post), 1);

                that.loading = false;
                (<any>post).confirmDelete = false;
            });
        }       

        /**
        * Removes a category from the database by ID
        * @param {modepress.ICategory} category The category to remove
        */
        removeCategory(category: modepress.ICategory)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that.http.delete<modepress.IResponse>(`${that.apiURL}/posts/remove-category/${category._id}`).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                {
                    if (that.postToken.categories.indexOf(category.slug) != -1)
                        that.postToken.categories.splice(that.postToken.categories.indexOf(category.slug), 1);

                    that.categories.splice(that.categories.indexOf(category), 1);
                }

                that.loading = false;
            });
        }   

        /**
        * Creates a new user 
        */
        createPost()
        {
            this.scope.newPostForm.$setSubmitted();

            if (this.scope.newPostForm.$valid == false)
                return;

            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var postToken = this.postToken;
            postToken.content = tinymce.editors[0].getContent();

            if (this.editMode)
            {
                that.http.put<modepress.IGetPost>(`${that.apiURL}/posts/update-post/${postToken._id}`, postToken).then(function (token)
                {
                    if (token.data.error)
                    {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else
                    {
                        that.successMessage = token.data.message;
                        postToken.lastUpdated = Date.now();
                    }

                    that.loading = false;
                });
            }
            else
            {
                that.http.post<modepress.IGetPost>(`${that.apiURL}/posts/create-post`, postToken).then(function (token)
                {
                    if (token.data.error)
                    {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else
                    {
                        that.posts.push(token.data.data);
                        that.showNewPostForm = false;
                    }

                    that.loading = false;
                });
            }
        }

        /**
        * Creates a new category 
        */
        createCategory()
        {
            this.scope.newCategoryForm.$setSubmitted();

            if (this.scope.newCategoryForm.$valid == false)
                return;

            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var categoryToken = this.categoryToken;
            that.http.post<modepress.IGetCategory>(`${that.apiURL}/posts/create-category`, categoryToken).then(function (token)
            {
                if (token.data.error)
                {
                    that.error = true;
                    that.errorMsg = token.data.message;
                }
                else
                {
                    that.categories.push(token.data.data);
                    that.categoryToken.description = "";
                    that.categoryToken.title = "";
                    that.categoryToken.slug = "";
                }

                that.loading = false;

                that.scope.newCategoryForm.$setUntouched();
                that.scope.newCategoryForm.$setPristine();
            });
        }

        /**
        * Adds this category to the post's selected categories
        */
        selectCategory(category: modepress.ICategory)
        {
            if (this.postToken.categories.indexOf(category.slug) == -1)
                this.postToken.categories.push(category.slug);
            else
                this.postToken.categories.splice(this.postToken.categories.indexOf(category.slug), 1);
        }
	}
}