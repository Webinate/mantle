import {IConfig} from "modepress-api";
import * as ws from "ws";
import * as winston from "winston";

/**
* A class for handling events sent from a webinate user server
*/
export class PluginManager
{
    public static singleton: PluginManager;
    public _cfg: IConfig;

    /**
    * Creates an instance of the plugin manager
    */
    constructor(cfg: IConfig)
    {
        this._cfg = cfg;
    } 

    /**
    * Intiailizes the manager
    */
    init(): Promise<any>
    {
        var cfg = this._cfg;

        return new Promise(function (resolve, reject)
        {
            var _client = new (<typeof WS.WebSocket><any>ws)(cfg.usersSocketURL, undefined, { headers: { origin: cfg.usersSocketOrigin } });

            // Opens a stream to the users socket events
            _client.on('open', function ()
            {
                winston.info(`We are listening to users!`, { process: process.pid });
                return resolve();
            });

            // Report if there are any errors
            _client.on('error', function (err: Error)
            {
                winston.error(`An error occurred when trying to connect to Users: ${err.message}`, { process: process.pid });
                return reject();
            });

            // We have recieved a message from the user socket
            _client.on('message', function (data: string, flags)
            {
                winston.info(`We got a message from Users!: ${data}`, { process: process.pid });
            });
        });
    }
}