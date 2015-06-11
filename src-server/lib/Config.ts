import * as fs from "fs";

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
export class ServerConfig
{
    /**
	* The name of the configuration. This is chosen via the command line on startup
	*/
    public name: string;

    /**
	* The host we listening for
	*/
    public host: string = "127.0.0.1";

    /**
	* The port number of the host
	*/
    public portHTTP: number = 8080;
    
    /**
    * The name of the mongo database to use
    */
    public databaseName: string;

    /**
	* The port number the mongo database is listening on
	*/
    public portDatabase: number = 27017;
    
    /**
	* An array of folder paths that can be used to fetch static content
	*/
    public staticFilesFolder: Array<string>;

    /**
    * The URL of the webinate-users api
    */
    public usersURL: string;

    /**
	* Set to true if you want SSL turned on
	*/
    public ssl: boolean;

    /**
    * The port number to use for SSL. Only applicable if ssl is true.
    */
    public portHTTPS: number = 443;

    /**
	* The path of the SSL private key. Only applicable if ssl is true.
	*/
    public sslKey: string;

    /**
	* The path of the SSL certificate file (usually provided by a third vendor). Only applicable if ssl is true.
	*/
    public sslCert: string;

    /**
	* The path of the SSL root file (usually provided by a third vendor). Only applicable if ssl is true.
	*/
    public sslRoot: string;

    /**
	* The path of the SSL intermediate/link file (usually provided by a third vendor). Only applicable if ssl is true.
	*/
    public sslIntermediate: string;

    /**
	* The password to use for the SSL (optional). Only applicable if ssl is true.
	*/
    public sslPassPhrase: string;

    /**
    * The path to use for accessing the admin panel
    */
    public adminURL: string;
    
    /**
    * An array of IPath objects that define routes and where they go to
    */
    public paths: Array<IPath>

	/**
	* The email of the admin account
	*/
	public emailAdmin: string;

	/**
	* The 'from' email when notifying users
	*/
	public emailFrom: string;

	/**
	* Email service we are using to send mail. For example 'Gmail'
	*/
	public emailService: string;

	/**
	* The email address / username of the service
	*/
	public emailServiceUser: string;

	/**
	* The password of the email service
	*/
	public emailServicePassword: string;

	/**
	* The private key to use for Google captcha 
	* Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
	*/
	public captchaPrivateKey: string;

	/**
	* The public key to use for Google captcha 
	* Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
	*/
	public captchaPublicKey: string;

	/**
	* This is the relative URL that the registration link sends to the user when clicking to activate their account.
	* An example might be 'api/activate-account'
	* This will be sent out as http(s)://HOST:PORT/activationURL?[Additional details]
	*/
	public activationURL: string;

	/** 
	* Creates a new config instance
	* @param {any} data [Optional] JSON object from file
	*/
	constructor(data?: any)
	{
		if (data)
			this.fromDataObject(data);
	}

	/** 
	* Loads the data from a json object
	* @param {any} data JSON object from file
	*/
	fromDataObject(data: any)
	{
		this.name = data.name;
		this.host = data.host;
		this.portHTTP = data.portHTTP;
        this.portDatabase = data.portDatabase;
        this.staticFilesFolder = data.staticFilesFolder;
        this.paths = data.paths;
		this.emailAdmin = data.emailAdmin;
		this.emailFrom = data.emailFrom;
		this.emailService = data.emailService;
		this.emailServiceUser = data.emailServiceUser;
		this.emailServicePassword = data.emailServicePassword;
		this.captchaPrivateKey = data.captchaPrivateKey;
		this.captchaPublicKey = data.captchaPublicKey;
        this.activationURL = data.activationURL;
        this.usersURL = data.usersURL;
        this.adminURL = data.adminURL;
        this.databaseName = data.databaseName;

		if (data.ssl)
		{
			this.ssl = true;
			this.sslKey = data.sslKey;
			this.sslCert = data.sslCert;
            this.sslPassPhrase = data.sslPassPhrase;
            this.sslRoot = data.sslRoot;
            this.sslIntermediate = data.sslIntermediate;
		}
		else
		{
			this.ssl = false;
		}
	}
}

/**
* Loads a configuration file which is needed to setup the server
* @param {string} configName Specify the name of a config to use
* @param {string} configPath The path to where the config file is located
* @returns {Promise<ServerConfig>}
*/
export function loadConfig(configName: string, configPath : string): Promise<ServerConfig>
{
	return new Promise<ServerConfig>(function (resolve, reject)
	{
		console.log(`Reading file config.json...`);

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
					console.log(`Parsing file config.json...`);

					var json: Array<any> = JSON.parse(data);
					var serverCongfigs: Array<ServerConfig> = [];
					for (var i = 0; i < json.length; i++)
					{
						serverCongfigs.push(new ServerConfig(json[i]));
						console.log(`Reading config ${serverCongfigs[i].name}...`);
					}

					console.log(`You have (${serverCongfigs.length}) configurations.`);

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