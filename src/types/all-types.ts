import { ObjectId } from 'mongodb';
import { ElementType, UserPrivilege } from '../core/enums';
import { Request } from 'express';
import { IncomingMessage, ServerResponse } from 'http';

/*
 * Represents the details of the admin user
 */
export interface IAdminUser {
  username: string;
  email: string;
  password: string;
}

export interface ICollectionProperties {
  /**
   * The name of the mongodb collection for storing user details
   * eg: 'users'
   */
  userCollection: string;

  /**
   * The name of the mongodb collection for storing session details
   * eg: 'sessions'
   */
  sessionCollection: string;

  /**
   * The name of the mongodb collection for storing volume details
   * eg: 'volumes'
   */
  volumesCollection: string;

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
   * The name of the mongodb collection for storing user stats
   * eg: '_foreignKeys'
   */
  foreignKeys: string;
}

/*
 * Database properties
 */
export interface IDatabase {
  /**
   * The name of the mongo database to use
   */
  name: string;

  /**
   * The database host we are listening on
   */
  host: string;

  /** The collection name where we store database migrations */
  migrations: string;
}

/*
 * Users stores data on an external cloud volume with Google
 */
export interface IGoogleProperties extends IRemoteOptions {
  /*
   * Path to the key file
   */
  keyFile: string;

  /*
   * Project ID
   */
  projectId: string;
}

export interface IMailProperties {
  /**
   * Specify the type of mailer to use.
   * Currently we support 'mailgun'
   */
  type: 'mailgun';

  /**
   * Options to be sent to the desired mailer
   */
  options: string | IMailgun;
}

export interface IMailOptions {
  /**
   * The from field sent to recipients
   */
  from: string;
}

export interface IMailer {
  /**
   * Attempts to initialize the mailer
   * @param {IMailOptions} options
   * @returns {Promise<boolean>}
   */
  initialize(options: IMailOptions): Promise<boolean>;

  /**
   * Sends an email
   * @param {stirng} to The email address to send the message to
   * @param {stirng} from The email we're sending from
   * @param {stirng} subject The message subject
   * @param {stirng} msg The message to be sent
   * @returns {Promise<boolean>}
   */
  sendMail(to: string, from: string, subject: string, msg: string): Promise<boolean>;
}

/**
 * Options for a mailgun mailer
 */
export interface IMailgun extends IMailOptions {
  /**
   * The domain for associated with the mailgun account
   */
  domain: string;

  /**
   * The api key for your mailgun account
   */
  apiKey: string;
}

/**
 * The base interface for all remote options
 */
export interface IRemoteOptions {}

/**
 * The properties for setting up a local volume
 */
export interface ILocalVolume extends IRemoteOptions {
  /**
   * The system path to a system directory to store the media in.
   * The directory must have write access
   */
  path: string;

  /**
   * The public URL for downloading the media
   */
  url: string;
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
  staticAssets?: string;

  /**
   * Optional - specify if the static files should be served in a particular path. eg: '/static' would mean assets are served from host/static/assets...
   */
  staticPrefix?: string;

  /**
   * The length of time the assets should be cached on a user's browser in milliseconds. The default is 30 days.
   */
  staticAssetsCache?: number;

  /**
   * The root path of the controller's endpoint.
   * eg: "/api"
   */
  rootPath?: string;

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

  /**
   * If true, then graphiql be enabled
   */
  enableGraphIQl?: boolean;

  /**
   * The length of time the assets should be cached on a user's browser.
   * eg:  2592000000 or 30 days
   */
  cacheLifetime?: number;
}

/*
 * Describes the options for the session
 */
export interface ISession {
  /*
   * If set, the session will be restricted to URLs underneath the given path.
   * By default the path is '/', which means that the same sessions will be shared across the entire domain.
   */
  path: string;

  /**
   * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
   * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
   * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
   */
  domain: string;

  /**
   * A persistent connection is one that will last after the user closes the window and visits the site again (true).
   * A non-persistent that will forget the user once the window is closed (false)
   */
  persistent: boolean;

  /**
   * If true, the cookie will be encrypted
   */
  secure: boolean;

