import { EmailTokens } from '../types/tokens/standard-tokens';
import * as express from 'express';
import { Router } from './router';
import * as bodyParser from 'body-parser';
import ControllerFactory from '../core/controller-factory';
import { errJson } from '../utils/response-decorators';
import { IBaseControler } from '../types/misc/i-base-controller';
import * as mongodb from 'mongodb';

export class EmailsRouter extends Router {
  private _options: IBaseControler;

  /**
	 * Creates a new instance of the email controller
	 */
  constructor( options: IBaseControler ) {
    super( null );
    this._options = options;
  }

  /**
 * Called to initialize this controller and its related database objects
 */
  async initialize( e: express.Express, db: mongodb.Db ) {


    const router = express.Router();
    router.use( bodyParser.urlencoded( { 'extended': true } ) );
    router.use( bodyParser.json() );
    router.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

    // Filter the post requests
    router.post( '/', this.onPost.bind( this ) );

    // Register the path
    e.use( ( this._options.rootPath || '' ) + '/message-admin', router );

    await super.initialize( e, db );
    return this;
  }

  /**
	 * Called whenever a post request is caught by this controller
	 */
  protected onPost( req: express.Request, res: express.Response ): any {
    // Set the content type
    res.setHeader( 'Content-Type', 'application/json' );

    const body = req.body as EmailTokens.Post.Body;

    const message: string = [ `Hello admin,`,
      `We have received a message from ${body.name}:`,
      `${body.message}`,
      ``,
      `Email: ${body.email}`,
      `Phone: ${body.phone}`,
      `Website: ${body.website}` ].join( '\r\n' );

    ControllerFactory.get( 'users' ).sendAdminEmail( message ).then( function( body ) {
      res.end( body as EmailTokens.Post.Response );

    } ).catch( function( err ) {
      errJson( err, res );
    } );
  }
}