declare module UsersInterface
{
    /*
    * An interface to describe the data stored in the database for users
    */
    export interface IUserEntry
    {
        _id?: any;
        username?: string;
        email?: string;
        password?: string;
        registerKey?: string;
        sessionId?: string;
        lastLoggedIn?: number;
        privileges?: UserPrivileges;
        passwordTag?: string;
        meta?: any;
    }

    /**
    * The interface for describing each user's bucket
    */
    export interface IBucketEntry
    {
        _id?: any;
        name?: string;
        identifier?: string;
        user?: string;
        created?: number;
        memoryUsed?: number;
    }

    /**
    * The interface for describing each user's bucket
    */
    export interface IStorageStats
    {
        user?: string;
        memoryUsed?: number;
        memoryAllocated?: number;
        apiCallsUsed?: number;
        apiCallsAllocated?: number;
    }

    /**
    * The interface for describing each user's file
    */
    export interface IFileEntry
    {
        _id?: any;
        name?: string;
        user?: string;
        identifier?: string;
        bucketId?: string;
        bucketName?: string;
        publicURL?: string;
        created?: number;
        size?: number;
        mimeType?: string;
        isPublic?: boolean;
        numDownloads?: number;
    }
    

    /*
    * An interface to describe the data stored in the database from the sessions
    */
    export interface ISessionEntry
    {
        _id: any;
        sessionId: string;
        data: any;
        expiration: number;
    }

    /*
    * Users stores data on an external cloud bucket with Google
    */
    export interface IGoogleStorage
    {
        /*
        * Path to the key file
        */
        keyFile: string;

        /*
        * Project ID
        */
        projectId: string;

        /**
        * The name of the mongodb collection for storing bucket details
        * eg: "buckets"
        */
        bucketsCollection: string;

        /**
        * The name of the mongodb collection for storing file details
        * eg: "files"
        */
        filesCollection: string;

        /**
        * The name of the mongodb collection for storing user stats
        * eg: "storageAPI"
        */
        statsCollection: string;
    }

    /*
    * The default response  format
    */
    export interface IResponse
    {
        message: string;
        error: boolean;
    }

    /*
    * A GET request that returns the status of a user's authentication
    */
    export interface IAuthenticationResponse extends IResponse
    {
        authenticated: boolean;
        user: IUserEntry;
    }

    /*
    * Token used to describe how the upload went
    */
    export interface IUploadToken
    {
        file: string;
        field: string;
        filename: string;
        error: boolean;
        errorMsg: string;
    }

    /*
    * A POST request that returns the details of a multipart form upload
    */
    export interface IUploadResponse extends IResponse
    {
        tokens: Array<IUploadToken>
    }

    /*
    * A GET request that returns an array of data items
    */
    export interface IGetArrayResponse<T> extends IResponse
    {
        data: Array<T>;
        count: number;
    }

    /*
    * A GET request that returns a single data item
    */
    export interface IGetResponse<T> extends IResponse
    {
        data: T;
    }

    /*
    * The token used for logging in
    */
    export interface ILoginToken
    {
        username: string;
        password: string;
        rememberMe: boolean;
    }

    /*
    * The token used for registration
    */
    export interface IRegisterToken
    {
        username: string;
        password: string;
        email: string;
        captcha?: string;
        challenge?: string;
        privileges: number;
        meta: any;
    }

    /*
    * Describes what kind of privileges the user has
    */
    export enum UserPrivileges
    {
        SuperAdmin = 1,
        Admin = 2,
        Regular = 3
    }

    /*
    * Represents the details of the admin user
    */
    export interface IAdminUser
    {
        username: string;
        email: string;
        password: string;
    }

    /*
    * Options for configuring the API
    */
    export interface IConfig
    {
        /**
        * The domain or host of the site. 
        * eg: "127.0.0.1" or "webinate.net"
        */
        host: string;

        /**
        * The RESTful path of this service. 
        * eg: If "/api", then the API url would be 127.0.0.1:80/api (or rather host:port/restURL)
        */
        restURL: string;

        /**
        * The RESTful path of the media API
        * eg: If "/media", then the API url would be 127.0.0.1:80/media (or rather host:port/restURL)
        */
        mediaURL: string;
    
        /**
        * The URL to redirect to after the user attempts to activate their account. 
        * User's can activate their account via the "/activate-account" URL, and after its validation the server will redirect to this URL
        * adding a query ?message=You%20have%20activated%20your%20account&status=success. 
        * The status can be either 'success' or 'error'
        *
        * eg: "http://localhost/notify-user"
        */
        accountRedirectURL: string;

