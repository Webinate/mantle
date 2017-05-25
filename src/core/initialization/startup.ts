import { IConfig, IClient } from 'modepress';
import * as fs from 'fs';
import { error, info, clear, initializeLogger } from '../../utils/logger';
import * as yargs from 'yargs';
import { Server as MongoServer, Db } from 'mongodb';
import { Server } from '../server';
import { ConsoleManager } from '../../console/console-manager';
import { prepare } from './db-preparation';

let config: IConfig;
const args = yargs.argv;

// Start the logger
initializeLogger();


// If no logging - remove all transports
if ( args.logging && args.logging.toLowerCase().trim() === 'false' ) {
    clear();
}

// Make sure the config path argument is there
if ( !args.config || args.config.trim() === '' ) {
    error( 'No config file specified. Please start modepress with the config path in the argument list. Eg: node main.js --config="./config.js"' );
    process.exit();
}

// Make sure the file exists
if ( !fs.existsSync( args.config ) ) {
    error( `Could not locate the config file at '${args.config}'` );
    process.exit();
}

try {
    // Try load and parse the config
    config = JSON.parse( fs.readFileSync( args.config, 'utf8' ) );
}
catch ( err ) {
    error( `Could not parse the config file - make sure its valid JSON` );
    process.exit();
}

export async function discoverClients() {
    if ( !config.clientsFolder )
        throw new Error( 'The property clientsFolder is not present in the config file' );

    if ( !fs.existsSync( config.clientsFolder ) )
        throw new Error( 'Cannot resolve clientsFolder property. Make sure the folder exists and is accessible' );

    const directories = fs.readdirSync( config.clientsFolder );
    const clientDefinitions: IClient[] = [];
    for ( const dir of directories )
        if ( fs.existsSync( `${dir}/modepress.json` ) ) {
            try {
                const client = JSON.parse( fs.readFileSync( `${dir}/modepress.json` ).toString() );
                clientDefinitions.push( client );
            }
            catch ( err ) {
                throw new Error( `Could not parse modepress JSON in '${dir}'` );
            }
        }

    return clientDefinitions;
}

/**
 * initialization function to prep DB and servers
 */
export async function initialize() {
    info( `Attempting to connect to mongodb...` );

    if ( !config.database )
        throw new Error( 'No database object defined in the config file' );

    const mongoServer = new MongoServer( config.database.host, config.database.port, config.database.name );
    const mongoDB = new Db( config.database.name, mongoServer, { w: 1 } );
    const db = await mongoDB.open();

    info( `Successfully connected to '${config.database.name}' at ${config.database.host}:${config.database.port}` );
    info( `Starting up HTTP servers...` );

    // Create each of your servers here
    const promises: Array<Promise<any>> = [];

    await prepare( db, config );
    const clients = await discoverClients();

    const servers: Server[] = [];

    // First create the servers
    for ( const client of clients ) {
        if ( typeof client.server !== 'string' )
            servers.push( new Server( client.server ) );
    }

    // Now go through the add on clients and add the controllers
    // to any existing servers defined in the client
    for ( const client of clients ) {
        if ( typeof client.server === 'string' ) {
            const server = servers.find( s => s.server.host === client.server )
            if ( !server ) {
                error( `Could not find an existing server with the name ${client.server}` );
                process.exit();
            }

            server!.parseClient( client );
        }
    }


    for ( const server of servers )
        promises.push( server.initialize( db ) );

    // Load each of the servers
    await Promise.all( promises );

    info( `Server instances loaded...` );

    // Create the console manager
    if ( !args.runningTests )
        new ConsoleManager().initialize();
}

if ( !args.runningTests ) {
    // Start the server initialization
    initialize().catch(( err: Error ) => {
        error( err.message ).then(() => process.exit() );
    } );
}