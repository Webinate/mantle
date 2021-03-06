declare module 'modepress' {

    // export type ControllerType = 'posts' | 'comments' | 'buckets' | 'files' | 'admin' |
    //     'auth' | 'emails' | 'renders' | 'stats' | 'users' | 'sessions';

    export interface IControllerOptions {
        // type: ControllerType;
        path?: string;
    }

    export interface IServer {

        /**
         * The port number of the host
         */
        port: number;

        /**
         * The host we listening for. The default is 'localhost'
         */
        host: string;

        /**
         * An array of folder paths that can be used to fetch static content
         */
        staticAssets?: Array<string>;

        /**
         * The length of time the assets should be cached on a user's browser in milliseconds. The default is 30 days.
         */
        staticAssetsCache?: number;

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

        /**
         * An array of cors approved domains
         */
        corsApprovedDomains?: string[];
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