  /**
   * If you wish to create a persistent session (one that will last after the user closes the window and visits the site again) you must specify a lifetime as a number of seconds.
   * The lifetime controls both when the browser's cookie will expire, and when the session object will be freed by the sessions module.
   * By default, the browser cookie will expire when the window is closed, and the session object will be freed 24 hours after the last request is seen.
   */
  lifetime: number;
}

/*
 * Users stores data on an external cloud volume with Google
 */
export interface IWebsocket {
  /**
   * A key that must be provided in the headers of socket client connections. If the connection headers
   * contain 'users-api-key', and it matches this key, then the connection is considered an authorized connection.
   */
  socketApiKey: string;

  /**
   * The port number to use for web socket communication. You can use this port to send and receive events or messages
   * to the server.
   * e.g. 8080
   */
  port: number;

  /**
   * The hostname of the socket connection
   * eg: 'localhost'
   */
  host: string;

  /**
   * An array of safe origins for socket communication
   * [
   *   'webinate.net',
   *   'localhost'
   * ]
   */
  approvedSocketDomains: Array<string>;

  /**
   * An object to descrine the socket ssl properties
   */
  ssl?: ISSL;
}

export interface ISSL {
  /**
   * The port number to use for SSL. Only applicable if ssl is true.
   */
  port: number;

  /**
   * The path of the SSL private key. Only applicable if ssl is true.
   */
  key: string;

  /**
   * The path of the SSL certificate file (usually provided by a third vendor). Only applicable if ssl is true.
   */
  cert: string;

  /**
   * The path of the SSL root file (usually provided by a third vendor). Only applicable if ssl is true.
   */
  root: string;

  /**
   * The path of the SSL intermediate/link file (usually provided by a third vendor). Only applicable if ssl is true.
   */
  intermediate: string;

  /**
   * The password to use for the SSL (optional). Only applicable if ssl is true.
   */
  passPhrase: string;
}

/**
 * A server configuration
 */
export interface IConfig {
  /**
   * Describes the server config options
   */
  server: IServer;

  /**
   * Describes each of the media volumes available to the
   * mantle servers.
   */
  remotes: {
    /**
     * Specify the max file size allowed in bytes
     */
    maxFileSize: number;

    /**
     * If the property is a string, it must point
     * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as IGoogleProperties.
     */
    google: string | IGoogleProperties;

    /**
     * If the property is a string, it must point
     * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as ILocalVolume.
     */
    local: string | ILocalVolume;
  };

  /**
   * The length of time a render is kept in the DB before being updated. Stored in seconds.
   * e.g. 86400 (1 day)
   */
  ajaxRenderExpiration: number;

  /**
   * If the property is a string, it must point
   * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as IDatabase.
   */
  database: string | IDatabase;

  /**
   * If debug is true, certain functions will be emulated and more information logged
   */
  debug: boolean;

  /**
   * Settings related to sending emails
   */
  mail: IMailProperties;

  /**
   * Describes the session settings
   */
  sessionSettings: ISession;

  /**
   * The administrative user. This is the root user that will have access to the information in the database.
   * This can be anything you like, but try to use passwords that are hard to guess. If the property is a string, it must point
   * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as below.
   * eg:
   * 'adminUser': {
   *  'username': 'root',
   *  'email': 'root_email@host.com',
   *  'password': 'CHANGE_THIS_PASSWORD'
   * }
   */
  adminUser: string | IAdminUser;

  /**
   * Information regarding the websocket communication. Used for events and IPC
   */
  websocket: IWebsocket;

  [key: string]: any;
}

export type IUpload = {
  size: number;
  path: string;
  name: string;
  type: string;
};

export type IUploadToken = {
  id: string;
  url: string;
};

export interface IGQLContext extends IncomingMessage {
  server: IServer;
  res: ServerResponse;
  verbose?: boolean;
  user?: IUserEntry<'server'>;
  isAdmin: boolean;
}

/**
 * This interface describes a remote destination that is used to upload
 * files sent from mantle. Remote's can be thought of as drives on a
 * computer or volumes in a cloud.
 */
