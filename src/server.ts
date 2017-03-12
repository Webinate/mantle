import * as express from 'express';
import * as morgan from 'morgan';
import * as mongodb from 'mongodb';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as winston from 'winston';
import * as compression from 'compression';
import { Controller } from './controllers/controller'
import PageRenderer from './controllers/page-renderer'
import CORSController from './controllers/cors-controller';
import { PathHandler } from './path-handler';
import { BucketController } from './controllers/bucket-controller';
import { AuthController } from './controllers/auth-controller';
import { UserController } from './controllers/user-controller';
import { CORSController } from './controllers/cors-controller';
import { ErrorController } from './controllers/error-controller';
import { CommsController } from './socket-api/comms-controller';

export class Server {
    private _config: Modepress.IConfig;
    private _server: Modepress.IServer;
    private _db: mongodb.Db;

    constructor( server: Modepress.IServer, config: Modepress.IConfig, db: mongodb.Db ) {
        this._config = config;
        this._server = server;
        this._db = db;
    }

    async initialize( db: mongodb.Db ): Promise<Server> {
        const config = this._config;
        const server = this._server;
        const app = express();

        // Add the CORS controller
        new CORSController( app, server );

        // Enable GZIPPING
        app.use( compression() );

        // User defined static folders
        for ( let i = 0, l: number = server.staticFilesFolder.length; i < l; i++ ) {
            winston.info( `Adding static resource folder '${server.staticFilesFolder[ i ]}'`, { process: process.pid });
            app.use( express.static( server.staticFilesFolder[ i ], { maxAge: server.cacheLifetime }) );
        }

        // Setup the jade template engine
        app.set( 'view engine', 'jade' );

        // log every request to the console
        app.use( morgan( 'dev' ) );

        // Create each of your controllers here
        const controllerPromises: Array<Promise<any>> = [];
        const controllers: Array<Controller> = [];
        let lastAddedController: string | null = null;

        controllers.push( new PageRenderer( server, config, app ) );

        // Users related
        controllers.push( new CommsController( config! ) );
        controllers.push( new BucketController( app, config! ) );
        controllers.push( new AuthController( app, config! ) );
        controllers.push( new UserController( app, config! ) );
        controllers.push( new ErrorController( app ) );

        // Load the controllers
        try {
            for ( let i = 0, l: number = server.controllers.length; i < l; i++ ) {
                lastAddedController = server.controllers[ i ].path;
                const func = require( server.controllers[ i ].path );
                controllers.push( new func.default( server, config, app ) );
            }
        }
        catch ( err ) {
            winston.error( `An error occurred while creating one of the controllers: '${err.message}'`, { process: process.pid });
            winston.error( `The controller that failed was: '${lastAddedController!}'`, { process: process.pid });
            process.exit();
        }

        // Maps the path specified to an HTML or template
        for ( let i = 0, l: number = server.paths.length; i < l; i++ )
            new PathHandler( server.paths[ i ], server ).route( app );

        winston.info( `Attempting to start HTTP server...`, { process: process.pid });

        // Start app with node server.js
        const httpServer = http.createServer( app );
        httpServer.listen( { port: server.portHTTP, host: 'localhost' });
        winston.info( `Listening on HTTP port ${server.portHTTP}`, { process: process.pid });

        // If we use SSL then start listening for that as well
        if ( server.ssl ) {
            if ( server.sslIntermediate !== '' && !fs.existsSync( server.sslIntermediate ) ) {
                winston.error( `Could not find sslIntermediate: '${server.sslIntermediate}'`, { process: process.pid });
                process.exit();
            }

            if ( server.sslCert !== '' && !fs.existsSync( server.sslCert ) ) {
                winston.error( `Could not find sslIntermediate: '${server.sslCert}'`, { process: process.pid });
                process.exit();
            }

            if ( server.sslRoot !== '' && !fs.existsSync( server.sslRoot ) ) {
                winston.error( `Could not find sslIntermediate: '${server.sslRoot}'`, { process: process.pid });
                process.exit();
            }

            if ( server.sslKey !== '' && !fs.existsSync( server.sslKey ) ) {
                winston.error( `Could not find sslIntermediate: '${server.sslKey}'`, { process: process.pid });
                process.exit();
            }

            const caChain = [ fs.readFileSync( server.sslIntermediate ), fs.readFileSync( server.sslRoot ) ];
            const privkey = server.sslKey ? fs.readFileSync( server.sslKey ) : null;
            const theCert = server.sslCert ? fs.readFileSync( server.sslCert ) : null;
            const port = server.portHTTPS ? server.portHTTPS : 443;

            winston.info( `Attempting to start SSL server...`, { process: process.pid });

            const httpsServer = https.createServer( { key: privkey, cert: theCert, passphrase: server.sslPassPhrase, ca: caChain }, app );
            httpsServer.listen( { port: port, host: 'localhost' });

            winston.info( `Listening on HTTPS port ${port}`, { process: process.pid });
        }

        // Initialize all the controllers
        for ( let i = 0, l: number = controllers.length; i < l; i++ )
            controllerPromises.push( controllers[ i ].initialize( db ) );

        // Return a promise once all the controllers are complete
        try {
            await Promise.all( controllerPromises );
            winston.info( `All controllers are now setup successfully for ${this._server.host}!`, { process: process.pid });
            return this;

        } catch ( e ) {
            throw new Error( `ERROR An error has occurred while setting up the controllers for ${this._server.host}: '${e.message}'` );
        };
    }
}