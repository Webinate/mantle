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
    if (!showLogs) return resolve(true);

    winston.warn(message, meta, function(err) {
      if (err) reject(err);
      else resolve(true);
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
    if (!showLogs) return resolve(true);

    winston.info(message, meta, function(err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

function waitForLogger(logger: winston.Logger) {
  return new Promise(resolve => {
    logger.on('close', resolve);
    logger.close();
  });
}

/**
 * Logs an error message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export function error(message: string, meta?: any) {
  return new Promise(function(resolve, reject) {
    if (!showLogs) return resolve(true);

    waitForLogger(winston.error(message, meta))
      .then(() => resolve(true))
      .catch(err => reject(err));
  });
}

/**
 * Clears the console
 */
export function clear() {
  winston.clear();
}
