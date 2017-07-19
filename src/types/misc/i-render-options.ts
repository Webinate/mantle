declare module 'modepress' {
    export interface IRenderOptions extends IBaseControler {

        /**
         * The length of time the assets should be cached on a user's browser.
         * eg:  2592000000 or 30 days
         */
        cacheLifetime: number;
    }
}