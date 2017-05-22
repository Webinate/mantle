'use strict';
import { IConfig } from '../definitions/custom/config/i-config';
import * as bcrypt from 'bcryptjs';
import * as ws from 'ws';
import * as events from 'events';
import * as https from 'https';
import * as fs from 'fs';
import * as mongodb from 'mongodb';
import { error as logError, info } from '../logger';
import { ServerInstructionType } from './socket-event-types';
import { SocketAPI } from './socket-api';
import { ClientConnection } from './client-connection';
import { ClientInstruction } from './client-instruction';
import { ServerInstruction } from './server-instruction';

/**
 * A controller that deals with any any IPC or web socket communications
 */
export class CommsController extends events.EventEmitter {
    public static singleton: CommsController;
    private _server: ws.Server;
    private _connections: ClientConnection[];
    private _hashedApiKey: string;
    private _cfg: IConfig;

    /**
	 * Creates an instance of the Communication server
	 */
    constructor( cfg: IConfig ) {
        super();

        CommsController.singleton = this;
        this._connections = [];
        this._cfg = cfg;
    }

    /**
     * Checks the header api key against the hash generated from the config
     */
    checkApiKey( key: string ): Promise<boolean> {
        return new Promise<boolean>(( resolve, reject ) => {
            bcrypt.compare( key, this._hashedApiKey, function( err, same: boolean ) {
                if ( err )
                    return reject( err );
                else
                    return resolve( same );
            } );
        } );
    }

    /**
	 * Sends an instruction to the relevant client connections
     * @param instruction The instruction from the server
	 */
    processClientInstruction( instruction: ClientInstruction<any> ) {
        let recipients: ClientConnection[];

        if ( !instruction.recipients )
            recipients = this._connections;
        else
            recipients = instruction.recipients;

        let username = instruction.username;

        if ( !username ) {
            for ( let recipient of recipients )
                this.sendToken( recipient, instruction.token );
        }
        else {
            for ( let recipient of recipients )
                if ( recipient.authorizedThirdParty || ( recipient.user && recipient.user.dbEntry.username === username ) )
                    this.sendToken( recipient, instruction.token );
        }
    }

    /**
	 * Processes an instruction sent from a client. Any listeners of the comms controller will listen & react to the
     * instruction - and in some cases might resond to the client with a ClientInstruction.
     * @param instruction The instruction from the client
	 */
    processServerInstruction( instruction: ServerInstruction<any> ) {
        if ( !instruction.token )
            return logError( `Websocket error: An instruction was sent from '${instruction.from.domain}' without a token` );

        if ( !ServerInstructionType[ instruction.token.type ] )
            return logError( `Websocket error: An instruction was sent from '${instruction.from.domain}' with a type that is not recognised` );


        this.emit( instruction.token.type, instruction );
    }

    /**
     * Attempts to send a token to a specific client
     */
    private sendToken( connection: ClientConnection, token: any ): Promise<void> {
        return new Promise<void>( function( resolve, reject ) {
            let serializedData: string;

            try {
                serializedData = JSON.stringify( token )
            }
            catch ( err ) {
                return reject( err );
            }

            connection.ws.send( serializedData, {}, function( error: Error ) {
                if ( error ) {
                    logError( `Websocket broadcase error: '${error}'` );
                    reject( error );
                }

                return resolve();
            } );
        } )
    }

    /**
     * Called whenever a new client connection is made to the WS server
     */
    async onWsConnection( ws: ws ): Promise<void> {
        let headers = ws.upgradeReq.headers;

        if ( this._cfg.debug )
            info( `Websocket client connected: ${headers.origin}` )

        let clientApproved = false;
        for ( let domain of this._cfg.websocket.approvedSocketDomains ) {
            // Check if the connecting client is an authorized third party (more privileges)
            let authorizedThirdParty = false;
            if ( headers[ 'users-api-key' ] && this._hashedApiKey ) {
                info( 'Checking socket API key' );
                authorizedThirdParty = await this.checkApiKey( headers[ 'users-api-key' ] );
            }

            if ( authorizedThirdParty || ( headers.origin && headers.origin.match( new RegExp( domain ) ) ) ) {
                let clientConnection = new ClientConnection( ws, headers.origin || 'AUTHORIZED-ACCESS', this, authorizedThirdParty );

                // Remove the client when its disconnected
                clientConnection.onDisconnected = ( connection: ClientConnection ) => {
                    this._connections.splice( this._connections.indexOf( connection ), 1 );
                }

                this._connections.push( clientConnection );
                clientApproved = true;
                break;
            }
        }

        // The client was not approved - so kill the connection
        if ( !clientApproved ) {
            logError( `A connection was made by ${headers.origin} but it is not on the approved domain list. Make sure the host is on the approvedSocketDomains parameter in the config file.` );
            ws.terminate();
            ws.close();
        }
    }

    /**
	 * Initializes the comms controller
	 */
    async initialize( db: mongodb.Db ): Promise<void> {
        let cfg = this._cfg;

        // Throw error if no socket api key
        if ( !cfg.websocket.socketApiKey )
            throw new Error( 'The socketApiKey was not set in the config file. Make sure it exists (Check the example-config.json) ' );

        this._hashedApiKey = bcrypt.hashSync( cfg.websocket.socketApiKey );

        // dummy request processing - this is not actually called as its handed off to the socket api
        const processRequest = function( req, res ) {
            req; // Suppress compiler warning
            res.writeHead( 200 );
            res.end( 'All glory to WebSockets!\n' );
        };

        // Create the web socket server
        if ( cfg.websocket.ssl ) {
            info( 'Creating secure socket connection' );
            let httpsServer: https.Server;
            const caChain = [ fs.readFileSync( cfg.websocket.ssl.sslIntermediate ), fs.readFileSync( cfg.websocket.ssl.sslRoot ) ];
            const privkey = cfg.websocket.ssl.sslKey ? fs.readFileSync( cfg.websocket.ssl.sslKey ) : null;
            const theCert = cfg.websocket.ssl.sslCert ? fs.readFileSync( cfg.websocket.ssl.sslCert ) : null;

            info( `Attempting to start Websocket server with SSL...` );
            httpsServer = https.createServer( { key: privkey, cert: theCert, passphrase: cfg.websocket.ssl.sslPassPhrase, ca: caChain }, processRequest );
            httpsServer.listen( cfg.websocket.port );
            this._server = new ws.Server( { host: cfg.websocket.host, server: httpsServer } );
        }
        else {
            info( 'Creating regular socket connection' );
            this._server = new ws.Server( { host: cfg.websocket.host, port: cfg.websocket.port } );
        }

        info( 'Websockets attempting to listen on HTTP port ' + this._cfg.websocket.port );

        // Handle errors
        this._server.on( 'error', ( err ) => {
            logError( 'Websocket error: ' + err.toString() );
            this._server.close();
        } );

        // A client has connected to the server
        this._server.on( 'connection', ( ws: ws ) => {
            this.onWsConnection( ws );
        } );

        // Setup the socket API
        new SocketAPI( this );
    }
}