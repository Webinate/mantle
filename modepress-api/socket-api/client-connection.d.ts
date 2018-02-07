/// <reference types="ws" />
import * as ws from 'ws';
import { User } from '../core/user';
import { CommsController } from './comms-controller';
/**
 * A wrapper class for client connections made to the CommsController
 */
export declare class ClientConnection {
    onDisconnected: (connection: ClientConnection) => void;
    ws: ws;
    user: User | null;
    domain: string;
    authorizedThirdParty: boolean;
    private _controller;
    constructor(ws: ws, domain: string, controller: CommsController, authorizedThirdParty: boolean);
    /**
     * Called whenever we recieve a message from a client
     */
    private onMessage(message);
    /**
   * Called whenever a client disconnnects
   */
    private onClose();
    /**
     * Called whenever an error has occurred
     */
    private onError(err);
}
