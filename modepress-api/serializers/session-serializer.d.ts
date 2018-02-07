/// <reference types="express" />
import express = require('express');
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
import * as mongodb from 'mongodb';
/**
 * Main class to use for managing users
 */
export declare class SessionSerializer extends Serializer {
    private _options;
    private _sessionController;
    /**
       * Creates an instance of the user manager
       */
    constructor(options: IBaseControler);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
       * Gets a list of active sessions. You can limit the haul by specifying the 'index' and 'limit' query parameters.
       */
    private getSessions(req, res);
    /**
       * Resends the activation link to the user
       */
    private deleteSession(req, res);
}
