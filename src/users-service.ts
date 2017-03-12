import * as express from 'express';
import * as request from 'request';

/**
 * Singleton service for communicating with a webinate-users server
 */
export class UsersService {
    private static _singleton: UsersService;

    public static usersURL: string;

    /**
	 * Creates an instance of the service
	 * @param config The config file of this server
	 */
    constructor( config: Modepress.IConfig ) {
        UsersService.usersURL = config.usersURL;
    }

    /**
	 * Sends an email to the admin account
	 * @param message The message to send
	 */
    sendAdminEmail( message: string ): Promise<any> {
        return new Promise( function( resolve, reject ) {
            request.post( `${UsersService.usersURL}/message-webmaster`, { form: { message: message } }, function( error, response, body ) {
                response; // Supress empty param warning

                if ( error )
                    return reject( error );

                resolve( body );
            });
        });
    }

    /**
	 * Attempts to log a user in
     * @param user The email or username
	 */
    login( user: string, password: string, remember: boolean ): Promise<UsersInterface.IAuthenticationResponse> {
        return new Promise<UsersInterface.IAuthenticationResponse>( function( resolve, reject ) {
            request.post( `${UsersService.usersURL}/users/login`, { body: <UsersInterface.ILoginToken>{ username: user, password: password, rememberMe: remember } }, function( error, response, body ) {
                response; // Supress empty param warning

                if ( error )
                    return reject( error );

                try {
                    resolve( <UsersInterface.IAuthenticationResponse>JSON.parse( body ) );
                }
                catch ( err ) {
                    return reject( err );
                }
            });
        });
    }

    /**
	 * Checks if a user is logged in and authenticated
	 */
    authenticated( req: express.Request ): Promise<UsersInterface.IAuthenticationResponse> {
        return new Promise<UsersInterface.IAuthenticationResponse>( function( resolve, reject ) {
            request.get( `${UsersService.usersURL}/users/authenticated`, { headers: { cookie: ( <any>req ).headers.cookie } }, function( error, response, body ) {
                response; // Supress empty param warning

                if ( error )
                    return reject( error );

                const token: UsersInterface.IAuthenticationResponse = JSON.parse( body );

                if ( token.error )
                    return reject( new Error( token.message ) );

                resolve( token );
            });
        });
    }

    /**
	 * Checks if a user has admin priviledges
	 * @param user The user we are checking
	 */
    isAdmin( user: UsersInterface.IUserEntry ): boolean {
        if ( user.privileges! > 2 )
            return false;

        return true;
    }

    /**
 	 * Checks a user has the desired permission
	 * @param user The user we are checking
     * @param level The level we are checking against
	 * @param existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
	 * @returns
	 */
    hasPermission( user: UsersInterface.IUserEntry, level: number, existingUser?: string ): boolean {
        if ( existingUser !== undefined ) {
            if ( ( user.email !== existingUser && user.username !== existingUser ) && user.privileges! > level )
                return false;
        }
        else if ( user.privileges! > level )
            return false;

        return true;
    }

    /**
     * Attempts to get a user by username
     */
    getUser( user: string, req: express.Request ): Promise<UsersInterface.IGetUser> {
        return new Promise<UsersInterface.IGetUser>( function( resolve, reject ) {
            request.get( `${UsersService.usersURL}/users/${user}`, { headers: { cookie: ( <any>req ).headers.cookie } }, function( error, response, body ) {
                response; // Supress empty param warning
                if ( error )
                    return reject( error );

                resolve( JSON.parse( body ) );
            });
        });
    }


    /**
	 * Gets the user singleton
	 */
    public static getSingleton( config?: Modepress.IConfig ) {
        if ( !UsersService._singleton )
            UsersService._singleton = new UsersService( config! );

        return UsersService._singleton;
    }
}

