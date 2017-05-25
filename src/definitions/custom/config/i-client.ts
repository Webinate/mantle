declare module 'modepress' {

    export type ControllerType = 'posts' | 'comments' | 'buckets' | 'files' | 'admin' |
        'auth' | 'emails' | 'renders' | 'stats' | 'users' | 'sessions';

    export interface IControllerOptions {
        type: ControllerType;
        path?: string;
    }

    export interface IFileOptions extends IControllerOptions {

        /**
         * The length of time the assets should be cached on a user's browser.
         * eg:  2592000000 or 30 days
         */
        cacheLifetime: number;
    }

    export interface IRenderOptions extends IControllerOptions {

        /**
         * The length of time the assets should be cached on a user's browser.
         * eg:  2592000000 or 30 days
         */
        cacheLifetime: number;
    }

    export interface IAuthOptions extends IControllerOptions {

        /**
         * The URL to redirect to after the user attempts to activate their account.
         * User's can activate their account via the '/activate-account' URL, and after its validation the server will redirect to this URL
         * adding a query ?message=You%20have%20activated%20your%20account&status=success.
         * The status can be either 'success' or 'error'
         *
         * eg: 'http://localhost/auth/notify-user'
         */
        accountRedirectURL: string;

        /**
         * The URL sent to users emails for when their password is reset. This URL should
         * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
         *
         * eg: 'http://localhost/auth/reset-password'
         */
        passwordResetURL: string;

        /**
         * The URL sent to users emails for when they need to activate their account
         *
         * eg: 'http://localhost/auth/activate-account
         */
        activateAccountUrl: string;
    }

    export interface IServer {

        /**
         * The port number of the host
         */
        port: number;

        /**
         * The host we listening for
         */
        host: string;

        /**
         * An array of folder paths that can be used to fetch static content
         */
        staticAssets: Array<string>;

        /**
         * The length of time the assets should be cached on a user's browser. The default is 30 days.
         */
        staticAssetsCache: number;

        /**
         * An object to describe SSL properties.
         * eg : {
         *   portHTTPS: 443;
         *   sslKey: './PATH_TO_KEY';
         *   sslCert: './PATH_TO_CERT';
         *   sslRoot: './PATH_TO_ROOT';
         *   sslIntermediate: './PATH_TO_INTERMEDIATE';
         *   sslPassPhrase: 'PASSPHRASE';
         * }
         */
        ssl?: ISSL;

        corsApprovedDomains: string[];
    }

    /**
     * This interface represents a json file that describes how modepress should load a client.
     * Clients are plugins that are loaded dynamically by modepress on startup.
     */
    export interface IClient {

        server: string | IServer;

        name: string;

        /**
         * An array of controllers associated with this server
         */
        controllers: IControllerOptions[]
    }
}