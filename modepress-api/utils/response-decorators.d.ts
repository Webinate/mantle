/// <reference types="express" />
import { IResponse } from '../types/tokens/standard-tokens';
import * as express from 'express';
/**
 * A decorator for transforming an async express function handler.
 * Transforms the promise's response into a serialized json with
 * a 200 response code.
 * @param errCode The type of error code to raise for errors
 */
export declare function j200(code?: number, errCode?: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Helper function to return a status 200 json object of type T
 */
export declare function okJson<T extends IResponse>(data: T, res: express.Response): void;
/**
 * Helper function to return a status 500 json object of type T
 */
export declare function errJson(err: Error, res: express.Response): void;