export interface IRemote {
  initialize(options: IRemoteOptions): Promise<void>;

  createVolume(volume: Partial<IVolume<'server' | 'client'>>, options?: any): Promise<string>;

  uploadFile(volume: IVolume<'server' | 'client'>, file: IUpload): Promise<IUploadToken>;

  removeFile(volume: IVolume<'server' | 'client'>, id: IFileEntry<'server'>): Promise<void>;

  removeVolume(volume: IVolume<'server' | 'client'>): Promise<void>;

  // generateUrl( volume: IVolume<'server' | 'client'>, identifier: string ): string;
}

/*
 * Describes the category model
 */
export interface ICategory<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  title: string;
  slug: string;
  parent: T extends 'expanded' ? ICategory<T> : T extends 'client' ? string : ObjectId | null;
  children: T extends 'expanded' ? ICategory<T>[] : undefined;
  description?: string;
}

/*
 * Describes the comment model
 */
export interface IComment<T extends 'client' | 'expanded' | 'server'> extends IModelEntry<T> {
  author: string;
  user: T extends 'expanded'
    ? IUserEntry<T> | null
    : T extends 'client'
    ? string | IUserEntry<T> | null
    : ObjectId | null;
  post: T extends 'expanded' ? IPost<T> : T extends 'client' ? string | IPost<T> : ObjectId;
  parent: T extends 'expanded'
    ? IComment<T> | null
    : T extends 'client'
    ? string | IComment<T> | null
    : ObjectId | null;
  public: boolean;
  content: string;
  children: T extends 'expanded' ? IComment<T>[] : T extends 'client' ? string[] | IComment<T>[] : ObjectId[];
  createdOn: number;
  lastUpdated: number;
}

export interface IDocument<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  author: T extends 'expanded' ? IUserEntry<T> : T extends 'client' ? IUserEntry<T> | string | null : ObjectId | null;
  template: T extends 'expanded' ? ITemplate<T> : T extends 'client' ? ITemplate<T> | string : ObjectId;
  lastUpdated: number;
  createdOn: number;
  elementsOrder: T extends 'server' ? ObjectId[] : string[];
  elements: T extends 'server' ? ObjectId[] : IDraftElement<T>[];
  html: { [zone: string]: string };
}

export interface IDraftElement<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  parent: T extends 'client' ? string : ObjectId;
  type: ElementType;
  html: string;
  zone: string;
}

export interface IImageElement<T extends 'server' | 'expanded' | 'client'> extends IDraftElement<T> {
  image: T extends 'expanded' ? IFileEntry<T> : T extends 'client' ? IFileEntry<T> | string | null : ObjectId | null;
  style: any;
}

export interface IDraft<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  parent: T extends 'expanded' ? IDocument<T> : T extends 'client' ? IDocument<T> | string : ObjectId;
  html: { [zone: string]: string };
  createdOn: number;
}

/**
 * The interface for describing each user's file
 */
export interface IFileEntry<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  name: T extends 'client' | 'expanded' ? string : RegExp | string;
  user: T extends 'expanded' ? IUserEntry<T> : T extends 'client' ? IUserEntry<T> | string : ObjectId;
  identifier?: string;
  volumeId: T extends 'server' ? ObjectId : undefined;
  volume: T extends 'expanded' ? IVolume<T> : undefined;
  publicURL?: string;
  created: number;
  size: number;
  mimeType: string;
  isPublic: boolean;
  numDownloads: number;
  parentFile: T extends 'expanded' ? IFileEntry<T> | null : T extends 'client' ? string | null : ObjectId | null;
  meta: any;
}

/**
 * The interface for that describes relation ships between schemas
 */
export interface IForiegnKey {
  _id: ObjectId;
  source: ObjectId;
  target: ObjectId;
  targetCollection: string;
  targetProperty: string;
}

export interface IMailOptions {}

export interface IMailer {
  /**
   * Attempts to initialize the mailer
   * @param {IMailOptions} options
   * @returns {Promise<boolean>}
   */
  initialize(options: IMailOptions): Promise<boolean>;

