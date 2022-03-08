import { ISimpleResponse } from '../types';
import { Router as ExpressRouter, Request, Response, urlencoded, json, Express, RequestHandler } from 'express';
import ControllerFactory from '../core/controller-factory';
import { UsersController } from '../controllers/users';
import { Router } from './router';
import { j200 } from '../decorators/responses';
import * as compression from 'compression';
import { error as logError } from '../utils/logger';
import * as mongodb from 'mongodb';

/**
 * Main class to use for managing user authentication
 */
export class AuthRouter extends Router {
  private _rootPath: string;
  private _userController: UsersController;

  /**
   * Creates an instance of the user manager
   */
  constructor(rootPath: string) {
    super();
    this._rootPath = rootPath;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: Express, db: mongodb.Db) {
    this._userController = ControllerFactory.get('users');

    // Setup the rest calls
    const router = ExpressRouter();
    router.use(compression());
    router.use(urlencoded({ extended: true }) as RequestHandler);
    router.use(json() as RequestHandler);
    router.use(json({ type: 'application/vnd.api+json' }) as RequestHandler);

    router.get('/activate-account', this.activateAccount.bind(this));
    router.put('/password-reset', this.passwordReset.bind(this));

    // Register the path
    e.use((this._rootPath || '') + '/auth', router);

    await super.initialize(e, db);
    return this;
  }

  /**
   * Activates the user's account
   */
  private async activateAccount(req: Request, res: Response) {
    const redirectURL = req.query.url;

    try {
      // Check the user's activation and forward them onto the admin message page
      await this._userController.checkActivation(req.query.user as string, req.query.key as string);
      res.setHeader('Content-Type', 'application/json');
      res.redirect(`${redirectURL}?message=${encodeURIComponent('Your account has been activated!')}&status=success`);
    } catch (error) {
      logError(error.toString());
      res.setHeader('Content-Type', 'application/json');
      res.status(302);
      res.redirect(`${redirectURL}?message=${encodeURIComponent(error.message)}&status=error`);
    }
  }

  /**
   * resets the password if the user has a valid password token
   */
  @j200()
  private async passwordReset(req: Request, res: Response) {
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
