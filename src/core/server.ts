import { IClient, IServer } from 'modepress';
import * as express from 'express';
import * as morgan from 'morgan';
import * as mongodb from 'mongodb';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { error, info, enabled as loggingEnabled } from '../utils/logger';
import * as compression from 'compression';
import { Controller } from '../controllers/controller'
import { ErrorController } from '../controllers/error-controller';

export class Server {
    server: IServer;
    private _controllers: Controller[];
    private _path: string;

    constructor( server: IServer, path: string ) {
        this.server = server;
        this._controllers = [];
        this._path = path;
    }

    /**
     * Goes through each client json discovered in the modepress client folder
     * and attempts to load it
     * @param client The client we are loading
     */
    parseClient( client: IClient & { path: string; } ) {
        if ( !client.controllers ) {
            error( `Client '${client.name}' does not have any controllers defined` );
            process.exit();
        }

        for ( const ctrl of client.controllers ) {
            try {
                const constructor = require( `${client.path}/${ctrl.path!}` ).default;
                this._controllers.push( new constructor( client ) );
            }
            catch ( err ) {
                error( `Could not load custom controller '${ctrl.path}'. \n\rERROR: ${err.toString()}. \n\rSTACK: ${err.stack ? err.stack : ''}` );
                process.exit();
            }
        }
    }

    async initialize( db: mongodb.Db ): Promise<Server> {

        const controllerPromises: Array<Promise<any>> = [];
        const server = this.server;
        const app = express();

        // Create the controllers
        const controllers: Controller[] = [ ...this._controllers, new ErrorController() ];

        // Enable GZIPPING
        app.use( compression() );

        // User defined static folders
        if ( server.staticAssets ) {
            for ( let i = 0, l: number = server.staticAssets.length; i < l; i++ ) {
                let localStaticFolder = `${this._path}/${server.staticAssets[ i ]}`;
                if ( !fs.existsSync( localStaticFolder ) ) {
                    error( `Could not resolve local static file path '${localStaticFolder}' for server '${server.host}'` );
                    process.exit();
                }

                info( `Adding static resource folder '${localStaticFolder}'` );
                app.use( express.static( localStaticFolder, { maxAge: server.staticAssetsCache || 2592000000 } ) );
            }
        }

        // Setup the jade template engine
        app.set( 'view engine', 'jade' );

        // log every request to the console
        if ( loggingEnabled() )
            app.use( morgan( 'dev' ) );

        info( `Attempting to start HTTP server...` );

        // Start app with node server.js
        const httpServer = http.createServer( app );
        httpServer.listen( { port: server.port, host: server.host || 'localhost' } );
        info( `Listening on HTTP port ${server.port}` );

        // If we use SSL then start listening for that as well
        if ( server.ssl ) {
            if ( server.ssl.intermediate !== '' && !fs.existsSync( server.ssl.intermediate ) ) {
                error( `Could not find ssl.intermediate: '${server.ssl.intermediate}'` );
                process.exit();
            }

            if ( server.ssl.cert !== '' && !fs.existsSync( server.ssl.cert ) ) {
                error( `Could not find ssl.cert: '${server.ssl.cert}'` );
                process.exit();
            }

            if ( server.ssl.root !== '' && !fs.existsSync( server.ssl.root ) ) {
                error( `Could not find ssl.root: '${server.ssl.root}'` );
                process.exit();
            }

            if ( server.ssl.key !== '' && !fs.existsSync( server.ssl.key ) ) {
                error( `Could not find ssl.key: '${server.ssl.key}'` );
                process.exit();
            }

            const caChain = [ fs.readFileSync( server.ssl.intermediate ), fs.readFileSync( server.ssl.root ) ];
            const privkey = server.ssl.key ? fs.readFileSync( server.ssl.key ) : null;
            const theCert = server.ssl.cert ? fs.readFileSync( server.ssl.cert ) : null;
            const port = server.ssl.port ? server.ssl.port : 443;

            info( `Attempting to start SSL server...` );

            const httpsServer = https.createServer( { key: privkey, cert: theCert, passphrase: server.ssl.passPhrase, ca: caChain }, app );
            httpsServer.listen( { port: port, host: server.host || 'localhost' } );

            info( `Listening on HTTPS port ${port}` );
        }

        try {

            // Initialize all the controllers
            for ( const ctrl of controllers ) {
                controllerPromises.push( ctrl.initialize( app, db ) )
            }

            // Return a promise once all the controllers are complete
            await Promise.all( controllerPromises );

            info( `All controllers are now setup successfully for ${this.server.host}!` );
            return this;

        } catch ( e ) {
            throw new Error( `ERROR An error has occurred while setting up the controllers for ${this.server.host}: '${e.message}'` );
        };
    }
}