        /**
        * The URL sent to users emails for when their password is reset. This URL should
        * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
        *
        * eg: "http://localhost/reset-password"
        */
        passwordResetURL: string;
    
        /**
        * The URL to redirect to after the user attempts to change their password.
        * User's will reset their password via the "/password-reset" URL, and after its validation the server will redirect to this URL
        * adding a query ?message=You%20have%20activated%20your%20account&status=success. 
        * The status can be either 'success' or 'error'
        *
        * eg: "http://localhost/notify-user"
        */
        passwordRedirectURL: string;
    
        /**
        * An array of approved domains that can access this API. 
        * e.g. ["webinate\\.net", "127.0.0.1:80", "http:\/\/127.0.0.1"] etc...
        */
        approvedDomains: Array<string>;

        /**
        * The port number to use for regular HTTP requests.
        * e.g. 80
        */
        portHTTP: number;

        /**
        * The port number to use for SSL requests
        * e.g. 443
        */
        portHTTPS: number;
	
        /**
        * The name of the mongo database name
        */
        databaseName: string;

        /**
        * The name of the mongodb collection for storing user details
        * eg: "users"
        */
        userCollection: string;

        /**
        * The name of the mongodb collection for storing session details
        * eg: "sessions"
        */
        sessionCollection: string;
    
        /**
        * The host the DB is listening on
        * e.g. "127.0.0.1"
        */
        databaseHost: string;

        /**
        * The port number mongodb is listening on
        * e.g. 27017
        */
        databasePort: number;

        /**
        * If true, the API will try to secure its communications
        * e.g. false/true
        */
        ssl: boolean;

        /**
        * The path to the SSL private key 
        */
        sslKey: string;

        /**
        * The path to the SSL certificate authority root file
        */
        sslRoot: string;

        /**
        * The path to the SSL certificate authority intermediate file
        */
        sslIntermediate: string;

        /**
        * The path to the SSL certificate file path
        */
        sslCert: string;

        /**
        * The SSL pass phrase (if in use)
        */
        sslPassPhrase: string;

        /*
        * If set, the session will be restricted to URLs underneath the given path.
        * By default the path is "/", which means that the same sessions will be shared across the entire domain.
        * e.g: "/"
        */
        sessionPath?: string;

        /**  
        * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
        * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
        * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
        * Default is blank ""
        */
        sessionDomain?: string;

        /**
        * A persistent connection is one that will last after the user closes the window and visits the site again (true).
        * A non-persistent that will forget the user once the window is closed (false)
        * e.g: true/false. Default is true
        */
        sessionPersistent?: boolean;
	
        /**
        * The default length of user sessions in seconds
        * e.g 1800
        */
        sessionLifetime?: number;

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
        * The 'from' email when they receive an email for the server
        * eg: support@host.com
        */
        emailFrom: string;

        /**
        * Email service we are using to send mail. For example 'Gmail'
        * eg: "Gmail"
        */
        emailService: string;

        /**
        * The email address / username of the service
        * e.g: "provider@gmail.com"
        */
        emailServiceUser: string;

        /**
        * The password of the email service
        * e.g: "provider_password"
        */
        emailServicePassword: string;

        /**
        * The administrative user. This is the root user that will have access to the information in the database.
        * This can be anything you like, but try to use passwords that are hard to guess
        * eg: 
    
        "adminUser": {
                "username": "root",
                "email": "root_email@host.com",
                "password": "CHANGE_THIS_PASSWORD"
            }
        */
        adminUser: IAdminUser;

        /**
        * Information relating to the Google storage platform
        *
        "bucket": {
                "keyFile": "",
                "projectId": "",
                "bucketsCollection": "buckets",
                "filesCollection": "files"
            }
        */
        bucket: IGoogleStorage;
    }

    export interface IGetUser extends IGetResponse<IUserEntry> { }
    export interface IGetUserStorageData extends IGetResponse<IStorageStats> { }
    export interface IGetUsers extends IGetArrayResponse<IUserEntry> { count: number; }
    export interface IGetSessions extends IGetArrayResponse<ISessionEntry> { }
    export interface IGetBuckets extends IGetArrayResponse<IBucketEntry> { }
    export interface IGetFiles extends IGetArrayResponse<IFileEntry> { }
    export interface IRemoveFiles extends IGetArrayResponse<string> { }
}