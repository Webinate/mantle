import * as express from "express"
import * as request from "request"

/**
* Singleton service for communicating with a webinate-users server
*/
export class UsersService
{
    private static _singleton: UsersService;
    private _usersURL: string;

    /**
	* Creates an instance of the service
	* @param {string} usersURL The URL of the user management service
	*/
    constructor( usersURL : string )
    {
        this._usersURL = usersURL + "/users";
    }

    /**
	* Checks if a user is logged in and authenticated
	* @param {express.Request} req
    * @param {express.Request} res
	* @returns {Promise<UsersInterface.IAuthenticationResponse>}
	*/
    authenticated(req: express.Request, res: express.Response): Promise<UsersInterface.IAuthenticationResponse>
    {
        var that = this;
        return new Promise<UsersInterface.IAuthenticationResponse>(function (resolve, reject)
        {
            console.log("Getting user data");
            request.get(`${that._usersURL}/authenticated`, { headers: { cookie : (<any>req).headers.cookie } }, function (error, response, body)
            {
                console.log("User data returned");
                if (error)
                    return reject(error);

                var token: UsersInterface.IAuthenticationResponse = JSON.parse(body);

                if (token.error)
                    return reject(new Error(token.message));

                resolve(token);
            });
        });
    }

    /**
	* Checks a user has the desired permission
	* @param {UsersInterface.IUserEntry} user The user we are checking
    * @param {UsersInterface.UserPrivileges} level The level we are checking against
	* @param {string} existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
	* @returns {boolean}
	*/
    hasPermission(user: UsersInterface.IUserEntry, level: UsersInterface.UserPrivileges, existingUser?: string): boolean
    {   
        if (existingUser !== undefined)
        {
            if ((user.email != existingUser && user.username != existingUser) && user.privileges > level)
                return false;
        }
        else if (user.privileges > level)
            return false;

        return true;
    }

    /**
	* Gets the user singleton
	* @returns {UsersService}
	*/
    public static getSingleton(usersURL?: string)
    {
        if (!UsersService._singleton)
            UsersService._singleton = new UsersService(usersURL);

        return UsersService._singleton;
    }
}

