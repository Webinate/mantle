import * as express from "express"
import * as request from "request"
import {IConfig} from "modepress-api";

/**
* Singleton service for communicating with a webinate-users server
*/
export class UsersService
{
    private static _singleton: UsersService;

    public static usersURL: string;
    private _secret: string;

    /**
	* Creates an instance of the service
	* @param {IConfig} config The config file of this server
	*/
    constructor(config: IConfig )
    {
        UsersService.usersURL = config.usersURL + "/users";
        this._secret = config.usersSecret;
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
	* Sets a meta value by name for the specified user
	* @param {string} name The name of the meta value
    * @param {any} val The value to set
    * @param {string} user The username of the target user
    * @param {Request} req
    * @param {Response} res
	* @returns {Promise<UsersInterface.IResponse>}
	*/
    setMetaValue(name: string, val: any, user: string, req: express.Request, res: express.Response): Promise<UsersInterface.IResponse>
    {
        var that = this;
        return new Promise<UsersInterface.IResponse>(function (resolve, reject)
        {
            request.post(`${UsersService.usersURL}/meta/${user}/${name}`, { body: { secret: that._secret, value: val }, headers: { cookie: (<any>req).headers.cookie } }, function (error, response, body)
            {
                if (error)
                    return reject(error);

                var token: UsersInterface.IResponse = JSON.parse(body);

                if (token.error)
                    return reject(new Error(token.message));

                resolve(token);
            });
        });
    }

    /**
	* Sets a users meta data
    * @param {any} val The value to set
    * @param {string} user The username of the target user
    * @param {Request} req
    * @param {Response} res
	* @returns {Promise<UsersInterface.IResponse>}
	*/
    setMeta(val: any, user: string, req: express.Request, res: express.Response): Promise<UsersInterface.IResponse>
    {
        var that = this;
        return new Promise<UsersInterface.IResponse>(function (resolve, reject)
        {
            request.post(`${UsersService.usersURL}/meta/${user}`, { body: { secret: that._secret, value: val }, headers: { cookie: (<any>req).headers.cookie } }, function (error, response, body)
            {
                if (error)
                    return reject(error);

                var token: UsersInterface.IResponse = JSON.parse(body);

                if (token.error)
                    return reject(new Error(token.message));

                resolve(token);
            });
        });
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
    public static getSingleton(config?: IConfig)
    {
        if (!UsersService._singleton)
            UsersService._singleton = new UsersService(config);

        return UsersService._singleton;
    }
}

