export interface IUserEntry {
    _id?: any;
    username: string;
    email: string;
    password: string;
    registerKey: string;
    sessionId: string;
    avatar: string;
    createdOn: number;
    lastLoggedIn: number;
    privileges: number;
    passwordTag: string;
    meta: any;
}
