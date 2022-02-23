import { ISSL } from './i-ssl';

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
