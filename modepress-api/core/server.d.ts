import { IClient, IServer } from '../types/config/properties/i-client';
import { Db } from 'mongodb';
export declare class Server {
    server: IServer;
    private _controllers;
    private _path;
    name: string;
    constructor(server: IServer, path: string, name: string);
    /**
     * Goes through each client json discovered in the modepress client folder
     * and attempts to load it
     * @param client The client we are loading
     */
    parseClient(client: IClient & {
        path: string;
    }): void;
    initialize(db: Db): Promise<Server>;
}
