import { createInterface, ReadLine } from 'readline';
import { info } from '../utils/logger';
import * as fs from 'fs';

export const ConsoleCommands = {
  'exit': 'Use this command to shutdown the server',
  'debug': 'Takes a snapshot of the JS heap and stores it in a folder called \'./snapshots\'',
  'gc': 'Force a garbage collect'
}

/**
 * A helper class for interacting with the server via the console
 */
export class ConsoleManager {
  private _rl: ReadLine;
  private _heapdump: any;

  /**
   * Creates an instance of the manager
   */
  constructor() {

    this._heapdump = require( 'heapdump' );

    // Create the readline interface
    this._rl = createInterface( {
      input: process.stdin,
      output: process.stdout
    } );
  }

  /**
   * Takes a snapshot of the javascript heap, and stores the file in the folder ./snapshots.
   * This is useful for debugging the application and finding memory leaks.
   */
  private takeDebugSnapShot() {
    if ( !fs.existsSync( './snapshots' ) ) {
      fs.mkdirSync( 'snapshots' );
      info( `Created folder './snapshots'...` );
    }

    this._heapdump!.writeSnapshot( `./snapshots/${Date.now()}.heapsnapshot`, function( err: Error, filename: string ) {
      if ( err )
        info( `An error occurred while writing to heapdump ${err.toString()}` );
      else
        info( `Heapdump saved to ${filename}` );
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
        case ConsoleCommands.debug:
          this.takeDebugSnapShot();
          break;
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