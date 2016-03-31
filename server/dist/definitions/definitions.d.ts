declare module clientAdmin {
    /**
    * Abstract class for controllers that page through content items.
    */
    class PagedContentCtrl {
        static singleton: PagedContentCtrl;
        protected http: ng.IHttpService;
        protected error: boolean;
        protected errorMsg: string;
        protected loading: boolean;
        protected index: number;
        protected limit: number;
        protected last: number;
        protected searchTerm: string;
        constructor(http: ng.IHttpService);
        /**
        * Updates the content
        */
        updatePageContent(): void;
        /**
        * Gets the current page number
        * @returns {number}
        */
        getPageNum(): number;
        /**
        * Gets the total number of pages
        * @returns {number}
        */
        getTotalPages(): number;
        /**
        * Sets the page search back to index = 0
        */
        goFirst(): void;
        /**
        * Gets the last set of users
        */
        goLast(): void;
        /**
        * Sets the page search back to index = 0
        */
        goNext(): void;
        /**
        * Sets the page search back to index = 0
        */
        goPrev(): void;
        /**
        * Called when the controller is being destroyed
        */
        onDispose(): void;
    }
}
declare module clientAdmin {
    /**
    * Controller for the dashboard users section
    */
    class SEOCtrl extends PagedContentCtrl {
        protected apiURL: string;
        protected cacheURL: string;
        protected showRenders: boolean;
        protected renders: Array<Modepress.IRender>;
        static $inject: string[];
        constructor(scope: any, http: ng.IHttpService, apiURL: string, cacheURL: string);
        /**
        * Clears all render items
        */
        clearRenders(): void;
        /**
        * Removes a render from the database
        */
        removeRender(render: Modepress.IRender): void;
        /**
        * Fetches the users from the database
        */
        updatePageContent(): void;
    }
}
declare module clientAdmin {
    /**
    * Controller for the login HTML
    */
    class LoginCtrl {
        private http;
        private q;
        private loginToken;
        private error;
        private errorMsg;
        private usersURL;
        private loading;
        private _state;
        static $inject: string[];
        constructor(http: ng.IHttpService, q: ng.IQService, usersURL: string, state: ng.ui.IStateService);
        /**
        * Attempts to log the user in
        */
        logIn(): void;
    }
}
declare module clientAdmin {
    /**
    * Controller for the registration HTML
    */
    class RegisterCtrl {
        private http;
        private q;
        private registerToken;
        private error;
        private errorMsg;
        private showSuccessMessage;
        private successMessage;
        private loading;
        private usersURL;
        static $inject: string[];
        constructor(http: ng.IHttpService, q: ng.IQService, capthaPublicKey: string, usersURL: string);
        /**
        * Resends the activation link
        */
        resendActivation(): void;
        /**
        * Attempts to register a new user
        */
        register(): void;
    }
}
declare module clientAdmin {
    /**
    * Controller for the password reset html
    */
    class PasswordCtrl {
        private http;
        private q;
        private loginToken;
        private error;
        private errorMsg;
        private usersURL;
        private loading;
        private origin;
        private complete;
        static $inject: string[];
        constructor(http: ng.IHttpService, q: ng.IQService, usersURL: string, stateParams: any);
        /**
        * Sends another request to reset the password
        */
        resendRequest(): void;
        /**
        * Attempts to reset the password based on the current credentials
        */
        resetPassword(): void;
    }
}
declare module clientAdmin {
    /**
    * Controller for the dashboard media section
    */
    class MediaCtrl extends PagedContentCtrl {
        private mediaURL;
        folderFormVisible: boolean;
        scope: any;
        entries: Array<any>;
        selectedEntities: Array<UsersInterface.IBucketEntry | UsersInterface.IFileEntry>;
        selectedEntity: UsersInterface.IBucketEntry | UsersInterface.IFileEntry;
        selectedFolder: UsersInterface.IBucketEntry;
        uploader: any;
        confirmDelete: boolean;
        editMode: boolean;
        multiSelect: boolean;
        editFileMode: boolean;
        static $inject: string[];
        constructor(scope: any, http: ng.IHttpService, mediaURL: string, upload: any);
        upload(files: any): void;
        /**
        * Creates a new folder
        */
        newFolder(): void;
        /**
        * Attempts to open a folder
        */
        openFolder(folder: UsersInterface.IBucketEntry): void;
        /**
        * Removes the selected entities
        */
        removeEntities(): void;
        /**
        * Attempts to rename a file
        */
        renameFile(file: UsersInterface.IFileEntry): void;
        /**
        * Sets the selected status of a file or folder
        */
        selectEntity(entity: any): void;
        /**
        * Fetches the users from the database
        */
        updatePageContent(): void;
    }
}
declare module clientAdmin {
    /**
    * Controller for the dashboard users section
    */
    class UsersCtrl extends PagedContentCtrl {
        private newUser;
        private usersURL;
        protected users: Array<UsersInterface.IUserEntry>;
        showUserForm: boolean;
        scope: any;
        static $inject: string[];
        constructor(scope: any, http: ng.IHttpService, usersURL: string);
        /**
        * Opens the new user form
        */
        newUserMode(): void;
        /**
        * Fetches the users from the database
        */
        updatePageContent(): void;
        /**
        * Removes a user from the database
        * @param {UsersInterface.IUserEntry} user The user to remove
        */
        removeUser(user: UsersInterface.IUserEntry): void;
        /**
        * Creates a new user
        */
        createNewUser(): void;
    }
}
declare module clientAdmin {
    /**
    * Controller for the dashboard posts section
    */
    class PostsCtrl {
        postToken: Modepress.IPost;
        posts: Array<Modepress.IPost>;
        showNewPostForm: boolean;
        editMode: boolean;
        apiURL: string;
        mediaURL: string;
        scope: any;
        successMessage: string;
        tagString: string;
        newCategoryMode: boolean;
        showCategoryDelete: boolean;
        categories: Array<Modepress.ICategory>;
        categoryToken: Modepress.ICategory;
        searchKeyword: string;
        searchCategory: string;
        sortOrder: string;
        sortType: string;
        showFilters: boolean;
        showMediaBrowser: boolean;
        defaultSlug: string;
        targetImgReciever: string;
        private _q;
        private http;
        private error;
        private loading;
        private errorMsg;
        private pager;
        static $inject: string[];
        constructor(scope: any, http: ng.IHttpService, apiURL: string, mediaURL: string, categories: Array<Modepress.ICategory>, $q: ng.IQService);
        /**
        * Opens the media browser
        */
        openMediaBrowser(target?: string): void;
        /**
        * Closes the media browser
        */
        closeMediaBrowser(): void;
        /**
        * Selects a file from the media browser
        */
        selectFile(file: UsersInterface.IFileEntry): void;
        /**
        * Makes sure the slug doesnt have any spaces
        */
        checkSlug(): void;
        /**
        * Sets the slug to be the same as the title - except with spaces and in lower case (only if not touched first by user)
        */
        updateDefaultSlug(form: any): void;
        swapOrder(): void;
        swapSortType(): void;
        /**
        * Gets a list of categories
        */
        getCategories(): void;
        /**
        * Sets the page into post mode
        */
        newPostMode(): void;
        /**
        * Sets the page into edit mode
        */
        editPostMode(post: Modepress.IPost): void;
        createPagerRemote(): IPagerRemote;
        /**
        * Processes the tags in a post array of keywords
        */
        processTags(): void;
        /**
        * Removes a tag from the post array
        */
        removeTag(tag: string): void;
        /**
        * Removes a user from the database
        * @param {UsersInterface.IUserEntry} user The user to remove
        */
        removePost(post: Modepress.IPost): void;
        /**
        * Removes a category from the database by ID
        * @param {modepress.ICategory} category The category to remove
        */
        removeCategory(category: Modepress.ICategory): void;
        /**
        * Creates a new user
        */
        createPost(): void;
        /**
        * Creates a new category
        */
        createCategory(): void;
        /**
        * Adds this category to the post's selected categories
        */
        selectCategory(category: Modepress.ICategory): void;
    }
}
declare module clientAdmin {
    /**
    * Interface for the object you pass as the directive's 'interface' attribute
    */
    interface IPagerRemote {
        update: (index?: number, limit?: number) => ng.IPromise<number>;
        invalidate?: () => void;
    }
    /**
    * Controller for the dashboard media section
    */
    class Pager implements ng.IDirective {
        restrict: string;
        transclude: boolean;
        templateUrl: string;
        scope: {
            interface: string;
            index: string;
            limit: string;
            last: string;
        };
        constructor();
        link: (scope: any, elem: JQuery, attributes: ng.IAttributes, ngModel: ng.INgModelController) => void;
        /**
         * Creates an intance of the pager directive
         */
        static factory(): ng.IDirectiveFactory;
    }
}
declare module clientAdmin {
    /**
    * An authentication service for checking if the user is logged in
    */
    class Authenticator {
        private _http;
        private _q;
        private _usersURL;
        static user: UsersInterface.IUserEntry;
        static $inject: string[];
        constructor(http: ng.IHttpService, q: ng.IQService, usersURL: string);
        /**
        * Logs the user out if they are already logged in
        * @returns {ng.IPromise<boolean>}
        */
        logout(): ng.IPromise<boolean>;
        /**
        * Checks to see if the current session is authenticated
        * @returns {ng.IPromise<boolean>}
        */
        authenticated(): ng.IPromise<boolean>;
    }
}
declare module clientAdmin {
    /**
    * Configures the Angular application
    */
    class Config {
        static $inject: string[];
        /**
        * Creates an instance of the configurator
        */
        constructor(routeProvider: angular.ui.IUrlRouterProvider, stateProvider: angular.ui.IStateProvider, $locationProvider: angular.ILocationProvider, $httpProvider: angular.IHttpProvider, cfpLoadingBarProvider: any);
    }
}
declare var _users: string;
declare var _media: string;
declare var _cache: string;
declare var _plugins: Array<ModepressAdmin.IAdminPlugin>;
/**
* The admin code for the website
*/
declare module clientAdmin {
}
