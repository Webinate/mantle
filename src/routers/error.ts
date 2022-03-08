'use strict';

import { ISimpleResponse } from '../types';
import { Router } from './router';
import { Express, Request, Response } from 'express';
import { Db } from 'mongodb';

export class ErrorRouter extends Router {
  constructor() {
    super();
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: Express, db: Db) {
    // Handle all errors the same way
    e.use(function(err: Error, req: Request, res: Response, next: Function) {
      res.setHeader('Content-Type', 'application/json');
      const response: ISimpleResponse = { message: err.toString() };
      return res.end(JSON.stringify(response));
    });

    await super.initialize(e, db);
    return this;
  }
}
