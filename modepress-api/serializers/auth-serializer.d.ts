/// <reference types="express" />
import express = require('express');
import { Serializer } from './serializer';
import { IAuthOptions } from '../types/misc/i-auth-options';
import * as mongodb from 'mongodb';
/**
 * Main class to use for managing user authentication
 */
export declare class AuthSerializer extends Serializer {
    private _options;
    private _userController;
    /**
       * Creates an instance of the user manager
       */
    constructor(options: IAuthOptions);
    /**
   * Called to initialize this controller and its related database objects
   */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
       * Activates the user's account
       */
    private activateAccount(req, res);
    /**
       * Resends the activation link to the user
       */
    private resendActivation(req, res);
    /**
   * Resends the activation link to the user
   */
    private requestPasswordReset(req, res);
    /**
   * resets the password if the user has a valid password token
   */
    private passwordReset(req, res);
    /**
       * Approves a user's activation code so they can login without email validation
       */
    private approveActivation(req, res);
    /**
       * Attempts to log the user in. Expects the username, password and rememberMe parameters be set.
       */
    private login(req, res);
    /**
       * Attempts to log the user out
       */
    private logout(req, res);
    /**
       * Attempts to register a new user
       */
    private register(req, res);
    /**
       * Checks to see if the current session is logged in. If the user is, it will be returned redacted. You can specify the 'verbose' query parameter
       */
    private authenticated(req, res);
}
