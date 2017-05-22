export interface ISSL {

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
}