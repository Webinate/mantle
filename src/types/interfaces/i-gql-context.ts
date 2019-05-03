import { IServer, IClient } from '../config/properties/i-client';
import { ServerResponse } from 'http';
import { Request } from 'express';

export interface IGQLContext {
  server: IServer;
  client: IClient;
  req: Request;
  res: ServerResponse;
  verbose?: boolean;
}
