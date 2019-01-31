import { ILocalVolume } from './properties/i-remote-options';
import { IGoogleProperties } from './properties/i-google';
import { IDatabase } from './properties/i-database';
import { IMailProperties } from './properties/i-mail';
import { IAdminUser } from './properties/i-admin';
import { ISession } from './properties/i-session';
import { IWebsocket } from './properties/i-socket';

/**
 * A server configuration
 */
export interface IConfig {

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
    'google': string | IGoogleProperties;

    /**
     * If the property is a string, it must point
     * to a json file that will be loaded dynamically at startup. The JSON should have the same structure as ILocalVolume.
     */
    'local': string | ILocalVolume;
  }

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

  [ key: string ]: any;
}