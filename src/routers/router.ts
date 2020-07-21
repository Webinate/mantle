import * as mongodb from 'mongodb';
import * as express from 'express';

export class Router {
  constructor() {}

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: express.Express, db: mongodb.Db) {
    return this;
  }
}
