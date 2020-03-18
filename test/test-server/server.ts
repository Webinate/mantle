import { Controller, routers } from '../../src/index';
import * as mongodb from 'mongodb';
import * as express from 'express';

/**
 * Create a basic controller
 */
export default class MainController extends Controller {
  constructor() {
    super(null);
  }

  async initialize(app: express.Express, db: mongodb.Db) {
    const api = '/api';

    await Promise.all([
      super.initialize(app, db),

      new routers.auth({
        rootPath: api,
        accountRedirectURL: '/message',
        activateAccountUrl: '/auth/activate-account',
        passwordResetURL: '/reset-password'
      }).initialize(app, db),

      new routers.comments({
        rootPath: api
      }).initialize(app, db),

      new routers.posts({
        rootPath: api
      }).initialize(app, db),

      new routers.file({
        rootPath: '',
        cacheLifetime: 60000
      }).initialize(app, db),

      new routers.volume({
        rootPath: ''
      }).initialize(app, db),

      new routers.templates({
        rootPath: api
      }).initialize(app, db),

      new routers.documents({
        rootPath: api
      }).initialize(app, db)
    ]);

    return this;
  }
}
