import { ISessionEntry, ISession } from 'modepress';
import { ServerRequest } from 'http';
import { ObjectID } from 'mongodb';

/**
 * A class to represent session data
 */
export class Session {
  _id: ObjectID;

  /*
  * The unique ID of the session
  */
  sessionId: string;

  /*
  * Any custom data associated with the session
  */
  data: any;

  /**
   * The specific time when this session will expire
   */
  expiration: number;

  /**
   * The options of this session system
   */
  options: ISession;

  /**
   * Creates an instance of the session
   * @param sessionId The ID of the session
   * @param options The options associated with this session
   * @param data The data of the session in the database
   */
  constructor( sessionId: string, options: ISession ) {
    this.sessionId = sessionId;
    this.data = {};
    this.options = options;
    this.expiration = ( new Date( Date.now() + options.lifetime * 1000 ) ).getTime();
  }

  /**
   * Fills in the data of this session from the data saved in the database
   * @param data The data fetched from the database
   */
  deserialize( data: ISessionEntry ) {
    this.sessionId = data.sessionId!;
    this.data = data.data;
    this.expiration = data.expiration!;
  }

  /**
   * Creates an object that represents this session to be saved in the database
   */
  serialize(): ISessionEntry {
    const data: ISessionEntry = {
      sessionId: this.sessionId,
      data: this.data,
      expiration: ( new Date( Date.now() + this.options.lifetime * 1000 ) ).getTime()
    };
    return data;
  }

  private getHost( request: ServerRequest ) {
    if ( request.headers.host && ( request.headers.host as string ).indexOf( 'localhost' ) !== -1 )
      return '';
    if ( request.headers.host && request.headers.host !== '' )
      return 'domain=.' + request.headers.host;

    return 'domain=' + this.options.domain
  }

  /**
   * This method returns the value to send in the Set-Cookie header which you should send with every request that goes back to the browser, e.g.
   * response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
   */
  getSetCookieHeaderValue( request: ServerRequest ) {
    let parts;
    parts = [ 'SID=' + this.sessionId ];

    if ( this.options.path )
      parts.push( 'path=' + this.options.path );

    if ( this.options.domain )
      parts.push( this.getHost( request ) );

    if ( this.options.persistent )
      parts.push( 'expires=' + this.dateCookieString( this.expiration ) );

    if ( this.options.secure )
      parts.push( 'secure' );

    return parts.join( '; ' );
  }

  /**
   * Converts from milliseconds to string, since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
   */
  private dateCookieString( ms: number ): string {
    let d, wdy, mon
    d = new Date( ms )
    wdy = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ]
    mon = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

    return wdy[ d.getUTCDay() ] + ', ' + this.pad( d.getUTCDate() ) + '-' + mon[ d.getUTCMonth() ] + '-' + d.getUTCFullYear()
      + ' ' + this.pad( d.getUTCHours() ) + ':' + this.pad( d.getUTCMinutes() ) + ':' + this.pad( d.getUTCSeconds() ) + ' GMT';
  }

  /**
   * Pads a string with 0's
   */
  private pad( n: number ): string {
    return n > 9 ? '' + n : '0' + n;
  }
}