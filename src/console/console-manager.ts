import { createInterface, ReadLine } from 'readline';
import { info } from '../utils/logger';

export const ConsoleCommands = {
  'exit': 'Use this command to shutdown the server',
  'gc': 'Force a garbage collect'
}

/**
 * A helper class for interacting with the server via the console
 */
export class ConsoleManager {
  private _rl: ReadLine;

  /**
   * Creates an instance of the manager
   */
  constructor() {
    this._rl = createInterface( {
      input: process.stdin,
      output: process.stdout
    } );
  }

  /**
   * Shuts down the server
   */
  private shutdown() {
    info( `Bye!` );
    process.exit( 0 );
  }

  /**
   * Performs a garbage collection if possible
   */
  private gcCollect() {
    if ( global && global.gc ) {
      global.gc();
      info( `Forced a garbge collection` );
    }
    else
      info( `You cannot force garbage collection without adding the command line argument --expose-gc eg: 'node --expose-gc test.js'` );
  }

  /**
   * Initializes the console manager
   */
  async initialize() {

    // Set the prompt to be a >
    this._rl.setPrompt( '> ' );
    this._rl.prompt();

    // Now each time the user hits enter
    this._rl.on( 'line', ( line: string ) => {
      switch ( line.trim() ) {
        case ConsoleCommands.exit:
          this.shutdown();
          break;
        case ConsoleCommands.gc:
          this.gcCollect();
          break;
        default:
          info( `Sorry, command not recognised: '${line.trim()}'` );
          break;
      }

      this._rl.prompt();
    } );
  }
}