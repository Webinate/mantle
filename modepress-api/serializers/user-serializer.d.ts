/// <reference types="express" />
import express = require('express');
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
import * as mongodb from 'mongodb';
/**
 * Main class to use for managing user data
 */
export declare class UserSerializer extends Serializer {
    private _options;
    private _userController;
    /**
       * Creates an instance of the user manager
       */
    constructor(options: IBaseControler);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
   * Gets a specific user by username or email - the 'username' parameter must be set. Some of the user data will be obscured unless the verbose parameter
     * is specified. Specify the verbose=true parameter in order to get all user data.
   */
    private getUser(req, res);
    /**
   * Gets a list of users. You can limit the haul by specifying the 'index' and 'limit' query parameters.
     * Also specify the verbose=true parameter in order to get all user data. You can also filter usernames with the
     * search query
   */
    private getUsers(req, res);
    /**
     * Sets a user's meta data
   */
    private setData(req, res);
    /**
   * Sets a user's meta value
   */
    private setVal(req, res);
    /**
   * Gets a user's meta value
   */
    private getVal(req, res);
    /**
   * Gets a user's meta data
   */
    private getData(req, res);
    /**
       * Removes a user from the database
       */
    private removeUser(req, res);
    /**
       * Allows an admin to create a new user without registration
       */
    private createUser(req, res);
}
