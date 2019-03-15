import * as winston from 'winston';
import * as yargs from 'yargs';

let showLogs: boolean = false;

/**
 * Initializes the logger
 */
export function initializeLogger() {
  const args = yargs.argv;

  // Add the console colours
  winston.addColors({ debug: 'green', info: 'cyan', silly: 'magenta', warn: 'yellow', error: 'red' });

  if (args.logging === undefined || args.logging === 'true') showLogs = true;

  winston.remove(winston.transports.Console);
  winston.add(new winston.transports.Console());

  // Saves logs to file
  if (args.logFile && args.logFile.trim() !== '')
    winston.add(
      new winston.transports.File({ filename: args.logFile, maxsize: 50000000, maxFiles: 1, tailable: true })
    );
}

/**
 * Logs an warning message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function warn(message: string, meta?: any) {
  return new Promise(function(resolve, reject) {
    if (!showLogs) return resolve();

    winston.warn(message, meta, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
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
export function info(message: string, meta?: any) {
  return new Promise(function(resolve, reject) {
    if (!showLogs) return resolve();

    winston.info(message, meta, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Logs an error message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function error(message: string, meta?: any) {
  return new Promise(function(resolve, reject) {
    if (!showLogs) return resolve();

    winston.error(message, meta, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Clears the console
 */
export function clear() {
  winston.clear();
}
