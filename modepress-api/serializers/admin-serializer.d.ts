/// <reference types="express" />
import express = require('express');
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
import * as mongodb from 'mongodb';
/**
 * Main class to use for managing users
 */
export declare class AdminSerializer extends Serializer {
    private _options;
    private _userController;
    constructor(options: IBaseControler);
    /**
   * Called to initialize this controller and its related database objects
   */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
   * Attempts to send the webmaster an email message
   */
    private messageWebmaster(req, res);
}
