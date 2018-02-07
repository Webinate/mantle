/// <reference types="express" />
import { IBaseControler } from '../types/misc/i-base-controller';
import express = require('express');
import { Serializer } from './serializer';
import * as mongodb from 'mongodb';
/**
 * Main class to use for managing users
 */
export declare class StatsSerializer extends Serializer {
    private _options;
    private _userController;
    private _statController;
    /**
       * Creates an instance of the user manager
       * @param e The express app
       * @param The config options of this manager
       */
    constructor(options: IBaseControler);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
     * Makes sure the target user exists and the numeric value specified is valid
     */
    private verifyTargetValue(req, res, next);
    /**
     * Updates the target user's api calls
     */
    private updateCalls(req, res);
    /**
     * Updates the target user's memory usage
     */
    private updateMemory(req, res);
    /**
     * Updates the target user's allocated api calls
     */
    private updateAllocatedCalls(req, res);
    /**
     * Updates the target user's allocated memory
     */
    private updateAllocatedMemory(req, res);
    /**
     * Fetches the statistic information for the specified user
     */
    private getStats(req, res);
    /**
     * Creates a new user stat entry. This is usually done for you when creating a new user
     */
    private createStats(req, res);
}
