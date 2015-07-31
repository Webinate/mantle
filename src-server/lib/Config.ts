import * as fs from "fs";
import * as winston from "winston";

/**
* Defines routes and the paths they take
*/
export interface IPath
{
    /**
    * The name of this path
    */
    name: string;

    /**
    * The express route to use. E.g. "*" or "/some-route"
    */
    path: string;

    /**
    * The path of where to find jade templates for this route. E.g. "/templates"
    */
    templatePath: string;

    /**
    * The path or name of the template file to use. If a template path is set then the route resolves to 
    * templatePath + index if the file exists. If it does then the express render function is used to send that jade file. 
    * If not then the index is considered a static file and sent with the sendFile function.
    * e.g. "index"
    */
    index: string;
}

/** 
* A server configuration
*/
export interface IServerConfig
{
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
	* [Optional] If set, modepress will communicate with this URL to serve SEO/social friendly renders of your site
    * e.g. "127.0.0.1:3000"
	*/
    modepressRenderURL: string;
    
    /**
    * The name of the mongo database to use
    */
    databaseName: string;

    /**
	* The database host we are listening on
	*/
    databaseHost: string;

    /**
	* The port number the mongo database is listening on
	*/
    databasePort: number;
    
    /**
	* An array of folder paths that can be used to fetch static content
	*/
    staticFilesFolder: Array<string>;

    /**
    * The URL of the webinate-users api
    */
    usersURL: string;

    /**
	* Set to true if you want SSL turned on
	*/
    ssl: boolean;

    /**
    * The port number to use for SSL. Only applicable if ssl is true.
    */
    portHTTPS: number;

    /**
	* The path of the SSL private key. Only applicable if ssl is true.
	*/
    sslKey: string;

    /**
	* The path of the SSL certificate file (usually provided by a third vendor). Only applicable if ssl is true.
	*/
    sslCert: string;

    /**
	* The path of the SSL root file (usually provided by a third vendor). Only applicable if ssl is true.
	*/
    sslRoot: string;

    /**
	* The path of the SSL intermediate/link file (usually provided by a third vendor). Only applicable if ssl is true.
	*/
    sslIntermediate: string;

    /**
	* The password to use for the SSL (optional). Only applicable if ssl is true.
	*/
    sslPassPhrase: string;

    /**
    * The path to use for accessing the admin panel
    */
    adminURL: string;
    
    /**
    * An array of IPath objects that define routes and where they go to
    */
    paths: Array<IPath>
}