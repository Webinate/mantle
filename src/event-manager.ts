// import * as ws from 'ws';
// import { error, info } from './logger';
// import * as events from 'events';
// import * as users from 'webinate-users';

// /**
//  * A class for handling events sent from a webinate user server
//  */
// export class EventManager extends events.EventEmitter {
//     public static singleton: EventManager;
//     public _cfg: Modepress.IConfig;

//     /**
//      * Creates an instance of the plugin manager
//      */
//     constructor( cfg: Modepress.IConfig ) {
//         super();
//         EventManager.singleton = this;
//         this._cfg = cfg;
//     }

//     /**
//      * Intiailizes the manager
//      */
//     init(): Promise<any> {
//         const cfg = this._cfg;

//         return new Promise(( resolve ) => {
//             const reconnectInterval = 3 * 1000;
//             const connect = () => {
//                 let options: any = { headers: {} };
//                 options.headers[ 'users-api-key' ] = cfg.usersSocketApiKey;

//                 const _client = new ws( cfg.usersSocketURL, options );

//                 // Opens a stream to the users socket events
//                 _client.on( 'open', function() {
//                     info( `Connected to the users socket stream` );
//                     return resolve();
//                 } );

//                 // Opens a stream to the users socket events
//                 _client.on( 'close', function() {
//                     error( `We lost connection to the stream` );
//                     _client.removeAllListeners();
//                     setTimeout( connect, reconnectInterval );
//                 } );

//                 // Report if there are any errors
//                 _client.on( 'error', function( err: Error ) {
//                     error( `An error occurred when trying to connect to the users socket: ${err.message}` );
//                     _client.removeAllListeners();
//                     setTimeout( connect, reconnectInterval );
//                 } );

//                 // We have recieved a message from the user socket
//                 _client.on( 'message', this.onMessage.bind( this ) );

//             };
//             connect();
//         } );
//     }

//     /**
//      * Called whenever we get a message from the user socket events
//      */
//     private onMessage( data: any, flags: { mask: boolean; binary: boolean; compress: boolean; } ) {
//         if ( !flags.binary ) {
//             try {
//                 const event = <users.SocketTokens.IToken>JSON.parse( data );
//                 this.emit( event.type, event );
//             }
//             catch ( err ) {
//                 error( `An error occurred while parsing socket string : '${err.message}'` );
//             }
//         }
//     }
// }