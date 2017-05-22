import { IUserEntry } from '../models/i-user-entry';

/**
 * An interface used to describe requests that have been authenticated by a session id
 */
export interface IAuthReq extends Express.Request {
    _isAdmin: boolean;
    _verbose: boolean;
    _user: IUserEntry | null;
    _target: IUserEntry | null;
    body: any;
    headers: any;
    params: any;
    query: any;
}