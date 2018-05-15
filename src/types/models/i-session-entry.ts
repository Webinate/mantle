import { IModelEntry } from './i-model-entry';

/*
 * An interface to describe the data stored in the database from the sessions
 */
export interface ISessionEntry<T extends 'client' | 'server'> extends IModelEntry<T> {
  sessionId: string;
  data: any;
  expiration: number;
}
