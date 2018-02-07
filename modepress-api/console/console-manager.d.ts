export declare const ConsoleCommands: {
    'exit': string;
    'gc': string;
};
/**
 * A helper class for interacting with the server via the console
 */
export declare class ConsoleManager {
    private _rl;
    /**
     * Creates an instance of the manager
     */
    constructor();
    /**
     * Shuts down the server
     */
    private shutdown();
    /**
     * Performs a garbage collection if possible
     */
    private gcCollect();
    /**
     * Initializes the console manager
     */
    initialize(): Promise<void>;
}
