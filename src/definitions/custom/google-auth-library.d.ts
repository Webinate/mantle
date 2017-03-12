declare namespace GoogleAuth {
    export class OAuth2 {
        constructor( clientId?, clientSecret?, redirectUrl?);
        setCredentials( credentials: any );
    }

    export class JWT {
        /**
        * JWT service account credentials.
        *
        * Retrieve access token using gtoken.
        *
        * @param {string=} email service account email address.
        * @param {string=} keyFile path to private key file.
        * @param {string=} key value of key
        * @param {(string|array)=} scopes list of requested scopes or a single scope.
        * @param {string=} subject impersonated account's email address.
        * @constructor
        */
        constructor( email?, keyFile?, key?, scopes?, subject?);

        authorize( callback?: ( err: Error, success: any ) => void );

        fromJSON( callback?: ( err: Error, success: any ) => void );
    }

    export class AuthLib {
        OAuth2: typeof OAuth2;
        JWT: typeof JWT;
    }
}

declare var moment: typeof GoogleAuth.AuthLib;
declare module 'google-auth-library' {
    export = moment;
}