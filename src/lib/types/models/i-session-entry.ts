import { IModelEntry } from './i-model-entry';

/*
 * An interface to describe the data stored in the database from the sessions
 */
export interface ISessionEntry extends IModelEntry {
  _id?: any;
  sessionId: string;
  data: any;
  expiration: number;
}
