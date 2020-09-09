import { Router } from '../../src/routers/router';
import { AuthRouter } from '../../src/routers/auth';
import { FileRouter } from '../../src/routers/file';
import * as mongodb from 'mongodb';
import * as express from 'express';

/**
 * Create a basic controller
 */
export default class MainController extends Router {
  constructor() {
    super();
  }

  async initialize(app: express.Express, db: mongodb.Db) {
    const api = '/api';

    await Promise.all([
      super.initialize(app, db),

      new AuthRouter({
        rootPath: api,
        accountRedirectURL: '/message',
        activateAccountUrl: '/auth/activate-account',
        passwordResetURL: '/reset-password'
      }).initialize(app, db),

      new FileRouter({
        rootPath: '',
        cacheLifetime: 60000
      }).initialize(app, db)
    ]);

    return this;
  }
}
