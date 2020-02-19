import { Controller, routers } from '../../src/index';

/**
 * Create a basic controller
 */
export default class MainController extends Controller {
  constructor(client) {
    super(null);
  }

  async initialize(app, db) {
    const api = '/api';

    await Promise.all([
      super.initialize(app, db),

      new routers.auth({
        rootPath: api,
        accountRedirectURL: '/message',
        activateAccountUrl: '/auth/activate-account',
        passwordResetURL: '/reset-password'
      }).initialize(app, db),

      new routers.user({
        rootPath: api
      }).initialize(app, db),

      new routers.comments({
        rootPath: api
      }).initialize(app, db),

      new routers.posts({
        rootPath: api
      }).initialize(app, db),

      // new serializers.stats( {
      //   rootPath: ''
      // } ).initialize( app, db ),

      new routers.file({
        rootPath: '',
        cacheLifetime: 60000
      }).initialize(app, db),

      new routers.volume({
        rootPath: ''
      }).initialize(app, db),

      // new routers.categories( {
      //   rootPath: api
      // } ).initialize( app, db ),

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
