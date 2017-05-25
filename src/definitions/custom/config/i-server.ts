declare module 'modepress' {
    /**
     * Defines routes and the paths of a host / port
     */
    export interface IServer {
        /**
         * The host we listening for
        */
        host: string;

        /**
         * The length of time the assets should be cached on a user's browser. The default is 30 days.
         */
        cacheLifetime: number;

        /**
         * The port number of the host
         */
        portHTTP: number;

        /**
         * An array of domains that are CORS approved
         */
        approvedDomains: Array<string>;

        /**
         * An array of folder paths that can be used to fetch static content
         */
        staticFilesFolder: Array<string>;

        /**
         * An object to describe SSL properties.
         * eg : {
                portHTTPS: 443;
                sslKey: './PATH_TO_KEY';
                sslCert: './PATH_TO_CERT';
                sslRoot: './PATH_TO_ROOT';
                sslIntermediate: './PATH_TO_INTERMEDIATE';
                sslPassPhrase: 'PASSPHRASE';
            * }
            */
        ssl: ISSL;

        /**
         * An array of IPath objects that define routes and where they go to
         */
        paths: Array<IPath>

        /**
         * An array of controllers associated with this server
         */
        controllers: Array<IControllerPlugin>

        /**
        * The URL to redirect to after the user attempts to activate their account.
        * User's can activate their account via the '/activate-account' URL, and after its validation the server will redirect to this URL
        * adding a query ?message=You%20have%20activated%20your%20account&status=success.
        * The status can be either 'success' or 'error'
        *
        * eg: 'http://localhost/notify-user'
        */
        accountRedirectURL: string;

        /**
         * The URL sent to users emails for when their password is reset. This URL should
         * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
         *
         * eg: 'http://localhost/reset-password'
         */
        passwordResetURL: string;
    }
}