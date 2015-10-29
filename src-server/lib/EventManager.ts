import {IConfig} from "modepress-api";
import * as ws from "ws";
import * as winston from "winston";
import * as events from "events";
import * as users from "webinate-users";


export enum UserEventType
{
    Login,
    Logout,
    Activated,
    Removed,
    FilesUploaded,
    FilesRemoved
}

export interface UserEvent
{
    username: string;
    eventType: UserEventType;
}

/**
* A class for handling events sent from a webinate user server
*/
export class EventManager extends events.EventEmitter
{
    public static singleton: EventManager;
    public _cfg: IConfig;

    /**
    * Creates an instance of the plugin manager
    */
    constructor(cfg: IConfig)
    {
        super();
        EventManager.singleton = this;
        this._cfg = cfg;
    }

    /**
    * Intiailizes the manager
    */
    init(): Promise<any>
    {
        var cfg = this._cfg;
        var that = this;

        return new Promise(function (resolve, reject)
        {
            var _client = new (<typeof WS.WebSocket><any>ws)(cfg.usersSocketURL, undefined, { headers: { origin: cfg.usersSocketOrigin } });

            // Opens a stream to the users socket events
            _client.on('open', function ()
            {
                winston.info(`Connected to the users socket stream`, { process: process.pid });
                return resolve();
            });

            // Report if there are any errors
            _client.on('error', function (err: Error)
            {
                winston.error(`An error occurred when trying to connect to the users socket: ${err.message}`, { process: process.pid });
                return reject();
            });

            // We have recieved a message from the user socket
            _client.on('message', that.onMessage.bind(that));
        });
    }

    /**
    * Called whenever we get a message from the user socket events
    */
    private onMessage(data: any, flags: { mask: boolean; binary: boolean; compress: boolean; })
    {
        if (!flags.binary)
        {
            try
            {
                var event: UserEvent = <users.SocketEvents.IEvent>JSON.parse(data);
                this.emit(UserEventType[event.eventType], event);
            }
            catch (err)
            {
                winston.error(`An error occurred while parsing socket string : '${err.message}'`, { process: process.pid });
            }
        }
    }
}