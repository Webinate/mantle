/*
* Users stores data on an external cloud bucket with Google
*/
export interface IGoogleProperties {
    /*
    * Path to the key file
    */
    keyFile: string;

    /*
    * Describes the bucket details
    */
    bucket: {

        /*
        * Project ID
        */
        projectId: string;

        /**
         * The name of the mongodb collection for storing bucket details
         * eg: 'buckets'
         */
        bucketsCollection: string;

        /**
         * The name of the mongodb collection for storing file details
         * eg: 'files'
         */
        filesCollection: string;

        /**
         * The name of the mongodb collection for storing user stats
         * eg: 'storageAPI'
         */
        statsCollection: string;

        /**
         * The length of time the assets should be cached on a user's browser.
         * eg:  2592000000 or 30 days
         */
        cacheLifetime: number;
    }
}