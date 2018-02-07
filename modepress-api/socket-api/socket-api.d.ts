import { CommsController } from './comms-controller';
/**
 * Handles express errors
 */
export declare class SocketAPI {
    private _comms;
    constructor(comms: CommsController);
    /**
     * Responds to a meta request from a client
     */
    private onMeta(e);
}