  /**
   * Sends an email
   * @param {stirng} to The email address to send the message to
   * @param {stirng} from The email we're sending from
   * @param {stirng} subject The message subject
   * @param {stirng} msg The message to be sent
   * @returns {Promise<boolean>}
   */
  sendMail(to: string, from: string, subject: string, msg: string): Promise<boolean>;
}

/**
 * Options for a mailgun mailer
 */
export interface IMailgun extends IMailOptions {
  /**
   * The domain for associated with the mailgun account
   */
  domain: string;

  /**
   * The api key for your mailgun account
   */
  apiKey: string;
}

/*
 * Base interface for all models
 */
export interface IModelEntry<T extends 'expanded' | 'client' | 'server'> {
  _id: T extends 'server' ? ObjectId : string;
  // _requiredDependencies?: Array<{ collection: string, _id: ObjectId }>
  // _optionalDependencies?: Array<{ collection: string, propertyName: string, _id: ObjectId }>
  // _arrayDependencies?: Array<{ collection: string, propertyName: string, _id: ObjectId }>
}

/*
 * Describes the post model
 */
export interface IPost<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  author: T extends 'expanded'
    ? IUserEntry<T> | null
    : T extends 'client'
    ? IUserEntry<T> | string | null
    : ObjectId | null;
  title: string;
  slug: string;
  brief: string;
  public: boolean;
  featuredImage: T extends 'expanded'
    ? IFileEntry<T> | null
    : T extends 'client'
    ? IFileEntry<T> | string | null
    : ObjectId | null;
  document: T extends 'expanded' ? IDocument<T> : T extends 'client' ? IDocument<T> | string : ObjectId;
  latestDraft: T extends 'expanded' ? IDraft<T> | null : T extends 'client' ? null | string : ObjectId | null;
  categories: T extends 'server' ? Array<ObjectId> : Array<string>;
  tags: Array<string>;
  createdOn: number;
  lastUpdated: number;
}

/*
 * Describes the cache renders model
 */
export interface IRender<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  url?: T extends 'client' ? string : RegExp | string;
  expiration?: number;
  createdOn?: number;
  updateDate?: number;
  html?: string;
}

/*
 * An interface to describe the data stored in the database from the sessions
 */
export interface ISessionEntry<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  sessionId: string;
  data: any;
  expiration: number;
}

export interface ITemplate<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  name: string;
  description: string;
  defaultZone: string;
  zones: string[];
}

/*
 * An interface to describe the data stored in the database for users
 */
export interface IUserEntry<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  username: T extends 'server' ? string | RegExp : string;
  email: T extends 'server' ? string | RegExp : string;
  password: string;
  registerKey: string;
  sessionId: string;
  avatar: string;
  avatarFile: T extends 'expanded'
    ? IFileEntry<T>
    : T extends 'client'
    ? string | IFileEntry<'client'> | null
    : ObjectId | null;
  createdOn: number;
  lastLoggedIn: number;
  privileges: UserPrivilege;
  passwordTag: string;
  meta: any;
}

/**
 * The interface for describing each user's volumes
 */
export interface IVolume<T extends 'expanded' | 'server' | 'client'> extends IModelEntry<T> {
  name: string;
  type: 'google' | 'local';
  identifier: string;
  user: T extends 'expanded' ? IUserEntry<T> : T extends 'client' ? IUserEntry<T> | string : ObjectId;
  created: number;
  memoryUsed: number;
  memoryAllocated: number;
  meta: any;
}

/**
 * An interface used to describe requests that have been authenticated by a session id
 */
export interface IAuthReq extends Request {
  _user: IUserEntry<'server'> | null;
  _isAdmin?: boolean;
  _target: IUserEntry<'server'> | null;
}

export type IUploadResponse = {
  size: number;
  path: string;
  name: string;
  type: string;
}[];

/*
 * The most basic response from the server. The base type of all responses.
 */
export interface IResponse {}

export interface ISimpleResponse extends IResponse {
  message: string;
}

/*
 * A GET request that returns an array of data items
 */
export interface Page<T> {
  count: number;
  data: Array<T>;
  index: number;
  limit: number;
}
