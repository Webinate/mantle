///<reference path='./node.d.ts' />

declare module "ws" {

    var server: WS.Static;

    export = server;
}

declare module WS
{


    export interface Static
    {
        /**
        * Create a new WebSocket connection.
        *
        * @param {String} address The URL/address we need to connect to.
        * @param {Function} fn Open listener.
        * @returns {WebSocket}
        */
        createConnection(address: string, fn?: Function): WebSocket;

        Server: typeof Server;
    }

    /**
    * WebSocket implementation
    */
    export class WebSocket implements NodeJS.EventEmitter
    {
        public _isServer: boolean;
        public url: string;
        public protocol: string;
        public readyState: string;
        public extensions: string;
        public protocolVersion: string;
        public upgradeReq: any;
        public supports: { binary: boolean; };
 
        /**
        * WebSocket implementation
        *
        * @constructor
        * @param {String} address Connection address.
        * @param {String|Array} protocols WebSocket protocols.
        * @param {Object} options Additional connection options.
        */
        constructor(path: string, protocols?: string | Array<any>, options?: any);

        /**
        * Gracefully closes the connection, after sending a description message to the server
        *
        * @param {Object} data to be sent to the server
        */
        close(code, data);

        /**
        * Pause the client stream
        */
        pause();

        /**
        * Sends a ping
        *
        * @param {Object} data to be sent to the server
        * @param {Object} Members - mask: boolean, binary: boolean
        * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
        */
        ping(data, options, dontFailWhenClosed);

        /**
        * Resume the client stream
        */
        resume();

        /**
        * Sends a pong
        *
        * @param {Object} data to be sent to the server
        * @param {Object} Members - mask: boolean, binary: boolean
        * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
        */
        pong(data, options, dontFailWhenClosed);

        /**
        * Sends a piece of data
        *
        * @param {Object} data to be sent to the server
        * @param {Object} Members - mask: boolean, binary: boolean, compress: boolean
        * @param {function} Optional callback which is executed after the send completes
        */
        send(data, options?: { mask: boolean; binary: boolean; compress: boolean; }, cb?: Function);

        /**
        * Streams data through calls to a user supplied function
        *
        * @param {Object} Members - mask: boolean, binary: boolean, compress: boolean
        * @param {function} 'function (error, send)' which is executed on successive ticks of which send is 'function (data, final)'
        */
        stream(options, cb: (Error, send) => any);

        /**
        * Immediately shuts down the connection
        */
        terminate();

        addListener(event: string, listener: Function): NodeJS.EventEmitter;
        on(event: string, listener: Function): NodeJS.EventEmitter;
        once(event: string, listener: Function): NodeJS.EventEmitter;
        removeListener(event: string, listener: Function): NodeJS.EventEmitter;
        removeAllListeners(event?: string): NodeJS.EventEmitter;
        setMaxListeners(n: number): void;
        listeners(event: string): Function[];
        emit(event: string, ...args: any[]): boolean;
    }

    export interface ServerOptions
    {
        host?: string;
        port?: number;
        /*A nodejs http server - if not provided one is created for you*/
        server?: any;
        verifyClient?: boolean;
        handleProtocols?: boolean;
        path?: string;
        noServer?: boolean;
        disableHixie?: boolean;
        clientTracking?: boolean;
        perMessageDeflate?: boolean;
    }

    /**
    * WebSocket Server implementation
    */
    export class Server implements NodeJS.EventEmitter
    {
        clients: Array<WebSocket>;

        constructor(options?: ServerOptions, callback?);

        /**
        * Immediately shuts down the connection.
        */
        close(code, data, mask, cb);

        addListener(event: string, listener: Function): NodeJS.EventEmitter;
        on(event: string, listener: Function): NodeJS.EventEmitter;
        once(event: string, listener: Function): NodeJS.EventEmitter;
        removeListener(event: string, listener: Function): NodeJS.EventEmitter;
        removeAllListeners(event?: string): NodeJS.EventEmitter;
        setMaxListeners(n: number): void;
        listeners(event: string): Function[];
        emit(event: string, ...args: any[]): boolean;
    }
}