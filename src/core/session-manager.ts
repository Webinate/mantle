import { EventEmitter } from 'events';
import { ISessionEntry, ISession } from 'modepress';
import { ServerRequest, ServerResponse } from 'http';
import { Collection } from 'mongodb';
import { Session } from './session';

/**
* A class that manages session data for active users
 */
export class SessionManager extends EventEmitter {
  private _dbCollection: Collection;
  private _timeout: NodeJS.Timer | null;
  private _cleanupProxy: any;
  private _options: ISession;

  /**
   * Creates an instance of a session manager
   */
  constructor( dbCollection: Collection, options: ISession ) {
    super();
    this._dbCollection = dbCollection;
    this._cleanupProxy = this.cleanup.bind( this );
    this._timeout = null;
    this._options = {
      path: options.path || '/',
      domain: options.domain || '',
      lifetime: options.lifetime || 60 * 30, // 30 minutes
      persistent: options.persistent || true,
      secure: options.secure || false
    };
  }

  /**
   * Gets an array of all active sessions
   */
  async numActiveSessions(): Promise<number> {
    const result = await this._dbCollection.count( {} );
    return result;
  }

  /**
   * Gets an array of all active sessions
   * @param startIndex
   * @param limit
   */
  async getActiveSessions( startIndex: number = 0, limit: number = -1 ): Promise<Array<ISessionEntry>> {
    const results: Array<ISessionEntry> = await this._dbCollection.find( {} ).skip( startIndex ).limit( limit ).toArray();
    return results;
  }

  /**
   * Clears the users session cookie so that its no longer tracked
   * @param sessionId The session ID to remove, if null then the currently authenticated session will be used
   * @param request
   * @param response
   */
  async clearSession( sessionId: string | null, request: ServerRequest, response: ServerResponse ): Promise<boolean> {
    // Check if the request has a valid session ID
    const sId: string = sessionId || this.getIDFromRequest( request );

    if ( sId !== '' ) {
      // We have a session ID, lets try to find it in the DB
      await this._dbCollection.find( <ISessionEntry>{ sessionId: sId } ).limit( 1 ).next();

      // Create a new session
      const session = new Session( sId, this._options );
      session.expiration = -1;

      // Deletes the session entry
      await this._dbCollection.deleteOne( <ISessionEntry>{ sessionId: session.sessionId } );

      this.emit( 'sessionRemoved', sId );

      // Set the session cookie header
      response.setHeader( 'Set-Cookie', session.getSetCookieHeaderValue( request ) );

      // Resolve the request
      return true;
    }
    else
      return true;
  }

  /**
   * Attempts to get a session from the request object of the client
   * @param request
   * @param response
   * @returns Returns a session or null if none can be found
   */
  async getSession( request: ServerRequest, response: ServerResponse | null ): Promise<Session | null> {
    // Check if the request has a valid session ID
    const sessionId: string = this.getIDFromRequest( request );

    if ( sessionId !== '' ) {
      // We have a session ID, lets try to find it in the DB
      const sessionDB: ISessionEntry = await this._dbCollection.find( { sessionId: sessionId } ).limit( 1 ).next();

      // Cant seem to find any session - so create a new one
      if ( !sessionDB )
        return null;

      // Create a new session
      const session = new Session( sessionId, this._options );
      session.deserialize( sessionDB );

      // Adds / updates the DB with the new session
      await this._dbCollection.updateOne( { sessionId: session.sessionId }, session.serialize() );

      // make sure a timeout is pending for the expired session reaper
      if ( !this._timeout )
        this._timeout = global.setTimeout( this._cleanupProxy, 60000 );

      // Set the session cookie header
      if ( response )
        response.setHeader( 'Set-Cookie', session.getSetCookieHeaderValue( request ) );

      // Resolve the request
      return session;
    }
    else
      // Resolve with no session data
      return null;
  }

  /**
   * Attempts to create a session from the request object of the client
   */
  async createSession( request: ServerRequest, response: ServerResponse ): Promise<Session> {
    const session = new Session( this.createID(), this._options );

    // Adds / updates the DB with the new session
    await this._dbCollection.insertOne( session.serialize() );

    // Set the session cookie header
    response.setHeader( 'Set-Cookie', session.getSetCookieHeaderValue( request ) );

    // Resolve the request
    return session;
  }

  /**
   * Each time a session is created, a timer is started to check all sessions in the DB.
   * Once the lifetime of a session is up its then removed from the DB and we check for any remaining sessions.
   * @param force If true, this will force a cleanup instead of waiting on the next timer
   */
  async cleanup( force: boolean = false ) {
    const now: number = +new Date;
    let next: number = Infinity;
    this._timeout = null;

    try {

      // TODO: We need to replace the findToken with one where mongo looks at the conditions
      const findToken = {};

      const sessions: Array<ISessionEntry> = await this._dbCollection.find( findToken ).toArray();

      // Remove query
      const toRemoveQuery: { $or: Array<ISessionEntry> } = { $or: [] };

      for ( let i = 0, l = sessions.length; i < l; i++ ) {
        const expiration: number = parseFloat( sessions[ i ].expiration.toString() );

        // If the session's time is up
        if ( expiration < now || force )
          toRemoveQuery.$or.push( <ISessionEntry>{ _id: sessions[ i ]._id, sessionId: sessions[ i ].sessionId } );
        else
          // Session time is not up, but may be the next time target
          next = next < expiration ? next : expiration;
      }

      // Check if we need to remove sessions - if we do, then remove them :)
      if ( toRemoveQuery.$or.length > 0 ) {
        await this._dbCollection.deleteMany( toRemoveQuery );
        for ( let i = 0, l = toRemoveQuery.$or.length; i < l; i++ )
          this.emit( 'sessionRemoved', toRemoveQuery.$or[ i ].sessionId );

        if ( next < Infinity )
          this._timeout = global.setTimeout( this._cleanupProxy, next - ( +new Date ) + 1000 );
      }
      else {
        if ( next < Infinity )
          this._timeout = global.setTimeout( this._cleanupProxy, next - ( +new Date ) + 1000 );
      }

    } catch ( err ) {
      // If an error occurs, just try again in 2 minutes
      this._timeout = global.setTimeout( this._cleanupProxy, 120000 );
    }
  }

  /**
   * Looks at the headers from the HTTP request to determine if a session cookie has been asssigned and returns the ID.
   * @param req
   * @returns The ID of the user session, or an empty string
   */
  private getIDFromRequest( req: ServerRequest ): string {
    let m: RegExpExecArray | null;

    // look for an existing SID in the Cookie header for which we have a session
    if ( req.headers.cookie && ( m = /SID=([^ ,;]*)/.exec( req.headers.cookie ) ) )
      return m[ 1 ];
    else
      return '';
  }

  /**
   * Creates a random session ID.
   * The ID is a pseude-random ASCII string which contains at least the specified number of bits of entropy (64 in this case)
   * the return value is a string of length [bits/6] of characters from the base64 alphabet
   * @returns A user session ID
   */
  private createID(): string {
    let bits: number = 64;

    let chars: string, rand: number, i: number, ret: string;
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    ret = '';

    // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
    while ( bits > 0 ) {
      rand = Math.floor( Math.random() * 0x100000000 ); // 32-bit integer

      // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
      for ( i = 26; i > 0 && bits > 0; i -= 6, bits -= 6 )
        ret += chars[ 0x3F & rand >>> i ];
    }

    return ret
  }
}