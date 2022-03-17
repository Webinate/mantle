import { Db } from 'mongodb';
import { Express } from 'express';

export class Router {
  constructor() {}

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: Express, db: Db) {
    return this;
  }
}
