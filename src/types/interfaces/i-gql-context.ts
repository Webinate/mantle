import { IServer } from '../config/properties/i-server';
import { ServerResponse } from 'http';
import { Request } from 'express';
import { IUserEntry } from '../models/i-user-entry';

export interface IGQLContext {
  server: IServer;
  req: Request;
  res: ServerResponse;
  verbose?: boolean;
  user?: IUserEntry<'server'>;
  isAdmin: boolean;
}
