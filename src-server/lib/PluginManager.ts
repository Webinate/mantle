import {IConfig} from "modepress-api";
import * as ws from "ws";
import * as winston from "winston";

export class PluginManager
{
    public static singleton: PluginManager;
    public _cfg: IConfig;

    constructor(cfg: IConfig)
    {
        this._cfg = cfg;
        
    } 

    init(): Promise<any>
    {
        var cfg = this._cfg;

        return new Promise(function (resolve, reject)
        {
            var _client = new (<typeof WS.WebSocket><any>ws)(cfg.usersSocketURL, undefined, { headers: { origin: cfg.usersSocketOrigin } });
            _client.on('open', function ()
            {
                winston.info(`We are listening to users!`, { process: process.pid });
                return resolve();
            });

            _client.on('error', function (err: Error)
            {
                winston.error(`An error occurred when trying to connect to Users: ${err.message}`, { process: process.pid });
                return reject();
            });

            _client.on('message', function (data, flags)
            {
                winston.info(`We got a message from Users!: ${data}`, { process: process.pid });
            });
        });
    }
}