import { ISimpleResponse } from '../types/tokens/standard-tokens';
import express = require('express');
import bodyParser = require('body-parser');
import ControllerFactory from '../core/controller-factory';
import { UsersController } from '../controllers/users';
import { Router } from './router';
import { j200 } from '../decorators/responses';
import * as compression from 'compression';
import { error as logError } from '../utils/logger';
import { IAuthOptions } from '../types/misc/i-auth-options';
import * as mongodb from 'mongodb';
import Factory from '../core/model-factory';

/**
 * Main class to use for managing user authentication
 */
export class AuthRouter extends Router {
  private _options: IAuthOptions;
  private _userController: UsersController;

  /**
   * Creates an instance of the user manager
   */
  constructor(options: IAuthOptions) {
    super([Factory.get('users')]);
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: express.Express, db: mongodb.Db) {
    this._userController = ControllerFactory.get('users');

    if (!this._options.accountRedirectURL)
      throw new Error(
        `When using an 'auth' controller, you must specifiy the 'accountRedirectURL' property. This is the url to re-direct to when a user has attempted to activate their account. The URL is appended with the query parameters 'message' and 'status' so that the response can be portrayed to the user.`
      );
    if (!this._options.activateAccountUrl)
      throw new Error(
        `When using an 'auth' controller, you must specifiy the 'activateAccountUrl' property. This is the url sent to users when they register. The link should resolve to your {host}/auth/activate-account`
      );
    if (!this._options.passwordResetURL)
      throw new Error(
        `When using an 'auth' controller, you must specifiy the 'passwordResetURL' property. This is the URL sent to users emails for when their password is reset. This URL should resolve to a page with a form that allows users to reset their password. The form can post to the auth/password-reset endpoint to start the process.`
      );

    // Setup the rest calls
    const router = express.Router();
    router.use(compression());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(bodyParser.json());
    router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

    router.get('/activate-account', this.activateAccount.bind(this));
    router.put('/password-reset', this.passwordReset.bind(this));

    // Register the path
    e.use((this._options.rootPath || '') + '/auth', router);

    await super.initialize(e, db);
    return this;
  }

  /**
   * Activates the user's account
   */
  private async activateAccount(req: express.Request, res: express.Response) {
    const redirectURL = this._options.accountRedirectURL;

    try {
      // Check the user's activation and forward them onto the admin message page
      await this._userController.checkActivation(req.query.user, req.query.key);
      res.setHeader('Content-Type', 'application/json');
      res.redirect(
        `${redirectURL}?message=${encodeURIComponent(
          'Your account has been activated!'
        )}&status=success&origin=${encodeURIComponent(req.query.origin)}`
      );
    } catch (error) {
      logError(error.toString());
      res.setHeader('Content-Type', 'application/json');
      res.status(302);
      res.redirect(
        `${redirectURL}?message=${encodeURIComponent(error.message)}&status=error&origin=${encodeURIComponent(
          req.query.origin
        )}`
      );
    }
  }

  /**
   * resets the password if the user has a valid password token
   */
  @j200()
  private async passwordReset(req: express.Request, res: express.Response) {
    if (!req.body) throw new Error('Expecting body content and found none');
    if (!req.body.user) throw new Error('Please specify a user');
    if (!req.body.key) throw new Error('Please specify a key');
    if (!req.body.password) throw new Error('Please specify a password');

    // Check the user's activation and forward them onto the admin message page
    await this._userController.resetPassword(req.body.user, req.body.key, req.body.password);
    const response: ISimpleResponse = { message: 'Your password has been reset' };
    return response;
  }
}
