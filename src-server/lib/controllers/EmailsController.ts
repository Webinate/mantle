import express = require("express");
import controllerModule = require("./Controller");
import bodyParser = require('body-parser');
import {UsersService} from "../UsersService"
import {IConfig} from "../Config"

export default class EmailsController extends controllerModule.Controller
{
	/**
	* Creates a new instance of the email controller
	* @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(config: IConfig, e: express.Express)
	{
        super(null);
        
		var router = express.Router();
		router.use(bodyParser.urlencoded({ 'extended': true }));
		router.use(bodyParser.json());
		router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
		
		// Filter the post requests
		router.post("/", this.onPost.bind(this));
		
		// Register the path
		e.use("/api/message-admin", router);
	}
	
	/**
	* Called whenever a post request is caught by this controller
	* @param {express.Request} req The request object
	* @param {express.Response} res The response object
	* @param {Function} next
	*/
	protected onPost(req: express.Request, res: express.Response, next: Function): any 
	{
		// Set the content type
        res.setHeader('Content-Type', 'application/json');

        var message: string = `Hello admin,
			We have received a message from ${(<modepress.IMessage>req.body).name}:

			${(<modepress.IMessage>req.body).message}

			Email: ${(<modepress.IMessage>req.body).email}
			Phone: ${(<modepress.IMessage>req.body).phone}
			Website: ${(<modepress.IMessage>req.body).website}`;

        UsersService.getSingleton().sendAdminEmail(message).then(function(body)
        {
            res.end(body);

        }).catch(function (err)
        {
            return res.end(JSON.stringify(<UsersInterface.IResponse>{ message: err.toString(), error: true }));
        });
	}
}