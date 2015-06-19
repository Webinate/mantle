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
	* The name of the configuration. This is chosen via the command line on startup
	*/
    name: string;

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
	* The port number to use for the page renderer server. The renderer server runs alongside modepress
    * and is used to store pre-rendered versions of your pages for web crawlers like Google, facebook and twitter.
	*/
    rendererPort: number;
    
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

	/**
	* The email of the admin account
	*/
	emailAdmin: string;

	/**
	* The 'from' email when notifying users
	*/
	emailFrom: string;

	/**
	* Email service we are using to send mail. For example 'Gmail'
	*/
	emailService: string;

	/**
	* The email address / username of the service
	*/
	emailServiceUser: string;

	/**
	* The password of the email service
	*/
	emailServicePassword: string;

	/**
	* The private key to use for Google captcha 
	* Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
	*/
	captchaPrivateKey: string;

	/**
	* The public key to use for Google captcha 
	* Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
	*/
	captchaPublicKey: string;

	/**
	* This is the relative URL that the registration link sends to the user when clicking to activate their account.
	* An example might be 'api/activate-account'
	* This will be sent out as http(s)://HOST:PORT/activationURL?[Additional details]
	*/
	activationURL: string;
}

/**
* Loads a configuration file which is needed to setup the server
* @param {string} configName Specify the name of a config to use
* @param {string} configPath The path to where the config file is located
* @returns {Promise<ServerConfig>}
*/
export function loadConfig(configName: string, configPath : string): Promise<IServerConfig>
{
	return new Promise<IServerConfig>(function (resolve, reject)
    {
        winston.info(`Reading file config.json...`, { process: process.pid });

        fs.readFile(configPath, "utf8", function (err, data)
		{
			if (err)
			{
				reject(new Error(`Cannot read config file: ${err.message}`));
				return;
			}
			else
			{
				try
                {
                    winston.info(`Parsing file config.json...`, { process: process.pid });

					var json: Array<any> = JSON.parse(data);
					var serverCongfigs: Array<IServerConfig> = [];
					for (var i = 0; i < json.length; i++)
					{
						serverCongfigs.push( <IServerConfig>(json[i]));
						console.log(`Reading config ${serverCongfigs[i].name}...`);
					}

                    winston.info(`You have (${serverCongfigs.length}) configurations.`, { process: process.pid });

					for (var i = 0; i < serverCongfigs.length; i++)
					{
						if (serverCongfigs[i].name == configName)
						{
							// Success!
							resolve(serverCongfigs[i]);
							return;
						}
					}

					reject(new Error(`Could not find a config with the name ${configName}`));
					return;
				}
				catch (exp)
				{
					reject(new Error(`Could not parse JSON file: ${exp.message}`));
					return;
				}
			}
		});
	});
}