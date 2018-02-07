/// <reference types="node" />
/// <reference types="ws" />
import { IConfig } from '../types/config/i-config';
import * as ws from 'ws';
import * as events from 'events';
import * as mongodb from 'mongodb';
import { ClientInstruction } from './client-instruction';
import { ServerInstruction } from './server-instruction';
/**
 * A controller that deals with any any IPC or web socket communications
 */
export declare class CommsController extends events.EventEmitter {
    static singleton: CommsController;
    private _server;
    private _connections;
    private _hashedApiKey;
    private _cfg;
    /**
   * Creates an instance of the Communication server
   */
    constructor(cfg: IConfig);
    /**
     * Checks the header api key against the hash generated from the config
     */
    checkApiKey(key: string): Promise<boolean>;
    /**
   * Sends an instruction to the relevant client connections
     * @param instruction The instruction from the server
   */
    processClientInstruction(instruction: ClientInstruction<any>): void;
    /**
   * Processes an instruction sent from a client. Any listeners of the comms controller will listen & react to the
     * instruction - and in some cases might resond to the client with a ClientInstruction.
     * @param instruction The instruction from the client
   */
    processServerInstruction(instruction: ServerInstruction<any>): Promise<{}> | undefined;
    /**
     * Attempts to send a token to a specific client
     */
    private sendToken(connection, token);
    /**
     * Called whenever a new client connection is made to the WS server
     */
    onWsConnection(ws: ws): Promise<void>;
    /**
     * Initializes the comms controller
     */
    initialize(db: mongodb.Db): Promise<void>;
}
