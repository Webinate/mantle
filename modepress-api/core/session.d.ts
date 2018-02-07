/// <reference types="node" />
import { ISession } from '../types/config/properties/i-session';
import { IUserEntry } from '../types/models/i-user-entry';
import { ISessionEntry } from '../types/models/i-session-entry';
import { ServerRequest } from 'http';
import { ObjectID } from 'mongodb';
import { User } from './user';
/**
 * A class to represent session data
 */
export declare class Session {
    user: User;
    _id: ObjectID;
    sessionId: string;
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
     */
    constructor(sessionId: string, options: ISession, userEntry: IUserEntry);
    /**
     * Fills in the data of this session from the data saved in the database
     * @param data The data fetched from the database
     */
    deserialize(data: ISessionEntry): void;
    /**
     * Creates an object that represents this session to be saved in the database
     */
    serialize(): ISessionEntry;
    private getHost(request);
    /**
     * This method returns the value to send in the Set-Cookie header which you should send with every request that goes back to the browser, e.g.
     * response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
     */
    getSetCookieHeaderValue(request: ServerRequest): any;
    /**
     * Converts from milliseconds to string, since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
     */
    private dateCookieString(ms);
    /**
     * Pads a string with 0's
     */
    private pad(n);
}
