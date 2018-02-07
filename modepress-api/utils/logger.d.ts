/**
 * Initializes the logger
 */
export declare function initializeLogger(): void;
/**
 * Logs an warning message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export declare function warn(message: string, meta?: any): Promise<{}>;
/**
 * Returns if logging is enabled
 */
export declare function enabled(): boolean;
/**
 * Logs an info message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export declare function info(message: string, meta?: any): Promise<{}>;
/**
 * Logs an error message
 * @param message The message to log
 * @param meta Optional meta information to store with the message
 */
export declare function error(message: string, meta?: any): Promise<{}>;
/**
 * Clears the console
 */
export declare function clear(): void;
