declare namespace Modepress {
    /*
     * An interface to describe the data stored in the database from the sessions
     */
    export interface ISessionEntry {
        _id?: any;
        sessionId?: string;
        data?: any;
        expiration?: number;
    }
}