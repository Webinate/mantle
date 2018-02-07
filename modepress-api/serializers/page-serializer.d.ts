/// <reference types="express" />
import * as mongodb from 'mongodb';
import * as express from 'express';
import { Serializer } from './serializer';
import { IRenderOptions } from '../types/misc/i-render-options';
/**
 * Sets up a prerender server and saves the rendered html requests to mongodb.
 * These saved HTML documents can then be sent to web crawlers who cannot interpret javascript.
 */
export declare class PageSerializer extends Serializer {
    private renderQueryFlag;
    private expiration;
    private _options;
    private static crawlerUserAgents;
    private static extensionsToIgnore;
    /**
   * Creates a new instance of the email controller
   */
    constructor(options: IRenderOptions);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
     * Strips the html page of any script tags
     */
    private stripScripts(html);
    /**
     * Gets the URL of a request
     */
    getUrl(req: express.Request): string;
    /**
     * Fetches a page and strips it of all its script tags
     */
    private renderPage(url);
    /**
     * Determines if the request comes from a bot. If so, a prerendered page is sent back which excludes any script tags
     */
    processBotRequest(req: express.Request, res: express.Response, next: Function): Promise<any>;
    /**
     * Determines if the request comes from a bot
     */
    private shouldShowPrerenderedPage(req);
    /**
     * Attempts to find a render by ID and then display it back to the user
     */
    private previewRender(req, res);
    /**
     * Attempts to remove a render by ID
     */
    private removeRender(req, res);
    /**
     * Returns an array of IPost items
     */
    private getRenders(req, res);
    /**
     * Removes all cache items from the db
     */
    private clearRenders(req, res);
}
