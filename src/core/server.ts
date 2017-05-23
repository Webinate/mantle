import { IConfig } from '../definitions/custom/config/i-config';
import { IServer } from '../definitions/custom/config/i-server';
import * as express from 'express';
import * as morgan from 'morgan';
import * as mongodb from 'mongodb';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { error, info, enabled as loggingEnabled } from '../utils/logger';
import * as compression from 'compression';
import { Controller } from '../controllers/controller'
import PageRenderer from '../controllers/page-renderer'
import CORSController from '../controllers/cors-controller';
import { PathHandler } from './path-handler';
import { SessionController } from '../controllers/session-controller';
import { BucketController } from '../controllers/bucket-controller';
import { StatsController } from '../controllers/stats-controller';
import { FileController } from '../controllers/file-controller';
import { AuthController } from '../controllers/auth-controller';
import { UserController } from '../controllers/user-controller';
import { AdminController } from '../controllers/admin-controller';
import { ErrorController } from '../controllers/error-controller';

export class Server {
    private _config: IConfig;
    private _server: IServer;
    private _db: mongodb.Db;

    constructor( server: IServer, config: IConfig, db: mongodb.Db ) {
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
            info( `Adding static resource folder '${server.staticFilesFolder[ i ]}'` );
            app.use( express.static( server.staticFilesFolder[ i ], { maxAge: server.cacheLifetime } ) );
        }

        // Setup the jade template engine
        app.set( 'view engine', 'jade' );

        // log every request to the console
        if ( loggingEnabled() )
            app.use( morgan( 'dev' ) );

        // Create each of your controllers here
        const controllerPromises: Array<Promise<any>> = [];
        const controllers: Array<Controller> = [];
        let lastAddedController: string | null = null;

        controllers.push( new PageRenderer( server, config, app ) );

        // User controllers
        controllers.push( new BucketController( app, config! ) );
        controllers.push( new FileController( app, config! ) );
        controllers.push( new SessionController( app, config! ) );
        controllers.push( new AuthController( app, config!, server! ) );
        controllers.push( new UserController( app, config!, server! ) );
        controllers.push( new AdminController( app, config! ) );
        controllers.push( new StatsController( app, config! ) );


        // Load the optional controllers
        try {
            for ( let i = 0, l: number = server.controllers.length; i < l; i++ ) {
                lastAddedController = server.controllers[ i ].path;
                const func = require( server.controllers[ i ].path );
                controllers.push( new func.default( server, config, app ) );
            }
        }
        catch ( err ) {
            error( `An error occurred while creating one of the controllers: '${err.message}'` );
            error( `The controller that failed was: '${lastAddedController!}'` );
            process.exit();
        }

        // Add the error controller
        controllers.push( new ErrorController( app ) );

        // Maps the path specified to an HTML or template
        for ( let i = 0, l: number = server.paths.length; i < l; i++ )
            new PathHandler( server.paths[ i ], server ).route( app );

        info( `Attempting to start HTTP server...` );

        // Start app with node server.js
        const httpServer = http.createServer( app );
        httpServer.listen( { port: server.portHTTP, host: 'localhost' } );
        info( `Listening on HTTP port ${server.portHTTP}` );

        // If we use SSL then start listening for that as well
        if ( server.ssl ) {
            if ( server.ssl.sslIntermediate !== '' && !fs.existsSync( server.ssl.sslIntermediate ) ) {
                error( `Could not find sslIntermediate: '${server.ssl.sslIntermediate}'` );
                process.exit();
            }

            if ( server.ssl.sslCert !== '' && !fs.existsSync( server.ssl.sslCert ) ) {
                error( `Could not find sslIntermediate: '${server.ssl.sslCert}'` );
                process.exit();
            }

            if ( server.ssl.sslRoot !== '' && !fs.existsSync( server.ssl.sslRoot ) ) {
                error( `Could not find sslIntermediate: '${server.ssl.sslRoot}'` );
                process.exit();
            }

            if ( server.ssl.sslKey !== '' && !fs.existsSync( server.ssl.sslKey ) ) {
                error( `Could not find sslIntermediate: '${server.ssl.sslKey}'` );
                process.exit();
            }

            const caChain = [ fs.readFileSync( server.ssl.sslIntermediate ), fs.readFileSync( server.ssl.sslRoot ) ];
            const privkey = server.ssl.sslKey ? fs.readFileSync( server.ssl.sslKey ) : null;
            const theCert = server.ssl.sslCert ? fs.readFileSync( server.ssl.sslCert ) : null;
            const port = server.ssl.portHTTPS ? server.ssl.portHTTPS : 443;

            info( `Attempting to start SSL server...` );

            const httpsServer = https.createServer( { key: privkey, cert: theCert, passphrase: server.ssl.sslPassPhrase, ca: caChain }, app );
            httpsServer.listen( { port: port, host: 'localhost' } );

            info( `Listening on HTTPS port ${port}` );
        }

        // Initialize all the controllers
        for ( let i = 0, l: number = controllers.length; i < l; i++ )
            controllerPromises.push( controllers[ i ].initialize( db ) );

        // Return a promise once all the controllers are complete
        try {
            await Promise.all( controllerPromises );
            info( `All controllers are now setup successfully for ${this._server.host}!` );
            return this;

        } catch ( e ) {
            throw new Error( `ERROR An error has occurred while setting up the controllers for ${this._server.host}: '${e.message}'` );
        };
    }
}