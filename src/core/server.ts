import { IClient, IServer, IFileOptions, IAuthOptions, IRenderOptions } from 'modepress';
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
import { CORSController } from '../controllers/cors-controller';
import { SessionController } from '../controllers/session-controller';
import { BucketController } from '../controllers/bucket-controller';
import { StatsController } from '../controllers/stats-controller';
import { FileController } from '../controllers/file-controller';
import { AuthController } from '../controllers/auth-controller';
import { UserController } from '../controllers/user-controller';
import { AdminController } from '../controllers/admin-controller';
import { ErrorController } from '../controllers/error-controller';
import { PostsController } from '../controllers/posts-controller';
import { CommentsController } from '../controllers/comments-controller';

export class Server {
    server: IServer;
    private _controllers: Controller[];
    private _path: string;

    constructor( server: IServer, path: string ) {
        this.server = server;
        this._controllers = [];
        this._path = path;
    }

    parseClient( client: IClient ) {
        if ( !client.controllers ) {
            error( `Client '${client.name}' does not have any controllers defined` );
            process.exit();
        }

        for ( const ctrl of client.controllers ) {
            switch ( ctrl.type ) {
                case 'renders':
                    this._controllers.push( new PageRenderer( ctrl as IRenderOptions ) );
                    break;
                case 'stats':
                    this._controllers.push( new StatsController( ctrl ) );
                    break;
                case 'posts':
                    this._controllers.push( new PostsController( ctrl ) );
                    break;
                case 'comments':
                    this._controllers.push( new CommentsController( ctrl ) );
                    break;
                case 'sessions':
                    this._controllers.push( new SessionController( ctrl ) );
                    break;
                case 'admin':
                    this._controllers.push( new AdminController( ctrl ) );
                    break;
                case 'users':
                    this._controllers.push( new UserController( ctrl ) );
                    break;
                case 'auth':
                    this._controllers.push( new AuthController( ctrl as IAuthOptions ) );
                    break;
                case 'buckets':
                    this._controllers.push( new BucketController( ctrl ) );
                    break;
                case 'files':
                    this._controllers.push( new FileController( ctrl as IFileOptions ) );
                    break;
                default:
                    try {
                        const constructor = require( ctrl.path! ).default;
                        this._controllers.push( new constructor() );
                    }
                    catch ( err ) {
                        error( `Could not load custom controller '${ctrl.path}'` );
                        process.exit();
                    }
                    break
            }
        }
    }

    async initialize( db: mongodb.Db ): Promise<Server> {

        const controllerPromises: Array<Promise<any>> = [];
        const server = this.server;
        const app = express();

        // Create the controllers
        const controllers: Controller[] = [];

        if ( server.corsApprovedDomains )
            controllers.push( new CORSController( server.corsApprovedDomains ) )

        controllers.push( ...this._controllers, new ErrorController() );

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