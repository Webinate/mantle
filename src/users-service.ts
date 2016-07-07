import * as express from "express"
import * as http from "http"
import * as request from "request"
import {IConfig} from "modepress-api";

/**
* Singleton service for communicating with a webinate-users server
*/
export class UsersService
{
    private static _singleton: UsersService;

    public static usersURL: string;

    /**
	* Creates an instance of the service
	* @param {IConfig} config The config file of this server
	*/
    constructor(config: IConfig )
    {
        UsersService.usersURL = config.usersURL;
    }

    /**
	* Sends an email to the admin account
	* @param {string} message The message to send
	* @returns {Promise<any>}
	*/
    sendAdminEmail(message: string): Promise<any>
    {
        var that = this;
        return new Promise(function(resolve, reject)
        {
            request.post(`${UsersService.usersURL}/message-webmaster`, { form: { message: message } }, function (error, response, body)
            {
                if (error)
                    return reject(error);

                resolve(body);
            });
        });
    }

    /**
	* Attempts to log a user in
    * @param {string} user The email or username
    * @param {string} password The users password
    * @param {boolean} remember
	* @returns {Promise<UsersInterface.IAuthenticationResponse>}
	*/
    login(user: string, password: string, remember: boolean): Promise<UsersInterface.IAuthenticationResponse>
    {
        var that = this;
        return new Promise<UsersInterface.IAuthenticationResponse>(function (resolve, reject)
        {
            request.post(`${UsersService.usersURL}/login`, { body: <UsersInterface.ILoginToken>{ username: user, password: password, rememberMe: remember } }, function (error, response, body)
            {
                if (error)
                    return reject(error);

                try
                {
                    resolve(<UsersInterface.IAuthenticationResponse>JSON.parse(body));
                }
                catch (err)
                {
                    return reject(err);
                }
            });
        });
    }

    /**
	* Checks if a user is logged in and authenticated
	* @param {express.Request} req
    * @returns {Promise<UsersInterface.IAuthenticationResponse>}
	*/
    authenticated(req: express.Request): Promise<UsersInterface.IAuthenticationResponse>
    {
        var that = this;
        return new Promise<UsersInterface.IAuthenticationResponse>(function (resolve, reject)
        {
            request.get(`${UsersService.usersURL}/authenticated`, { headers: { cookie : (<any>req).headers.cookie } }, function (error, response, body)
            {
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
    hasPermission(user: UsersInterface.IUserEntry, level: number, existingUser?: string): boolean
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
    * Attempts to get a user by username
    * @param {express.Request} req
    */
    getUser(user: string, req: express.Request): Promise<UsersInterface.IGetUser>
    {
        var that = this;
        return new Promise<UsersInterface.IGetUser>(function (resolve, reject)
        {
            request.get(`${UsersService.usersURL}/users/${user}`, { headers: { cookie: (<any>req).headers.cookie } }, function (error, response, body)
            {
                if (error)
                    return reject(error);

                resolve(JSON.parse(body));
            });
        });
    }


    /**
	* Gets the user singleton
	* @returns {UsersService}
	*/
    public static getSingleton(config?: IConfig)
    {
        if (!UsersService._singleton)
            UsersService._singleton = new UsersService(config);

        return UsersService._singleton;
    }
}

