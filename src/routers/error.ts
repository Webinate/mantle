'use strict';

import { ISimpleResponse } from '../types/tokens/standard-tokens';
import { Router } from './router';
import express = require('express');
import * as mongodb from 'mongodb';

export class ErrorRouter extends Router {
  constructor() {
    super();
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: express.Express, db: mongodb.Db) {
    // Handle all errors the same way
    e.use(function(err: Error, req: express.Request, res: express.Response, next: Function) {
      res.setHeader('Content-Type', 'application/json');
      const response: ISimpleResponse = { message: err.toString() };
      return res.end(JSON.stringify(response));
    });

    await super.initialize(e, db);
    return this;
  }
}
