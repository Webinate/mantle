import * as http from 'http';
import { error as logError } from '../utils/logger';
import { Controller } from './controller';
import * as express from 'express';
import * as mongodb from 'mongodb';
import { IBaseControler } from 'modepress';

/**
 * Checks all incomming requests to see if they are CORS approved
 */
export class CORSController extends Controller {

  private _approvedDomains: string[];
  private _options: IBaseControler;

  /**
 * Creates an instance of the user manager
 */
  constructor( approvedDomains: string[], options: IBaseControler ) {
    super( null );
    this._approvedDomains = approvedDomains;
    this._options = options;
  }

  /**
 * Called to initialize this controller and its related database objects
 */
  async initialize( e: express.Express, db: mongodb.Db ): Promise<Controller> {

    const matches: Array<RegExp> = [];
    for ( let i = 0, l = this._approvedDomains.length; i < l; i++ )
      matches.push( new RegExp( this._approvedDomains[ i ] ) );

    // Approves the valid domains for CORS requests
    e.use( function( req: express.Request, res: express.Response, next: Function ) {
      if ( ( <http.ServerRequest>req ).headers.origin ) {
        let matched = false;
        for ( let m = 0, l = matches.length; m < l; m++ )
          if ( ( <http.ServerRequest>req ).headers.origin.match( matches[ m ] ) ) {
            res.setHeader( 'Access-Control-Allow-Origin', ( <http.ServerRequest>req ).headers.origin );
            res.setHeader( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS' );
            res.setHeader( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Mime-Type, X-File-Name, Cache-Control' );
            res.setHeader( 'Access-Control-Allow-Credentials', 'true' );
            matched = true;
            break;
          }

        if ( !matched )
          logError( `${( <http.ServerRequest>req ).headers.origin} Does not have permission. Add it to the allowed ` );
      }

      if ( req.method === 'OPTIONS' ) {
        res.status( 200 );
        res.end();
      }
      else
        next();
    } );

    await super.initialize( e, db );
    return this;
  }
}