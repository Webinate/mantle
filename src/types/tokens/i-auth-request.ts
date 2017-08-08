import { Request } from 'express';

declare module 'modepress' {

    /**
     * An interface used to describe requests that have been authenticated by a session id
     */
    export interface IAuthReq extends Request {
        _isAdmin: boolean;
        _verbose: boolean;
        _user: IUserEntry | null;
        _target: IUserEntry | null;
        body: any;
        headers: any;
        params: any;
        query: any;
    }
}