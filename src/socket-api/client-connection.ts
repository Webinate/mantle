'use strict';

import * as ws from 'ws';
import * as def from 'webinate-users';
import * as winston from 'winston';
import { UserManager, User } from '../users';
import { CommsController } from './comms-controller';
import { ServerInstruction } from './server-instruction';

/**
 * A wrapper class for client connections made to the CommsController
 */
export class ClientConnection {
    public onDisconnected: ( connection: ClientConnection ) => void;
    public ws: ws;
    public user: User | null;
    public domain: string;
    public authorizedThirdParty: boolean;
    private _controller: CommsController;

    constructor( ws: ws, domain: string, controller: CommsController, authorizedThirdParty: boolean ) {
        this.domain = domain;
        this._controller = controller;
        this.authorizedThirdParty = authorizedThirdParty;

        UserManager.get.loggedIn( ws.upgradeReq, null ).then(( user ) => {
            this.ws = ws;
            this.user = user;
            ws.on( 'message', this.onMessage.bind( this ) );
            ws.on( 'close', this.onClose.bind( this ) );
            ws.on( 'error', this.onError.bind( this ) );

        } ).catch( this.onError );
    }

    /**
	 * Called whenever we recieve a message from a client
	 */
    private onMessage( message: string ) {
        winston.info( `Received message from client: '${message}'`, { process: process.pid } );
        try {
            const token: def.SocketTokens.IToken = JSON.parse( message );
            this._controller.processServerInstruction( new ServerInstruction( token, this ) );
        }
        catch ( err ) {
            winston.error( `Could not parse socket message: '${err}'`, { process: process.pid } );
        }
    }

    /**
	 * Called whenever a client disconnnects
	 */
    private onClose() {
        if ( this.onDisconnected )
            this.onDisconnected( this );

        winston.info( `Websocket disconnected: ${this.domain}`, { process: process.pid } )

        this.ws.removeAllListeners( 'message' );
        this.ws.removeAllListeners( 'close' );
        this.ws.removeAllListeners( 'error' );
    }

    /**
	 * Called whenever an error has occurred
	 */
    private onError( err: Error ) {
        winston.error( `An error has occurred for web socket : '${err.message}'`, { process: process.pid } )
    }
}