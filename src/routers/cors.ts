﻿import { error as logError } from '../utils/logger';
import { Router } from './router';
import * as express from 'express';
import * as mongodb from 'mongodb';
import { IBaseControler } from '../types/misc/i-base-controller';

/**
 * Checks all incomming requests to see if they are CORS approved
 */
export class CORSRouter extends Router {
  private _approvedDomains: string[];

  /**
   * Creates an instance of the user manager
   */
  constructor(approvedDomains: string[], options: IBaseControler) {
    super(null);
    this._approvedDomains = approvedDomains;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: express.Express, db: mongodb.Db) {
    const matches: Array<RegExp> = [];
    for (let i = 0, l = this._approvedDomains.length; i < l; i++) matches.push(new RegExp(this._approvedDomains[i]));

    // Approves the valid domains for CORS requests
    e.use(function(req: express.Request, res: express.Response, next: Function) {
      if (req.headers.origin) {
        let matched = false;
        for (let m = 0, l = matches.length; m < l; m++)
          if ((req.headers.origin! as string).match(matches[m])) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin as string);
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.setHeader(
              'Access-Control-Allow-Headers',
              'Content-Type, Authorization, Content-Length, X-Requested-With, X-Mime-Type, X-File-Name, Cache-Control'
            );
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            matched = true;
            break;
          }

        if (!matched) logError(`${req.headers.origin} Does not have permission. Add it to the allowed `);
      }

      if (req.method === 'OPTIONS') {
        res.status(200);
        res.end();
      } else next();
    });

    await super.initialize(e, db);
    return this;
  }
}
