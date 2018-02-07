import { ISSL } from './i-ssl';

/*
 * Users stores data on an external cloud bucket with Google
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