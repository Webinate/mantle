'use strict';
import { ISessionEntry } from 'modepress';
import * as http from 'http';
import * as mongodb from 'mongodb';
import { EventEmitter } from 'events';

/*
 * Describes the options for the session
 */
export interface ISessionOptions {
    /*
     * If set, the session will be restricted to URLs underneath the given path.
     * By default the path is '/', which means that the same sessions will be shared across the entire domain.
     */
    path?: string;

    /**
     * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
     * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
     * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
     */
    domain?: string;

    /**
     * A persistent connection is one that will last after the user closes the window and visits the site again (true).
     * A non-persistent that will forget the user once the window is closed (false)
     */
    persistent?: boolean;

    /**
     * If true, the cookie will be encrypted
     */
    secure?: boolean;

    /**
     * If you wish to create a persistent session (one that will last after the user closes the window and visits the site again) you must specify a lifetime as a number of seconds.
     * The lifetime controls both when the browser's cookie will expire, and when the session object will be freed by the sessions module.
     * By default, the browser cookie will expire when the window is closed, and the session object will be freed 24 hours after the last request is seen.
     */
    lifetime?: number;

    /**
     * Same as lifetime, but the extended version.
     */
    lifetimeExtended?: number;
}

/**
* A class that manages session data for active users
 */
export class SessionManager extends EventEmitter {
    private _dbCollection: mongodb.Collection;
    private _timeout: NodeJS.Timer | null;
    private _cleanupProxy: any;
    private _options: ISessionOptions;

    /**
     * Creates an instance of a session manager
     * @param sessionCollection The mongoDB collection to use for saving sessions
     */
    constructor( dbCollection: mongodb.Collection, options: ISessionOptions ) {
        super();
        this._dbCollection = dbCollection;
        this._cleanupProxy = this.cleanup.bind( this );
        this._timeout = null;
        this._options = {};
        this._options.path = options.path || '/';
        this._options.domain = options.domain || '';
        this._options.lifetime = options.lifetime || 60 * 30; // 30 minutes
        this._options.lifetime = options.lifetime || 60 * 60 * 48; // 2 days
        this._options.persistent = options.persistent || true;
        this._options.secure = options.secure || false;
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
    async getActiveSessions( startIndex?: number, limit: number = -1 ): Promise<Array<ISessionEntry>> {
        const results: Array<ISessionEntry> = await this._dbCollection.find( {} ).skip( startIndex! ).limit( limit ).toArray();
        return results;
    }

    /**
     * Clears the users session cookie so that its no longer tracked
     * @param sessionId The session ID to remove, if null then the currently authenticated session will be used
     * @param request
     * @param response
     */
    async clearSession( sessionId: string | null, request: http.ServerRequest, response: http.ServerResponse ): Promise<boolean> {
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
    async getSession( request: http.ServerRequest, response: http.ServerResponse | null ): Promise<Session | null> {
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
            session.open( sessionDB );

            // Adds / updates the DB with the new session
            await this._dbCollection.updateOne( { sessionId: session.sessionId }, session.save() );

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
     * @param shortTerm If true, we use the short term cookie. Otherwise the longer term one is used. (See session options)
     * @param response
     */
    async createSession( shortTerm: boolean, request: http.ServerRequest, response: http.ServerResponse ): Promise<Session> {
        const session = new Session( this.createID(), this._options );

        session.data.shortTerm = shortTerm;

        // Adds / updates the DB with the new session
        await this._dbCollection.insertOne( session.save() );

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
                const expiration: number = parseFloat( sessions[ i ].expiration!.toString() );

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
    private getIDFromRequest( req: http.ServerRequest ): string {
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


/**
 * A class to represent session data
 */
export class Session {
    _id: mongodb.ObjectID;

    /*
    * The unique ID of the session
    */
    sessionId: string;

    /*
    * Any custom data associated with the session
    */
    data: { shortTerm: boolean; };

    /**
     * The specific time when this session will expire
     */
    expiration: number;

    /**
     * The options of this session system
     */
    options: ISessionOptions;

    /**
     * Creates an instance of the session
     * @param sessionId The ID of the session
     * @param options The options associated with this session
     * @param data The data of the session in the database
     */
    constructor( sessionId: string, options: ISessionOptions ) {
        this.sessionId = sessionId;
        this.data = { shortTerm: true };
        this.options = options;
        this.expiration = ( new Date( Date.now() + options.lifetime! * 1000 ) ).getTime();
    }

    /**
     * Fills in the data of this session from the data saved in the database
     * @param data The data fetched from the database
     */
    open( data: ISessionEntry ) {
        this.sessionId = data.sessionId!;
        this.data = data.data;
        this.expiration = data.expiration!;
    }

    /**
     * Creates an object that represents this session to be saved in the database
     */
    save(): ISessionEntry {
        const data: ISessionEntry = {
            sessionId: this.sessionId,
            data: this.data,
            expiration: ( new Date( Date.now() + ( this.data.shortTerm! ? this.options.lifetime! : this.options.lifetimeExtended! ) * 1000 ) ).getTime()
        };
        return data;
    }

    private getHost( request: http.ServerRequest ) {
        if ( request.headers.host && ( request.headers.host as string ).indexOf( 'localhost' ) !== -1 )
            return '';
        if ( request.headers.host && request.headers.host != '' )
            return 'domain=.' + request.headers.host;

        return 'domain=' + this.options.domain
    }

    /**
     * This method returns the value to send in the Set-Cookie header which you should send with every request that goes back to the browser, e.g.
     * response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
     */
    getSetCookieHeaderValue( request: http.ServerRequest ) {
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