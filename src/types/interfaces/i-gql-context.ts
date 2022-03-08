import { IServer } from '../config/properties/i-server';
import { IncomingMessage, ServerResponse } from 'http';
import { IUserEntry } from '../models/i-user-entry';

export interface IGQLContext extends IncomingMessage {
  server: IServer;
  res: ServerResponse;
  verbose?: boolean;
  user?: IUserEntry<'server'>;
  isAdmin: boolean;
}
