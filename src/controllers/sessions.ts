import { IConfig } from '../types/config/i-config';
import { ISession } from '../types/config/properties/i-session';
import { IUserEntry } from '../types/models/i-user-entry';
import { ISessionEntry } from '../types/models/i-session-entry';
import { ServerResponse, IncomingMessage } from 'http';
import { Collection, Db, ObjectId } from 'mongodb';
import { Session } from '../core/session';
import Controller from './controller';
import { Collections } from '../core/enums';

/**
 * A class that manages session data for active users
 */
export class SessionsController extends Controller {
  private _sessions: Collection<ISessionEntry<'server' | 'client'>>;
  private _users: Collection<IUserEntry<'server'>>;
  private _timeout: NodeJS.Timer | null;
  private _cleanupProxy: any;
  private _session: ISession;

  /**
   * Creates an instance of a session manager
   */
  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize(db: Db) {
    this._session = {
      path: this._config.sessionSettings.path || '/',
      domain: this._config.sessionSettings.domain || '',
      lifetime: this._config.sessionSettings.lifetime || 60 * 30, // 30 minutes
      persistent: this._config.sessionSettings.persistent || true,
      secure: this._config.sessionSettings.secure || false
    };

    this._sessions = await db.collection(Collections.sessions);
    this._users = await db.collection(Collections.users);
    this._cleanupProxy = this.cleanup.bind(this);
    this._timeout = null;
    return this;
  }

  /**
   * Gets an array of all active sessions
   */
  async numActiveSessions() {
    const result = await this._sessions.count({});
    return result;
  }

  /**
   * Gets an array of all active sessions
   * @param startIndex
   * @param limit
   */
  async getActiveSessions(startIndex: number = 0, limit: number = -1) {
    const results = await this._sessions
      .find({})
      .skip(startIndex)
      .limit(limit)
      .toArray();
    return results;
  }

  /**
   * Clears the users session cookie so that its no longer tracked
   * @param sessionId The session ID to remove, if null then the currently authenticated session will be used
   * @param request
   * @param response
   */
  async clearSession(sessionId: string | null, request: IncomingMessage, response: ServerResponse) {
    // Check if the request has a valid session ID
    const sId: string = sessionId || this.getIDFromRequest(request);

    if (sId !== '') {
      // We have a session ID, lets try to find it in the DB
      await this._sessions
        .find({ sessionId: sId } as ISessionEntry<'server'>)
        .limit(1)
        .next();

      // Create a new session
      const session = new Session(sId, this._session, null!);
      session.expiration = -1;

      // Deletes the session entry
      await this._sessions.deleteOne({ sessionId: session.sessionId } as ISessionEntry<'server'>);

      this.emit('sessionRemoved', sId);

      // Set the session cookie header
      this.setSessionHeader(session, request, response);

      // Resolve the request
      return true;
    } else return true;
  }

  /**
   * Gets and initializes a session by its id
   */
  async getSessionById(sessionId: string) {
    // We have a session ID, lets try to find it in the DB
    const sessionEntry = await this._sessions
      .find({ sessionId: sessionId })
      .limit(1)
      .next();

    // Cant seem to find any session - so create a new one
    if (!sessionEntry) return null;

    const userEntry = await this._users
      .find({ sessionId: sessionId } as IUserEntry<'server'>)
      .limit(1)
      .next();

    if (!userEntry) return null;

    // Create a new session
    const session = new Session(sessionId, this._session, userEntry);
    session.deserialize(sessionEntry as ISessionEntry<'server'>);

    return session;
  }

  /**
   * Attempts to get a session from the request object of the client
   */
  async getSession(request: IncomingMessage) {
    // Check if the request has a valid session ID
    const sessionId: string = this.getIDFromRequest(request);

    if (sessionId !== '') {
      const session = await this.getSessionById(sessionId);

      if (!session) return null;

      // make sure a timeout is pending for the expired session reaper
      if (!this._timeout) this._timeout = global.setTimeout(this._cleanupProxy, 60000);

      // Resolve the request
      return session;
    } else return null;
  }

