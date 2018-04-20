import * as winston from 'winston';
import * as yargs from 'yargs';

let showLogs: boolean = false;

function assignMeta( meta?: any ) {
  if ( meta )
    return Object.assign( meta, { process: process.pid } );
  else
    return { process: process.pid };
}

/**
 * Fixes an issue where the console logger was not showing up in visual studio code
 */
function fixVSCodeOutput() {
  const winston = require( 'winston' );
  const winstonCommon = require( 'winston/lib/winston/common' );

  // Override to use real console.log etc for VSCode debugger
  winston.transports.Console.prototype.log = function( level: 'log' | 'error' | 'warn', message: string, meta: any, callback: () => void ) {
    const output = winstonCommon.log( Object.assign( {}, this, {
      level,
      message,
      meta,
    } ) );

    console[ level in console ? level : 'log' ]( output );

    setImmediate( callback, null, true );
  };
}

/**
 * Initializes the logger
 */
export function initializeLogger() {
  const args = yargs.argv;

  // Add the console colours
  winston.addColors( { debug: 'green', info: 'cyan', silly: 'magenta', warn: 'yellow', error: 'red' } );

  if ( args.logging === undefined || args.logging === 'true' )
    showLogs = true;

  winston.remove( winston.transports.Console );
  winston.add( winston.transports.Console, <any>{ level: 'debug', colorize: true } );

  // Saves logs to file
  if ( args.logFile && args.logFile.trim() !== '' )
    winston.add( winston.transports.File, <winston.TransportOptions>{ filename: args.logFile, maxsize: 50000000, maxFiles: 1, tailable: true } );

  fixVSCodeOutput();
}

/**
 * Logs an warning message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function warn( message: string, meta?: any ) {
  return new Promise( function( resolve, reject ) {
    if ( !showLogs )
      return resolve();

    winston.warn( message, assignMeta( meta ), function( err ) {
      if ( err )
        reject( err )
      else
        resolve();
    } )
  } );
}

/**
 * Returns if logging is enabled
 */
export function enabled() {
  return showLogs;
}

/**
 * Logs an info message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function info( message: string, meta?: any ) {
  return new Promise( function( resolve, reject ) {
    if ( !showLogs )
      return resolve();

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
    if ( !showLogs )
      return resolve();

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