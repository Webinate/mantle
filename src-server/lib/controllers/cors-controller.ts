import * as mongodb from "mongodb";
import * as http from "http";
import {IServer} from "modepress-api";
import {Controller} from "./controller"
import express = require("express");

/**
* Checks all incomming requests to see if they are CORS approved
*/
export default class CORSController extends Controller
{
    /**
	* Creates an instance of the user manager
	* @param {mongodb.Collection} userCollection The mongo collection that stores the users
	* @param {mongodb.Collection} sessionCollection The mongo collection that stores the session data
	* @param {def.IConfig} The config options of this manager
	*/
    constructor(e: express.Express, config: IServer)
    {
        super(null);

        var matches: Array<RegExp> = [];
        for (var i = 0, l = config.approvedDomains.length; i < l; i++)
            matches.push(new RegExp(config.approvedDomains[i]));

        // Approves the valid domains for CORS requests
        e.use(function (req: express.Request, res: express.Response, next: Function)
        {
            if ((<http.ServerRequest>req).headers.origin)
            {
                var matched = false;
                for (var m = 0, l = matches.length; m < l; m++)
                    if ((<http.ServerRequest>req).headers.origin.match(matches[m]))
                    {
                        res.setHeader('Access-Control-Allow-Origin', (<http.ServerRequest>req).headers.origin);
                        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Mime-Type, X-File-Name, Cache-Control');
                        res.setHeader("Access-Control-Allow-Credentials", "true");
                        matched = true;
                        break;
                    }

                if (!matched)
                    console.log(`${(<http.ServerRequest>req).headers.origin} Does not have permission. Add it to the allowed `);
            }

            if (req.method === 'OPTIONS')
            {
                res.status(200);
                res.end();
            }
            else
                next();
        });
    }
}