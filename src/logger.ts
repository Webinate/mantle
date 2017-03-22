import * as winston from 'winston';
import * as yargs from 'yargs';

function assignMeta( meta?: any ) {
    if ( meta )
        return Object.assign( meta, { process: process.pid } );
    else
        return { process: process.pid };
}

/**
 * Initializes the logger
 */
export function initializeLogger() {
    const args = yargs.argv;

    // Add the console colours
    winston.addColors( { debug: 'green', info: 'cyan', silly: 'magenta', warn: 'yellow', error: 'red' } );
    winston.remove( winston.transports.Console );
    winston.add( winston.transports.Console, <any>{ level: 'debug', colorize: true } );

    // Saves logs to file
    if ( args.logFile && args.logFile.trim() !== '' )
        winston.add( winston.transports.File, <winston.TransportOptions>{ filename: args.logFile, maxsize: 50000000, maxFiles: 1, tailable: true } );
}

/**
 * Logs an warning message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function warn( message: string, meta?: any ) {
    return new Promise( function( resolve, reject ) {
        winston.warn( message, assignMeta( meta ), function( err ) {
            if ( err )
                reject( err )
            else
                resolve();
        } )
    } );
}

/**
 * Logs an info message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function info( message: string, meta?: any ) {
    return new Promise( function( resolve, reject ) {
        winston.info( message, assignMeta( meta ), function( err ) {
            if ( err )
                reject( err )
            else
                resolve();
        } )
    } );
}

/**
 * Logs an error message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function error( message: string, meta?: any ) {
    return new Promise( function( resolve, reject ) {
        winston.error( message, assignMeta( meta ), function( err ) {
            if ( err )
                reject( err )
            else
                resolve();
        } )
    } );
}

/**
 * Clears the console
 */
export function clear() {
    winston.clear();
}