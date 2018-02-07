/// <reference types="node" />
import { IConfig } from '../types/config/i-config';
import { ISessionEntry } from '../types/models/i-session-entry';
import { ServerRequest, ServerResponse } from 'http';
import { Db } from 'mongodb';
import { Session } from '../core/session';
import Controller from './controller';
/**
* A class that manages session data for active users
 */
export declare class SessionsController extends Controller {
    private _sessions;
    private _users;
    private _timeout;
    private _cleanupProxy;
    private _session;
    /**
     * Creates an instance of a session manager
     */
    constructor(config: IConfig);
    /**
     * Initializes the controller
     * @param db The mongo db
     */
    initialize(db: Db): Promise<void>;
    /**
     * Gets an array of all active sessions
     */
    numActiveSessions(): Promise<number>;
    /**
     * Gets an array of all active sessions
     * @param startIndex
     * @param limit
     */
    getActiveSessions(startIndex?: number, limit?: number): Promise<ISessionEntry[]>;
    /**
     * Clears the users session cookie so that its no longer tracked
     * @param sessionId The session ID to remove, if null then the currently authenticated session will be used
     * @param request
     * @param response
     */
    clearSession(sessionId: string | null, request: ServerRequest, response: ServerResponse): Promise<boolean>;
    /**
     * Gets and initializes a session by its id
     */
    getSessionById(sessionId: string): Promise<Session | null>;
    /**
     * Attempts to get a session from the request object of the client
     */
    getSession(request: ServerRequest): Promise<Session | null>;
    setSessionHeader(session: Session, request: ServerRequest, response: ServerResponse): Promise<void>;
    /**
     * Attempts to create a session from the request object of the client
     */
    createSession(request: ServerRequest, response: ServerResponse, userId: string): Promise<Session>;
    /**
     * Each time a session is created, a timer is started to check all sessions in the DB.
     * Once the lifetime of a session is up its then removed from the DB and we check for any remaining sessions.
     * @param force If true, this will force a cleanup instead of waiting on the next timer
     */
    cleanup(force?: boolean): Promise<void>;
    /**
     * Looks at the headers from the HTTP request to determine if a session cookie has been asssigned and returns the ID.
     * @param req
     * @returns The ID of the user session, or an empty string
     */
    private getIDFromRequest(req);
    /**
     * Creates a random session ID.
     * The ID is a pseude-random ASCII string which contains at least the specified number of bits of entropy (64 in this case)
     * the return value is a string of length [bits/6] of characters from the base64 alphabet
     * @returns A user session ID
     */
    private createID();
}
