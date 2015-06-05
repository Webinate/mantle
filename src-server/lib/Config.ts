import * as fs from "fs";

/** 
* A server configuration
*/
export class ServerConfig
{
	public name: string;
	public host: string = "127.0.0.1";
	public portHTTP: number = 8080;
	public portHTTPS: number = 443;
    public portDatabase: number = 27017;
    public portUsers: number = 8000;
	public ssl: boolean;
    public usersURL: string;
    public sslKey: string;
    public sslCert: string;
    public sslRoot: string;
    public sslIntermediate: string;
	public sslPassPhrase: string;
	public databaseName: string;
	public html: string;
    public staticFilesFolder: Array<string>;
    public adminURL: string;
    public path: string;

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
        this.portUsers = data.portUsers;
        this.path = data.path;
        this.html = data.html;        
		this.staticFilesFolder = data.staticFilesFolder;
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