import { IModelEntry } from './i-model-entry';
export interface ISessionEntry extends IModelEntry {
    _id?: any;
    sessionId: string;
    data: any;
    expiration: number;
}