  async setSessionHeader(session: Session, request: IncomingMessage, response: ServerResponse) {
    response.setHeader('Set-Cookie', session.getSetCookieHeaderValue(request));

    // Adds / updates the DB with the new session
    await this._sessions.updateOne({ sessionId: session.sessionId }, { $set: session.serialize() });
  }

  /**
   * Attempts to create a session from the request object of the client
   */
  async createSession(request: IncomingMessage, response: ServerResponse, userId: string | ObjectId) {
    const sessionId = this.createID();
    const userEntry = await this._users.findOne({ _id: new ObjectId(userId) } as IUserEntry<'server'>);

    if (!userEntry) throw new Error('Could not find the user in the database, please make sure its setup correctly');

    // Sets the user session id
    await this._users.updateOne({ _id: new ObjectId(userId) } as IUserEntry<'server'>, {
      $set: { sessionId: sessionId } as ISessionEntry<'server'>
    });

    const session = new Session(sessionId, this._session, userEntry);

    // Adds a new session entry
    await this._sessions.insertOne(session.serialize() as ISessionEntry<'server'>);
    this.setSessionHeader(session, request, response);
    return session;
  }

  /**
   * Each time a session is created, a timer is started to check all sessions in the DB.
   * Once the lifetime of a session is up its then removed from the DB and we check for any remaining sessions.
   * @param force If true, this will force a cleanup instead of waiting on the next timer
   */
  async cleanup(force: boolean = false) {
    const now: number = +new Date();
    let next: number = Infinity;
    this._timeout = null;

    try {
      // TODO: We need to replace the findToken with one where mongo looks at the conditions
      const findToken = {};

      const sessions = await this._sessions.find(findToken).toArray();

      // Remove query
      const toRemoveQuery: { $or: ISessionEntry<'server'>[] } = { $or: [] };

      for (let i = 0, l = sessions.length; i < l; i++) {
        const expiration: number = parseFloat(sessions[i].expiration.toString());

        // If the session's time is up
        if (expiration < now || force)
          toRemoveQuery.$or.push({ _id: sessions[i]._id, sessionId: sessions[i].sessionId } as ISessionEntry<'server'>);
        // Session time is not up, but may be the next time target
        else next = next < expiration ? next : expiration;
      }

      // Check if we need to remove sessions - if we do, then remove them :)
      if (toRemoveQuery.$or.length > 0) {
        await this._sessions.deleteMany(toRemoveQuery);
        for (let i = 0, l = toRemoveQuery.$or.length; i < l; i++)
          this.emit('sessionRemoved', toRemoveQuery.$or[i].sessionId);

        if (next < Infinity) this._timeout = global.setTimeout(this._cleanupProxy, next - +new Date() + 1000);
      } else {
        if (next < Infinity) this._timeout = global.setTimeout(this._cleanupProxy, next - +new Date() + 1000);
      }
    } catch (err) {
      // If an error occurs, just try again in 2 minutes
      this._timeout = global.setTimeout(this._cleanupProxy, 120000);
    }
  }

  /**
   * Looks at the headers from the HTTP request to determine if a session cookie has been asssigned and returns the ID.
   * @param req
   * @returns The ID of the user session, or an empty string
   */
  private getIDFromRequest(req: IncomingMessage) {
    let m: RegExpExecArray | null;

    // look for an existing SID in the Cookie header for which we have a session
    if (req.headers.cookie && (m = /SID=([^ ,;]*)/.exec(req.headers.cookie as string))) return m[1];
    else return '';
  }

  /**
   * Creates a random session ID.
   * The ID is a pseude-random ASCII string which contains at least the specified number of bits of entropy (64 in this case)
   * the return value is a string of length [bits/6] of characters from the base64 alphabet
   * @returns A user session ID
   */
  private createID() {
    let bits: number = 64;

    let chars: string, rand: number, i: number, ret: string;
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    ret = '';

    // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
    while (bits > 0) {
      rand = Math.floor(Math.random() * 0x100000000); // 32-bit integer

      // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
      for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) ret += chars[0x3f & (rand >>> i)];
    }

    return ret;
  }
}
