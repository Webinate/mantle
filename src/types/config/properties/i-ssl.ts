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
